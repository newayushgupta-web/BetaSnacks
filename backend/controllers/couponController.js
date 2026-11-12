const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const { applyCouponDiscount } = require('../utils/helpers');

const isDbReady = () => mongoose.connection.readyState === 1;

const fallbackCoupons = [
  {
    _id: 'coupon_1',
    code: 'BETASNACKS20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 199,
    maxDiscount: 100,
    isActive: true,
    description: '20% OFF on gourmet orders above ₹199',
  },
  {
    _id: 'coupon_2',
    code: 'WELCOME50',
    type: 'flat',
    value: 50,
    minOrderAmount: 149,
    maxDiscount: 50,
    isActive: true,
    description: 'Flat ₹50 OFF for welcome snacks',
  },
  {
    _id: 'coupon_3',
    code: 'TASTY100',
    type: 'flat',
    value: 100,
    minOrderAmount: 499,
    maxDiscount: 100,
    isActive: true,
    description: 'Flat ₹100 OFF on party orders above ₹499',
  },
];

/**
 * @desc    Validate a coupon against an order amount
 * @route   POST /api/coupons/validate
 * @access  Private
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || orderAmount === undefined) {
      return res.status(400).json({ success: false, message: 'code and orderAmount are required.' });
    }

    const cleanCode = code.toUpperCase().trim();
    let coupon = null;

    if (isDbReady()) {
      try {
        coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      } catch (dbErr) {}
    }

    if (!coupon) {
      coupon = fallbackCoupons.find((c) => c.code === cleanCode && c.isActive);
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'Coupon has expired.' });
    }

    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
    }

    if (Number(orderAmount) < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required.`,
      });
    }

    const discount = applyCouponDiscount(coupon, Number(orderAmount));

    return res.status(200).json({
      success: true,
      message: 'Coupon is valid.',
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
        maxDiscount: coupon.maxDiscount,
      },
      discount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all coupons (admin)
 * @route   GET /api/coupons
 * @access  Admin
 */
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a coupon (admin)
 * @route   POST /api/coupons
 * @access  Admin
 */
const createCoupon = async (req, res, next) => {
  try {
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, isActive, expiresAt, description } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ success: false, message: 'code, type, and value are required.' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: isActive !== undefined ? isActive : true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      description: description || '',
    });

    return res.status(201).json({ success: true, message: 'Coupon created.', coupon });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a coupon (admin)
 * @route   PUT /api/coupons/:id
 * @access  Admin
 */
const updateCoupon = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.code) updateData.code = updateData.code.toUpperCase().trim();
    if (updateData.value !== undefined) updateData.value = Number(updateData.value);
    if (updateData.minOrderAmount !== undefined) updateData.minOrderAmount = Number(updateData.minOrderAmount);
    if (updateData.maxDiscount !== undefined) updateData.maxDiscount = Number(updateData.maxDiscount);
    if (updateData.usageLimit !== undefined) updateData.usageLimit = Number(updateData.usageLimit);
    if (updateData.expiresAt) updateData.expiresAt = new Date(updateData.expiresAt);

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    return res.status(200).json({ success: true, message: 'Coupon updated.', coupon });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a coupon (admin)
 * @route   DELETE /api/coupons/:id
 * @access  Admin
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    return res.status(200).json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon };
