const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

// Public
router.get('/', getAllCategories);

// Admin
router.get('/admin', protect, admin, getAllCategoriesAdmin);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;

