const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    if (isDbReady()) {
      try {
        const notifications = await Notification.find({ user: req.user._id })
          .sort({ createdAt: -1 })
          .limit(30);

        const unreadCount = await Notification.countDocuments({
          user: req.user._id,
          isRead: false,
        });

        return sendSuccess(res, 200, 'Notifications retrieved', {
          notifications,
          unreadCount,
        });
      } catch (dbErr) {}
    }

    return sendSuccess(res, 200, 'Notifications retrieved', {
      notifications: [],
      unreadCount: 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    return sendSuccess(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
