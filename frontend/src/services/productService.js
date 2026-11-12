import api from './api';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from './mockData';

export const productService = {
  getProducts: async (params = {}) => {
    try {
      const res = await api.get('/products', { params });
      if (res && res.products && res.products.length > 0) return res;
      throw new Error('Fallback needed');
    } catch {
      // In-memory fallback
      let list = [...MOCK_PRODUCTS];
      const { search, category, filter, isVeg, priceMax, sort, page = 1, limit = 12 } = params;

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

      if (sort === 'price-asc' || sort === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc' || sort === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
      } else {
        list.sort((a, b) => b.sold - a.sold);
      }

      const total = list.length;
      const skip = (Number(page) - 1) * Number(limit);
      const paginated = list.slice(skip, skip + Number(limit));

      return {
        products: paginated,
        total,
        page: Number(page),
        pages: Math.max(1, Math.ceil(total / Number(limit))),
      };
    }
  },

  getProduct: async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      if (res && res.product) return res;
      throw new Error('Fallback needed');
    } catch {
      const found =
        MOCK_PRODUCTS.find((p) => p._id === id || String(p._id) === String(id)) ||
        MOCK_PRODUCTS.find((p) => p.name.toLowerCase() === decodeURIComponent(id).toLowerCase()) ||
        MOCK_PRODUCTS[0];
      return { product: found };
    }
  },

  getBestsellers: async () => {
    try {
      const res = await api.get('/products/bestsellers');
      if (res && res.products && res.products.length > 0) return res;
      throw new Error('Fallback needed');
    } catch {
      return { products: MOCK_PRODUCTS.filter((p) => p.isBestseller).slice(0, 8) };
    }
  },

  getSpecialOffers: async () => {
    try {
      const res = await api.get('/products/special-offers');
      if (res && res.products && res.products.length > 0) return res;
      throw new Error('Fallback needed');
    } catch {
      return { products: MOCK_PRODUCTS.filter((p) => p.isSpecial).slice(0, 8) };
    }
  },

  getFeatured: async () => {
    try {
      const res = await api.get('/products/featured');
      if (res && res.products && res.products.length > 0) return res;
      throw new Error('Fallback needed');
    } catch {
      return { products: MOCK_PRODUCTS.filter((p) => p.isFeatured).slice(0, 8) };
    }
  },

  getCategories: async () => {
    try {
      const res = await api.get('/categories');
      if (res && res.categories && res.categories.length > 0) return res;
      throw new Error('Fallback needed');
    } catch {
      return { categories: MOCK_CATEGORIES };
    }
  },

  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};
