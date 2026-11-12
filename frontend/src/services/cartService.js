import api from './api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity, customizations, meta = {}) =>
    api.post('/cart/add', { productId, quantity, customizations, ...meta }),
  updateQuantity: (itemId, quantity) => api.put(`/cart/item/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/item/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
  syncCart: (items) => api.post('/cart/sync', { items }),
};
