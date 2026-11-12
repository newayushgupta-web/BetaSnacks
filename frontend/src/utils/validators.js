export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);
export const validatePassword = (password) => password.length >= 6;
export const validatePincode = (pin) => /^\d{6}$/.test(pin);
