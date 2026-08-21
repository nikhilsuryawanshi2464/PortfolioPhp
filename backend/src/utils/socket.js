const jwt = require('jsonwebtoken');
const logger = require('./logger');

let io;

const initializeSocket = (socketIo) => {
  io = socketIo;

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join room based on user role
    if (socket.userRole === 'admin' || socket.userRole === 'editor') {
      socket.join('admin-room');
      logger.info(`User ${socket.userId} joined admin room`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });

    // Custom events
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
};

// Emit notification to admin room
const emitToAdmins = (event, data) => {
  if (io) {
    io.to('admin-room').emit(event, data);
    logger.info(`Event ${event} emitted to admin room`);
  }
};

// Emit notification to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
    logger.info(`Event ${event} emitted to user ${userId}`);
  }
};

// Emit global notification
const emitGlobal = (event, data) => {
  if (io) {
    io.emit(event, data);
    logger.info(`Global event ${event} emitted`);
  }
};

module.exports = {
  initializeSocket,
  emitToAdmins,
  emitToUser,
  emitGlobal,
  getIO: () => io
};
