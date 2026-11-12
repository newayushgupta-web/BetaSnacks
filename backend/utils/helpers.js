const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate a JWT token for a user.
 * @param {string} id - User MongoDB ObjectId
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Generate a unique order number.
 * Format: FF-<YYYYMMDD>-<6 random hex chars uppercase>
 * @returns {string}
 */
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `FF-${dateStr}-${random}`;
};

/**
 * Calculate delivery fee.
 * Free delivery for orders >= ₹500, else ₹49.
 * @param {number} subtotal
 * @returns {number}
 */
const calculateDeliveryFee = (subtotal) => {
  return subtotal >= 500 ? 0 : 49;
};

/**
 * Calculate GST tax (5%).
 * @param {number} subtotal
 * @returns {number}
 */
const calculateTax = (subtotal) => {
  return Math.round(subtotal * 0.05 * 100) / 100;
};

/**
 * Calculate reward points earned.
 * 1 point per ₹10 spent.
 * @param {number} total
 * @returns {number}
 */
const calculateRewardPoints = (total) => {
  return Math.floor(total / 10);
};

/**
 * Apply coupon discount to subtotal.
 * @param {object} coupon - Coupon document
 * @param {number} subtotal
 * @returns {number} discount amount
 */
const applyCouponDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  }
  return Math.min(discount, subtotal);
};

/**
 * Sanitize pagination params from query string.
 * @param {object} query
 * @param {number} defaultLimit
 * @returns {{ page: number, limit: number, skip: number }}
 */
const getPaginationParams = (query, defaultLimit = 12) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = {
  generateToken,
  generateOrderNumber,
  calculateDeliveryFee,
  calculateTax,
  calculateRewardPoints,
  applyCouponDiscount,
  getPaginationParams,
};
