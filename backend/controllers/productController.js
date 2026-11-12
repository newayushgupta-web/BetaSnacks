const mongoose = require('mongoose');
const Product = require('../models/Product');
const { getPaginationParams } = require('../utils/helpers');
const { products: seedProducts, categories: seedCategories } = require('../seed/seedData');

// In-memory enriched fallback dishes
const categoryMap = {};
seedCategories.forEach((c, idx) => {
  categoryMap[c.slug] = {
    _id: `cat_${c.slug}`,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
  };
});

const fallbackProducts = seedProducts.map((p, idx) => ({
  ...p,
  _id: `prod_${idx + 1}`,
  image: p.thumbnail || p.images?.[0],
  thumbnail: p.thumbnail || p.images?.[0],
  images: p.images || [p.thumbnail],
  category: categoryMap[p.categorySlug] || { _id: 'cat_snacks', name: 'Snacks', slug: 'snacks', icon: '' },
}));

/**
 * Filter and sort fallback products
 */
function queryFallbackProducts({ search, category, filter, isVeg, priceMax, sort, page = 1, limit = 12 }) {
  let list = [...fallbackProducts];

  if (filter === 'bestseller') {
    list = list.filter((p) => p.isBestseller);
  } else if (filter === 'special' || filter === 'deals') {
    list = list.filter((p) => p.isSpecial || (p.originalPrice && p.originalPrice > p.price));
  }

  if (search) {
    const s = search.trim().toLowerCase();
    const sSingular = s.length > 3 ? s.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '') : s;
    const terms = sSingular !== s ? [s, sSingular] : [s];
    list = list.filter((p) =>
      terms.some(
        (term) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.category?.name?.toLowerCase().includes(term) ||
          p.categorySlug?.toLowerCase().includes(term) ||
          p.tags?.some((t) => t.toLowerCase().includes(term))
      )
    );
  }

  if (category) {
    list = list.filter(
      (p) =>
        p.categorySlug === category ||
        p.category?._id === category ||
        p.category?.slug === category
    );
  }

  if (isVeg !== undefined) {
    const vegBool = isVeg === true || isVeg === 'true';
    list = list.filter((p) => p.isVeg === vegBool);
  }

  if (priceMax) {
    list = list.filter((p) => p.price <= Number(priceMax));
  }

  // Sort
  if (sort === 'price-asc' || sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc' || sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    // default sold / popularity
    list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
  }

  const total = list.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = list.slice(skip, skip + Number(limit));

  return {
    products: paginated,
    total,
    page: Number(page),
    pages: Math.max(1, Math.ceil(total / Number(limit))),
    limit: Number(limit),
  };
}

