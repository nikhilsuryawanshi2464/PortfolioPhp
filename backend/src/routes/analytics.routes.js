const express = require('express');
const router = express.Router();
const {
  trackPageView,
  trackProjectView,
  trackResumeDownload,
  trackEvent,
  getDashboard,
  getRealTimeAnalytics
} = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth');
const { analyticsLimiter } = require('../middleware/rateLimiter');

// Public tracking endpoints (with rate limiting)
router.post('/pageview', analyticsLimiter, trackPageView);
router.post('/project/:projectId', analyticsLimiter, trackProjectView);
router.post('/resume', analyticsLimiter, trackResumeDownload);
router.post('/event', analyticsLimiter, trackEvent);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin', 'editor'));

router.get('/dashboard', getDashboard);
router.get('/realtime', getRealTimeAnalytics);

module.exports = router;
