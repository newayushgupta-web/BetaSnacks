const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { getPaginationParams } = require('../utils/helpers');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalProducts,
      revenueAgg,
      monthlyRevenueAgg,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'preparing', 'ready', 'out-for-delivery'] } }),
      Order.countDocuments({ status: 'delivered' }),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isAvailable: true }),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: 'delivered', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, monthlyRevenue: { $sum: '$total' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean(),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.name' }, sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const monthlyRevenue = monthlyRevenueAgg[0]?.monthlyRevenue || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        monthlyRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalCustomers,
        totalProducts,
      },
      recentOrders,
      topProducts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all orders (admin) — paginated, filterable, searchable
 * @route   GET /api/admin/orders
 * @access  Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query, 20);
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;

    if (search) {
      // Search by orderNumber or customer name via lookup
      const matchingUsers = await User.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all customers (admin) — paginated with order stats
 * @route   GET /api/admin/customers
 * @access  Admin
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query, 20);
    const { search } = req.query;

    const filter = { role: 'customer' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    // Enrich with order count and total spent
    const enriched = await Promise.all(
      customers.map(async (customer) => {
        const [orderCount, spendAgg] = await Promise.all([
          Order.countDocuments({ user: customer._id }),
          Order.aggregate([
            { $match: { user: customer._id, status: 'delivered' } },
            { $group: { _id: null, totalSpent: { $sum: '$total' } } },
          ]),
        ]);
        return {
          ...customer,
          orderCount,
          totalSpent: spendAgg[0]?.totalSpent || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      customers: enriched,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get analytics data
 * @route   GET /api/admin/analytics
 * @access  Admin
 */
const getAnalytics = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Monthly revenue for last 6 months
    const monthlySales = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category-wise sales
    const categorySales = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$category._id',
          name: { $first: '$category.name' },
          icon: { $first: '$category.icon' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Hourly order distribution
    const hourlyDistribution = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      monthlySales,
      categorySales,
      hourlyDistribution,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, getAllOrders, getAllCustomers, getAnalytics };