/**
 * @desc    Get all products with filter, search, sort, pagination
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query, 12);
    const {
      category,
      filter: dealFilter,
      isVeg,
      isAvailable,
      priceMin,
      priceMax,
      tags,
      search,
      sort,
    } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (category) filter.category = category;
      if (dealFilter === 'bestseller') filter.isBestseller = true;
      if (dealFilter === 'special') filter.isSpecial = true;
      if (isVeg !== undefined) filter.isVeg = isVeg === 'true';
      if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
      else filter.isAvailable = true;

      if (priceMin !== undefined || priceMax !== undefined) {
        filter.price = {};
        if (priceMin !== undefined) filter.price.$gte = Number(priceMin);
        if (priceMax !== undefined) filter.price.$lte = Number(priceMax);
      }

      if (tags) {
        const tagList = tags.split(',').map((t) => t.trim());
        filter.tags = { $in: tagList };
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      let sortObj = { sold: -1 };
      if (sort === 'price-asc' || sort === 'price_asc') sortObj = { price: 1 };
      else if (sort === 'price-desc' || sort === 'price_desc') sortObj = { price: -1 };
      else if (sort === 'rating') sortObj = { rating: -1 };
      else if (sort === 'newest') sortObj = { createdAt: -1 };

      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('category', 'name slug icon')
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter),
      ]);

      if (products.length > 0) {
        return res.status(200).json({
          success: true,
          products,
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        });
      }
    }

    // In-memory fallback
    const result = queryFallbackProducts({
      search,
      category,
      filter: dealFilter,
      isVeg,
      priceMax,
      sort,
      page,
      limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    const result = queryFallbackProducts(req.query);
    return res.status(200).json({ success: true, ...result });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = async (req, res, next) => {
  try {
    const paramId = req.params.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(paramId)) {
      const product = await Product.findById(paramId).populate('category', 'name slug icon description');
      if (product) return res.status(200).json({ success: true, product });
    }

    const found =
      fallbackProducts.find((p) => p._id === paramId || String(p._id) === String(paramId)) ||
      fallbackProducts.find((p) => p.name.toLowerCase() === decodeURIComponent(paramId).toLowerCase()) ||
      fallbackProducts[0];

    return res.status(200).json({ success: true, product: found });
  } catch (err) {
    const found =
      fallbackProducts.find((p) => p._id === req.params.id || String(p._id) === String(req.params.id)) ||
      fallbackProducts[0];
    return res.status(200).json({ success: true, product: found });
  }
};

/**
 * @desc    Create product (admin)
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.create(req.body);
      return res.status(201).json({ success: true, product });
    }
    const newProd = { ...req.body, _id: `prod_${Date.now()}` };
    fallbackProducts.unshift(newProd);
    return res.status(201).json({ success: true, product: newProd });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update product (admin)
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (product) return res.status(200).json({ success: true, product });
    }
    const idx = fallbackProducts.findIndex((p) => p._id === req.params.id);
    if (idx !== -1) {
      fallbackProducts[idx] = { ...fallbackProducts[idx], ...req.body };
      return res.status(200).json({ success: true, product: fallbackProducts[idx] });
    }
    return res.status(200).json({ success: true, message: 'Product updated' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete product (admin)
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Product.findByIdAndDelete(req.params.id);
    }
    const idx = fallbackProducts.findIndex((p) => p._id === req.params.id);
    if (idx !== -1) fallbackProducts.splice(idx, 1);
    return res.status(200).json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({ isFeatured: true, isAvailable: true })
        .populate('category', 'name slug icon')
        .sort({ rating: -1 })
        .limit(8)
        .lean();
      if (products.length > 0) return res.status(200).json({ success: true, products });
    }
    const products = fallbackProducts.filter((p) => p.isFeatured).slice(0, 8);
    return res.status(200).json({ success: true, products });
  } catch (err) {
    const products = fallbackProducts.filter((p) => p.isFeatured).slice(0, 8);
    return res.status(200).json({ success: true, products });
  }
};

/**
 * @desc    Get bestseller products
 * @route   GET /api/products/bestsellers
 * @access  Public
 */
const getBestsellers = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({ isBestseller: true, isAvailable: true })
        .populate('category', 'name slug icon')
        .sort({ sold: -1 })
        .limit(8)
        .lean();
      if (products.length > 0) return res.status(200).json({ success: true, products });
    }
    const products = fallbackProducts.filter((p) => p.isBestseller).slice(0, 8);
    return res.status(200).json({ success: true, products });
  } catch (err) {
    const products = fallbackProducts.filter((p) => p.isBestseller).slice(0, 8);
    return res.status(200).json({ success: true, products });
  }
};

/**
 * @desc    Get special offer products
 * @route   GET /api/products/special-offers
 * @access  Public
 */
const getSpecialOffers = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({ isSpecial: true, isAvailable: true })
        .populate('category', 'name slug icon')
        .sort({ createdAt: -1 })
        .lean();
      if (products.length > 0) return res.status(200).json({ success: true, products });
    }
    const products = fallbackProducts.filter((p) => p.isSpecial).slice(0, 8);
    return res.status(200).json({ success: true, products });
  } catch (err) {
    const products = fallbackProducts.filter((p) => p.isSpecial).slice(0, 8);
    return res.status(200).json({ success: true, products });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getBestsellers,
  getSpecialOffers,
};
