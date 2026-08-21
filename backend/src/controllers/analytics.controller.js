const { PageView, ProjectView, ResumeDownload, Event, Session } = require('../models/Analytics.model');
const { asyncHandler } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');
const useragent = require('useragent');
const geoip = require('geoip-lite');
const logger = require('../utils/logger');

// Helper to extract metadata from request
const extractMetadata = (req) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const agent = useragent.parse(req.headers['user-agent']);
  const geo = geoip.lookup(ipAddress);

  return {
    ipAddress,
    userAgent: req.headers['user-agent'],
    metadata: {
      browser: agent.family,
      browserVersion: agent.toVersion(),
      os: agent.os.family,
      device: agent.device.family,
      country: geo?.country,
      city: geo?.city,
      region: geo?.region,
      timezone: geo?.timezone
    }
  };
};

// @desc    Track page view
// @route   POST /api/v1/analytics/pageview
// @access  Public
const trackPageView = asyncHandler(async (req, res) => {
  const { path, referrer, duration } = req.body;
  const sessionId = req.cookies.sessionId || uuidv4();
  
  const metadata = extractMetadata(req);

  await PageView.create({
    path,
    referrer,
    sessionId,
    userId: req.user?.id,
    duration,
    ...metadata
  });

  // Set session cookie if not exists
  if (!req.cookies.sessionId) {
    res.cookie('sessionId', sessionId, {
      maxAge: 30 * 60 * 1000, // 30 minutes
      httpOnly: true
    });
  }

  res.json({ success: true });
});

// @desc    Track project view
// @route   POST /api/v1/analytics/project/:projectId
// @access  Public
const trackProjectView = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const sessionId = req.cookies.sessionId || uuidv4();
  
  const metadata = extractMetadata(req);

  await ProjectView.create({
    projectId,
    sessionId,
    userId: req.user?.id,
    referrer: req.headers.referer,
    ...metadata
  });

  res.json({ success: true });
});

// @desc    Track resume download
// @route   POST /api/v1/analytics/resume
// @access  Public
const trackResumeDownload = asyncHandler(async (req, res) => {
  const { format = 'pdf' } = req.body;
  const sessionId = req.cookies.sessionId || uuidv4();
  
  const metadata = extractMetadata(req);

  await ResumeDownload.create({
    format,
    sessionId,
    userId: req.user?.id,
    ...metadata
  });

  logger.info(`Resume downloaded: ${format} from ${metadata.ipAddress}`);

  res.json({ success: true });
});

// @desc    Track custom event
// @route   POST /api/v1/analytics/event
// @access  Public
const trackEvent = asyncHandler(async (req, res) => {
  const { category, action, label, value } = req.body;
  const sessionId = req.cookies.sessionId || uuidv4();

  await Event.create({
    category,
    action,
    label,
    value,
    sessionId,
    userId: req.user?.id,
    metadata: extractMetadata(req).metadata
  });

  res.json({ success: true });
});

// @desc    Get analytics dashboard
// @route   GET /api/v1/analytics/dashboard
// @access  Private/Admin
const getDashboard = asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;

  // Calculate date range
  const periodDays = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  }[period] || 7;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Get page views
  const pageViews = await PageView.countDocuments({
    timestamp: { $gte: startDate }
  });

  // Get unique visitors
  const uniqueVisitors = await PageView.distinct('sessionId', {
    timestamp: { $gte: startDate }
  });

  // Get project views
  const projectViews = await ProjectView.countDocuments({
    timestamp: { $gte: startDate }
  });

  // Get resume downloads
  const resumeDownloads = await ResumeDownload.countDocuments({
    timestamp: { $gte: startDate }
  });

  // Get top pages
  const topPages = await PageView.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    { $group: { _id: '$path', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get top projects
  const topProjects = await ProjectView.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$projectId',
        views: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$sessionId' }
      }
    },
    { $addFields: { uniqueVisitors: { $size: '$uniqueVisitors' } } },
    { $sort: { views: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: '_id',
        as: 'project'
      }
    },
    { $unwind: '$project' },
    {
      $project: {
        title: '$project.title',
        slug: '$project.slug',
        views: 1,
        uniqueVisitors: 1
      }
    }
  ]);

  // Get traffic sources
  const trafficSources = await PageView.aggregate([
    { $match: { timestamp: { $gte: startDate }, referrer: { $exists: true, $ne: '' } } },
    { $group: { _id: '$referrer', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get geographical distribution
  const geographicalDistribution = await PageView.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    { $group: { _id: '$metadata.country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get device breakdown
  const deviceBreakdown = await PageView.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    { $group: { _id: '$metadata.device', count: { $sum: 1 } } }
  ]);

  // Get browser breakdown
  const browserBreakdown = await PageView.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    { $group: { _id: '$metadata.browser', count: { $sum: 1 } } }
  ]);

  // Get daily views for chart
  const dailyViews = await PageView.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        pageViews: { $sum: 1 },
        visitors: { $addToSet: '$sessionId' }
      }
    },
    { $addFields: { uniqueVisitors: { $size: '$visitors' } } },
    { $project: { visitors: 0 } },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        pageViews,
        uniqueVisitors: uniqueVisitors.length,
        projectViews,
        resumeDownloads
      },
      topPages,
      topProjects,
      trafficSources,
      geographicalDistribution,
      deviceBreakdown,
      browserBreakdown,
      dailyViews
    }
  });
});

// @desc    Get real-time analytics
// @route   GET /api/v1/analytics/realtime
// @access  Private/Admin
const getRealTimeAnalytics = asyncHandler(async (req, res) => {
  const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);

  const activeVisitors = await PageView.distinct('sessionId', {
    timestamp: { $gte: last5Minutes }
  });

  const recentPageViews = await PageView.find({
    timestamp: { $gte: last5Minutes }
  })
    .select('path timestamp metadata.country metadata.city')
    .sort('-timestamp')
    .limit(20);

  res.json({
    success: true,
    data: {
      activeVisitors: activeVisitors.length,
      recentPageViews
    }
  });
});

module.exports = {
  trackPageView,
  trackProjectView,
  trackResumeDownload,
  trackEvent,
  getDashboard,
  getRealTimeAnalytics
};
