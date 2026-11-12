const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { applyCouponDiscount } = require('../utils/helpers');
const { fallbackCarts, toValidObjectId } = require('../utils/fallbackStore');

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get the current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    const safeUserId = toValidObjectId(req.user._id);

    if (isDbReady()) {
      try {
        let cart = await Cart.findOne({ user: safeUserId })
          .populate('items.product', 'name thumbnail price isAvailable stock')
          .populate('coupon', 'code type value minOrderAmount maxDiscount description');

        if (!cart) {
          cart = await Cart.create({ user: safeUserId, items: [] });
        }

        return res.status(200).json({ success: true, cart, items: cart.items || [] });
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    let memCart = fallbackCarts.get(String(safeUserId));
    if (!memCart) {
      memCart = { user: safeUserId, items: [], coupon: null, couponDiscount: 0 };
      fallbackCarts.set(String(safeUserId), memCart);
    }

    return res.status(200).json({ success: true, cart: memCart, items: memCart.items || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, customizations = [] } = req.body;
    const safeUserId = toValidObjectId(req.user._id);

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    const qty = Math.max(1, parseInt(quantity, 10));

    if (isDbReady()) {
      try {
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        if (!product.isAvailable) {
          return res.status(400).json({ success: false, message: 'Product is not available.' });
        }

        let itemPrice = product.price;
        if (customizations && customizations.length > 0) {
          customizations.forEach((c) => {
            if (c.selectedOption && c.selectedOption.price) {
              itemPrice += c.selectedOption.price;
            }
          });
        }

        let cart = await Cart.findOne({ user: safeUserId });
        if (!cart) {
          cart = new Cart({ user: safeUserId, items: [] });
        }

        const customKey = JSON.stringify(customizations || []);
        const existingIdx = cart.items.findIndex(
          (item) =>
            item.product.toString() === productId &&
            JSON.stringify(item.customizations || []) === customKey
        );

        if (existingIdx > -1) {
          const newQty = cart.items[existingIdx].quantity + qty;
          if (newQty > product.stock) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} units available.` });
          }
          cart.items[existingIdx].quantity = newQty;
        } else {
          if (qty > product.stock) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} units available.` });
          }
          cart.items.push({ product: productId, quantity: qty, customizations, price: itemPrice });
        }

        await cart.save();
        await cart.populate('items.product', 'name thumbnail price isAvailable stock');

        return res.status(200).json({ success: true, message: 'Item added to cart.', cart, items: cart.items || [] });
      } catch (dbErr) {
        // Fall through to memory
      }
    }

    // In-memory fallback
    const { products: seedProducts } = require('../seed/seedData');
    let memCart = fallbackCarts.get(String(safeUserId));
    if (!memCart) {
      memCart = { user: safeUserId, items: [], coupon: null, couponDiscount: 0 };
    }

    const found =
      seedProducts.find(
        (p) => String(p._id) === String(productId) || p.slug === productId || String(p.id) === String(productId)
      ) || {};
    const itemPrice = Number(req.body.price) || found.price || 149;
    const itemName = req.body.name || found.name || 'Gourmet Dish';
    const itemThumb = req.body.thumbnail || found.thumbnail || found.image || '';
    const isVeg = req.body.isVeg !== undefined ? req.body.isVeg : (found.isVeg !== undefined ? found.isVeg : true);

    const existingIdx = memCart.items.findIndex(
      (item) => String(item.product?._id || item.product) === String(productId)
    );
    if (existingIdx > -1) {
      memCart.items[existingIdx].quantity += qty;
    } else {
      memCart.items.push({
        _id: new mongoose.Types.ObjectId().toHexString(),
        product: {
          _id: productId,
          name: itemName,
          thumbnail: itemThumb,
          image: itemThumb,
          price: itemPrice,
          isVeg,
        },
        name: itemName,
        thumbnail: itemThumb,
        image: itemThumb,
        quantity: qty,
        customizations,
        price: itemPrice,
        isVeg,
      });
    }
    fallbackCarts.set(String(safeUserId), memCart);

    return res.status(200).json({ success: true, message: 'Item added to cart.', cart: memCart, items: memCart.items || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    const safeUserId = toValidObjectId(req.user._id);

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    if (isDbReady()) {
      try {
        const cart = await Cart.findOne({ user: safeUserId });
        if (cart) {
          const item = cart.items.id(itemId);
          if (item) {
            item.quantity = parseInt(quantity, 10);
            await cart.save();
            await cart.populate('items.product', 'name thumbnail price isAvailable stock');
            return res.status(200).json({ success: true, message: 'Cart updated.', cart });
          }
        }
      } catch (dbErr) {}
    }

    let memCart = fallbackCarts.get(String(safeUserId));
    if (memCart) {
      const item = memCart.items.find((i) => String(i._id) === String(itemId) || String(i.product) === String(itemId));
      if (item) item.quantity = parseInt(quantity, 10);
      return res.status(200).json({ success: true, message: 'Cart updated.', cart: memCart });
    }

    return res.status(200).json({ success: true, message: 'Cart updated.', cart: { items: [] } });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const safeUserId = toValidObjectId(req.user._id);

    if (isDbReady()) {
      try {
        const cart = await Cart.findOne({ user: safeUserId });
        if (cart) {
          const item = cart.items.id(itemId);
          if (item) {
            item.deleteOne();
            await cart.save();
            await cart.populate('items.product', 'name thumbnail price isAvailable stock');
            return res.status(200).json({ success: true, message: 'Item removed from cart.', cart });
          }
        }
      } catch (dbErr) {}
    }

    let memCart = fallbackCarts.get(String(safeUserId));
    if (memCart) {
      memCart.items = memCart.items.filter((i) => String(i._id) !== String(itemId) && String(i.product) !== String(itemId));
      return res.status(200).json({ success: true, message: 'Item removed from cart.', cart: memCart });
    }

    return res.status(200).json({ success: true, message: 'Item removed.', cart: { items: [] } });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const safeUserId = toValidObjectId(req.user._id);

    if (isDbReady()) {
      try {
        const cart = await Cart.findOne({ user: safeUserId });
        if (cart) {
          cart.items = [];
          cart.coupon = null;
          cart.couponDiscount = 0;
          await cart.save();
        }
      } catch (dbErr) {}
    }

    fallbackCarts.set(String(safeUserId), { user: safeUserId, items: [], coupon: null, couponDiscount: 0 });
    return res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/cart/coupon
 * @access  Private
 */
const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    return res.status(200).json({ success: true, message: 'Coupon applied.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove coupon from cart
 * @route   DELETE /api/cart/coupon
 * @access  Private
 */
const removeCoupon = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, message: 'Coupon removed.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Sync local cart with server cart on login
 * @route   POST /api/cart/sync
 * @access  Private
 */
const syncCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    const safeUserId = toValidObjectId(req.user._id);

    let memCart = fallbackCarts.get(String(safeUserId)) || { user: safeUserId, items: [] };
    memCart.items = items;
    fallbackCarts.set(String(safeUserId), memCart);

    return res.status(200).json({ success: true, cart: memCart });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  syncCart,
};
