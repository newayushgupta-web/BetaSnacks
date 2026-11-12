const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { users: seedUsers } = require('../seed/seedData');

/**
 * Converts any arbitrary string (e.g. "user_1794498745284", "admin", "123")
 * into a guaranteed valid 24-character hexadecimal MongoDB ObjectId string.
 */
function toValidObjectId(idStr) {
  if (!idStr) {
    return new mongoose.Types.ObjectId().toHexString();
  }
  const s = String(idStr).trim();
  if (/^[0-9a-fA-F]{24}$/.test(s)) {
    return s;
  }
  // Deterministic 24-character hex hash
  const hash = crypto.createHash('md5').update(s).digest('hex');
  return hash.substring(0, 24);
}

const fallbackUsers = seedUsers.map((u, i) => {
  const deterministicId = toValidObjectId(`user_${i + 1}_${u.email}`);
  return {
    _id: deterministicId,
    legacyId: `user_${i + 1}`,
    name: u.name,
    email: u.email.toLowerCase(),
    passwordHash: bcrypt.hashSync(u.password, 10),
    role: u.role || 'customer',
    phone: u.phone || '',
    rewardPoints: u.rewardPoints || 0,
    isActive: true,
    addresses: u.addresses || [
      {
        _id: new mongoose.Types.ObjectId().toHexString(),
        name: u.name,
        phone: u.phone || '+91 9876543210',
        street: '12th Main, 4th Cross, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        landmark: 'Near Metro Station',
        type: 'home',
        isDefault: true,
      },
    ],
    avatar: '',
  };
});

// Add customer@betasnacks.com for demo convenience
if (!fallbackUsers.some((u) => u.email === 'customer@betasnacks.com')) {
  fallbackUsers.push({
    _id: toValidObjectId('user_customer_betasnacks'),
    legacyId: 'user_customer_demo',
    name: 'Ayush Gupta',
    email: 'customer@betasnacks.com',
    passwordHash: bcrypt.hashSync('Password123!', 10),
    role: 'customer',
    phone: '08262844351',
    rewardPoints: 120,
    isActive: true,
    addresses: [
      {
        _id: new mongoose.Types.ObjectId().toHexString(),
        name: 'Ayush Gupta',
        phone: '08262844351',
        street: 'Shop no. 2, jivdani kripa store near gaodevi mandir, opposite Sai medical',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        landmark: 'Opposite Sai Medical',
        type: 'home',
        isDefault: true,
      },
    ],
    avatar: '',
  });
}

const fallbackCarts = new Map();
const fallbackOrders = [];

module.exports = {
  fallbackUsers,
  fallbackCarts,
  fallbackOrders,
  toValidObjectId,
};
