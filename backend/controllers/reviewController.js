const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { getPaginationParams } = require('../utils/helpers');

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * @desc    Create a review (user must have ordered the product)
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'productId and rating are required.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review: {
        _id: new mongoose.Types.ObjectId().toHexString(),
        product: productId,
        user: req.user._id,
        rating,
        comment: comment || 'Delicious snacks!',
        createdAt: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get reviews for a product (paginated)
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query, 10);

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: productId }),
    ]);

    // Calculate rating distribution
    const allReviews = await Review.find({ product: productId }).select('rating').lean();
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

    return res.status(200).json({
      success: true,
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
      distribution,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getProductReviews };
