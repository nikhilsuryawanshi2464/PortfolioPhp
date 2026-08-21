const mongoose = require('mongoose');

// Page view tracking
const pageViewSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  referrer: String,
  sessionId: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  userAgent: String,
  metadata: {
    browser: String,
    browserVersion: String,
    os: String,
    device: String,
    country: String,
    city: String,
    region: String,
    timezone: String
  },
  duration: Number, // Time spent on page in seconds
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'hours'
  }
});

// Project view tracking
const projectViewSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sessionId: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  referrer: String,
  metadata: {
    browser: String,
    os: String,
    device: String,
    country: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Resume download tracking
const resumeDownloadSchema = new mongoose.Schema({
  format: {
    type: String,
    enum: ['pdf', 'doc', 'txt'],
    default: 'pdf'
  },
  sessionId: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  metadata: {
    browser: String,
    os: String,
    country: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Event tracking (generic)
const eventSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  label: String,
  value: Number,
  sessionId: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Session tracking
const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  userAgent: String,
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in seconds
  pageViews: Number,
  events: Number,
  landingPage: String,
  exitPage: String,
  referrer: String,
  metadata: {
    browser: String,
    os: String,
    device: String,
    country: String,
    city: String
  }
});

// Indexes
pageViewSchema.index({ path: 1, timestamp: -1 });
pageViewSchema.index({ sessionId: 1 });
pageViewSchema.index({ timestamp: -1 });

projectViewSchema.index({ projectId: 1, timestamp: -1 });
projectViewSchema.index({ sessionId: 1 });

resumeDownloadSchema.index({ timestamp: -1 });
resumeDownloadSchema.index({ format: 1 });

eventSchema.index({ category: 1, action: 1, timestamp: -1 });
eventSchema.index({ sessionId: 1 });

sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ startTime: -1 });
sessionSchema.index({ userId: 1 });

const PageView = mongoose.model('PageView', pageViewSchema);
const ProjectView = mongoose.model('ProjectView', projectViewSchema);
const ResumeDownload = mongoose.model('ResumeDownload', resumeDownloadSchema);
const Event = mongoose.model('Event', eventSchema);
const Session = mongoose.model('Session', sessionSchema);

module.exports = {
  PageView,
  ProjectView,
  ResumeDownload,
  Event,
  Session
};
