import api from './api';

export const paymentService = {
  createOrder: (amount, currency = 'INR') =>
    api.post('/payment/create-order', { amount, currency }),
  verifyPayment: (data) => api.post('/payment/verify', data),
};

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const existing = document.getElementById('razorpay-script');
    if (existing) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
