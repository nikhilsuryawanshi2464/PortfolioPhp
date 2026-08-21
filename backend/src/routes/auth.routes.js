const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  updatePassword
} = require('../controllers/auth.controller');
const { protect, authorize, verifyRefreshToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', protect, authorize('admin'), register);
router.post('/login', authLimiter, login);
router.post('/refresh', verifyRefreshToken, refreshToken);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/password', updatePassword);

module.exports = router;
