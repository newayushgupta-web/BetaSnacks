const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get Cart
router.get('/', getCart);

// Add to Cart (both / and /add)
router.post('/', addToCart);
router.post('/add', addToCart);

// Sync local storage cart on login
router.post('/sync', async (req, res, next) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      for (const item of items) {
        req.body = {
          productId: item.productId || item.product?._id || item._id,
          quantity: item.quantity || 1,
          customizations: item.customizations || [],
        };
        await addToCart(req, res, () => {});
      }
    }
    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Update Item Quantity
router.put('/:itemId', updateCartItem);
router.put('/item/:itemId', updateCartItem);

// Remove Item
router.delete('/:itemId', removeCartItem);
router.delete('/item/:itemId', removeCartItem);

// Clear Cart
router.delete('/', clearCart);
router.delete('/clear', clearCart);

// Apply & Remove Coupons
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.delete('/coupon/remove', removeCoupon);

module.exports = router;
