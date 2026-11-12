const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  getAllCustomers,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/customers', getAllCustomers);
router.get('/analytics', getAnalytics);

module.exports = router;

