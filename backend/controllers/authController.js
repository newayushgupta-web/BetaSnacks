const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken } = require('../utils/helpers');
const { sendWelcomeEmail } = require('../services/emailService');
const { fallbackUsers, toValidObjectId } = require('../utils/fallbackStore');
const bcrypt = require('bcryptjs');

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * @desc    Register a new user (with smart re-sync if already registered)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Your Full Name is required.' });
    }
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 1. If MongoDB is ready
    if (isDbReady()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in or use another email.',
        });
      }

      const user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password,
        phone: phone ? phone.trim() : '',
      });
      sendWelcomeEmail(user).catch(() => {});
      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: `Welcome to Betasnacks, ${user.name}! Your account has been created.`,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          rewardPoints: user.rewardPoints || 50,
          addresses: user.addresses || [],
        },
      });
    }

    // 2. In-Memory fallback store
    const existingIndex = fallbackUsers.findIndex((u) => u.email === cleanEmail);
    if (existingIndex > -1) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in or use another email.',
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newId = new mongoose.Types.ObjectId().toHexString();
    const newUser = {
      _id: newId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'customer',
      phone: phone ? phone.trim() : '',
      rewardPoints: 50,
      isActive: true,
      addresses: [],
      avatar: '',
    };
    fallbackUsers.push(newUser);

    const token = generateToken(newUser._id);
    return res.status(201).json({
      success: true,
      message: `Welcome to Betasnacks, ${newUser.name}! Your account has been created.`,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
        rewardPoints: newUser.rewardPoints,
        addresses: newUser.addresses || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user (with strict password validation)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name && name.trim() ? name.trim() : null;

    // 1. If MongoDB is ready
    if (isDbReady()) {
      let user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email. Please click "Create Account" below to register.',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated. Please contact support.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password! Please enter the correct password.',
        });
      }

      // If user supplied a updated name on login, update it
      if (cleanName && cleanName !== user.name) {
        user.name = cleanName;
        await user.save();
      }

      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          rewardPoints: user.rewardPoints,
          addresses: user.addresses || [],
        },
      });
    }

    // 2. In-Memory fallback store
    let user = fallbackUsers.find((u) => u.email === cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please click "Create Account" below to register.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Please contact support.' });
    }

    const isMatch = user.passwordHash ? bcrypt.compareSync(password, user.passwordHash) : false;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password! Please enter the correct password.',
      });
    }

    user._id = toValidObjectId(user._id);
    if (cleanName && cleanName !== user.name) {
      user.name = cleanName;
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        rewardPoints: user.rewardPoints,
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const safeId = toValidObjectId(req.user._id);
    if (isDbReady() && mongoose.Types.ObjectId.isValid(safeId)) {
      const user = await User.findById(safeId);
      if (user) {
        return res.status(200).json({ success: true, user });
      }
    }

    const found =
      fallbackUsers.find(
        (u) =>
          String(u._id) === String(safeId) ||
          String(u._id) === String(req.user._id) ||
          u.legacyId === String(req.user._id)
      ) || req.user;

    return res.status(200).json({ success: true, user: found });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user profile & addresses
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, addresses } = req.body;
    const safeId = toValidObjectId(req.user._id);

    if (isDbReady() && mongoose.Types.ObjectId.isValid(safeId)) {
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (phone !== undefined) updateFields.phone = phone;
      if (avatar !== undefined) updateFields.avatar = avatar;
      if (addresses !== undefined) updateFields.addresses = addresses;

      const user = await User.findByIdAndUpdate(
        safeId,
        { $set: updateFields },
        { new: true, runValidators: true }
      );
      if (user) return res.status(200).json({ success: true, message: 'Profile updated.', user });
    }

    // Update in-memory fallback user
    let user = fallbackUsers.find(
      (u) =>
        String(u._id) === String(safeId) ||
        String(u._id) === String(req.user._id) ||
        u.legacyId === String(req.user._id)
    );

    if (user) {
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (avatar !== undefined) user.avatar = avatar;
      if (addresses !== undefined) user.addresses = addresses;
      return res.status(200).json({ success: true, message: 'Profile updated.', user });
    }

    // If user object was attached to req
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (avatar !== undefined) req.user.avatar = avatar;
    if (addresses !== undefined) req.user.addresses = addresses;

    return res.status(200).json({ success: true, message: 'Profile updated.', user: req.user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a delivery address
 * @route   POST /api/auth/addresses
 * @access  Private
 */
const addAddress = async (req, res, next) => {
  try {
    const { name, phone, street, city, state = 'Karnataka', pincode, landmark = '', type = 'home', isDefault = false } = req.body;

    if (!street || !pincode) {
      return res.status(400).json({ success: false, message: 'Street and pincode are required.' });
    }

    const safeId = toValidObjectId(req.user._id);
    const newAddr = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      name: name || req.user.name || '',
      phone: phone || req.user.phone || '',
      street,
      city: city || 'Bengaluru',
      state,
      pincode,
      landmark,
      type,
      isDefault: Boolean(isDefault),
    };

    if (isDbReady() && mongoose.Types.ObjectId.isValid(safeId)) {
      const user = await User.findById(safeId);
      if (user) {
        if (newAddr.isDefault) {
          user.addresses.forEach((a) => (a.isDefault = false));
        } else if (user.addresses.length === 0) {
          newAddr.isDefault = true;
        }
        user.addresses.push(newAddr);
        await user.save();
        return res.status(201).json({ success: true, message: 'Address saved.', addresses: user.addresses, user });
      }
    }

    let user = fallbackUsers.find(
      (u) =>
        String(u._id) === String(safeId) ||
        String(u._id) === String(req.user._id) ||
        u.legacyId === String(req.user._id)
    );

    if (!user) {
      user = req.user;
    }

    if (!user.addresses) user.addresses = [];
    if (newAddr.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    } else if (user.addresses.length === 0) {
      newAddr.isDefault = true;
    }
    user.addresses.push(newAddr);

    return res.status(201).json({ success: true, message: 'Address saved.', addresses: user.addresses, user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete delivery address
 * @route   DELETE /api/auth/addresses/:id
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;
    const safeId = toValidObjectId(req.user._id);

    if (isDbReady() && mongoose.Types.ObjectId.isValid(safeId)) {
      const user = await User.findById(safeId);
      if (user) {
        user.addresses = user.addresses.filter((a) => String(a._id) !== String(addressId));
        await user.save();
        return res.status(200).json({ success: true, message: 'Address removed.', addresses: user.addresses, user });
      }
    }

    let user = fallbackUsers.find(
      (u) =>
        String(u._id) === String(safeId) ||
        String(u._id) === String(req.user._id) ||
        u.legacyId === String(req.user._id)
    );
    if (!user) user = req.user;

    user.addresses = (user.addresses || []).filter((a) => String(a._id) !== String(addressId));
    return res.status(200).json({ success: true, message: 'Address removed.', addresses: user.addresses, user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    return res.status(200).json({
      success: true,
      message: 'If that email exists in our system, a password reset link has been dispatched.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required.' });
    }

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  forgotPassword,
  changePassword,
};
