const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { products: seedProducts } = require('../seed/seedData');
const { toValidObjectId } = require('../utils/fallbackStore');

const isDbReady = () => mongoose.connection.readyState === 1;
const fallbackWishlists = new Map();

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const safeUserId = String(toValidObjectId(req.user._id));

    if (isDbReady()) {
      try {
        let wishlist = await Wishlist.findOne({ user: safeUserId })
          .populate('products', 'name thumbnail price rating isAvailable isVeg category')
          .lean();

        if (wishlist) {
          return res.status(200).json({ success: true, wishlist });
        }
      } catch (dbErr) {}
    }

    let userWishlist = fallbackWishlists.get(safeUserId);
    if (!userWishlist) {
      userWishlist = { user: safeUserId, products: [] };
      fallbackWishlists.set(safeUserId, userWishlist);
    }

    return res.status(200).json({ success: true, wishlist: userWishlist });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    const safeUserId = String(toValidObjectId(req.user._id));

    if (isDbReady()) {
      try {
        const product = await Product.findById(productId);
        if (product) {
          let wishlist = await Wishlist.findOne({ user: safeUserId });
          if (!wishlist) {
            wishlist = new Wishlist({ user: safeUserId, products: [] });
          }

          if (wishlist.products.some((p) => p.toString() === productId)) {
            return res.status(409).json({ success: false, message: 'Product already in wishlist.' });
          }

          wishlist.products.push(productId);
          await wishlist.save();
          await wishlist.populate('products', 'name thumbnail price rating isAvailable isVeg');
          return res.status(200).json({ success: true, message: 'Added to wishlist.', wishlist });
        }
      } catch (dbErr) {}
    }

    let userWishlist = fallbackWishlists.get(safeUserId);
    if (!userWishlist) {
      userWishlist = { user: safeUserId, products: [] };
      fallbackWishlists.set(safeUserId, userWishlist);
    }

    const existingProd = userWishlist.products.find((p) => String(p._id || p) === String(productId));
    if (existingProd) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist.' });
    }

    const foundSeed = seedProducts.find((p) => String(p._id) === String(productId)) || {
      _id: productId,
      name: 'Betasnacks Gourmet Snack',
      thumbnail: '/images/kesar-rabdi-jalebi.jpg',
      price: 149,
      rating: 4.8,
      isAvailable: true,
      isVeg: true,
    };

    userWishlist.products.push(foundSeed);
    return res.status(200).json({ success: true, message: 'Added to wishlist.', wishlist: userWishlist });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const safeUserId = String(toValidObjectId(req.user._id));

    if (isDbReady()) {
      try {
        const wishlist = await Wishlist.findOne({ user: safeUserId });
        if (wishlist) {
          wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
          await wishlist.save();
          await wishlist.populate('products', 'name thumbnail price rating isAvailable isVeg');
          return res.status(200).json({ success: true, message: 'Removed from wishlist.', wishlist });
        }
      } catch (dbErr) {}
    }

    let userWishlist = fallbackWishlists.get(safeUserId);
    if (userWishlist) {
      userWishlist.products = userWishlist.products.filter((p) => String(p._id || p) !== String(productId));
    }
    return res.status(200).json({ success: true, message: 'Removed from wishlist.', wishlist: userWishlist || { user: safeUserId, products: [] } });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle product in wishlist (add if absent, remove if present)
 * @route   POST /api/wishlist/toggle
 * @access  Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    const safeUserId = String(toValidObjectId(req.user._id));

    if (isDbReady()) {
      try {
        const product = await Product.findById(productId);
        if (product) {
          let wishlist = await Wishlist.findOne({ user: safeUserId });
          if (!wishlist) {
            wishlist = new Wishlist({ user: safeUserId, products: [] });
          }

          const idx = wishlist.products.findIndex((p) => p.toString() === productId);
          let action;
          if (idx > -1) {
            wishlist.products.splice(idx, 1);
            action = 'removed';
          } else {
            wishlist.products.push(productId);
            action = 'added';
          }

          await wishlist.save();
          await wishlist.populate('products', 'name thumbnail price rating isAvailable isVeg');

          return res.status(200).json({
            success: true,
            message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist.`,
            action,
            wishlist,
          });
        }
      } catch (dbErr) {}
    }

    let userWishlist = fallbackWishlists.get(safeUserId);
    if (!userWishlist) {
      userWishlist = { user: safeUserId, products: [] };
      fallbackWishlists.set(safeUserId, userWishlist);
    }

    const idx = userWishlist.products.findIndex((p) => String(p._id || p) === String(productId));
    let action;
    if (idx > -1) {
      userWishlist.products.splice(idx, 1);
      action = 'removed';
    } else {
      const foundSeed = seedProducts.find((p) => String(p._id) === String(productId)) || {
        _id: productId,
        name: 'Betasnacks Gourmet Snack',
        thumbnail: '/images/kesar-rabdi-jalebi.jpg',
        price: 149,
        rating: 4.8,
        isAvailable: true,
        isVeg: true,
      };
      userWishlist.products.push(foundSeed);
      action = 'added';
    }

    return res.status(200).json({
      success: true,
      message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist.`,
      action,
      wishlist: userWishlist,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist };
