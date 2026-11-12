let io;

const initSocketService = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-order-room', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`Socket ${socket.id} joined order room: order-${orderId}`);
    });

    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`Socket ${socket.id} joined user room: user-${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

/**
 * Emit order status update to all clients watching this order.
 * @param {string} orderId
 * @param {object} data
 */
const emitOrderUpdate = (orderId, data) => {
  if (io) {
    io.to(`order-${orderId}`).emit('order-status-update', data);
  }
};

/**
 * Emit a notification to a specific user's room.
 * @param {string} userId
 * @param {object} notification
 */
const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit('new-notification', notification);
  }
};

module.exports = { initSocketService, emitOrderUpdate, emitNotification };
