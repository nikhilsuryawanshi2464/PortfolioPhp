const Contact = require('../models/Contact.model');
const { AppError } = require('../utils/appError');
const { asyncHandler } = require('../middleware/errorHandler');
const { addEmailJob } = require('../jobs');
const { emitToAdmins } = require('../utils/socket');
const logger = require('../utils/logger');
const useragent = require('useragent');
const geoip = require('geoip-lite');

// @desc    Submit contact form
// @route   POST /api/v1/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message, category } = req.body;

  // Get IP and user agent
  const ipAddress = req.ip || req.connection.remoteAddress;
  const agent = useragent.parse(req.headers['user-agent']);
  const geo = geoip.lookup(ipAddress);

  // Create contact submission
  const contact = await Contact.create({
    name,
    email,
    phone,
    subject,
    message,
    category: category || 'general',
    ipAddress,
    userAgent: req.headers['user-agent'],
    referrer: req.headers.referer,
    metadata: {
      browser: agent.family,
      os: agent.os.family,
      device: agent.device.family,
      country: geo?.country,
      city: geo?.city
    }
  });

  logger.info(`New contact submission from ${email}`);

  // Send email notifications (direct send, no Redis required)
  try {
    const SiteSettings = require('../models/SiteSettings.model');
    const { sendContactNotification, sendContactAutoReply } = require('../utils/email');
    const settings = await SiteSettings.getSingleton();
    const emailCfg = settings.emailNotifications;

    if (emailCfg?.enabled && process.env.SMTP_HOST && process.env.SMTP_USER) {
      // Override ADMIN_EMAIL from settings if set
      if (emailCfg.adminEmail) process.env.ADMIN_EMAIL = emailCfg.adminEmail;

      if (emailCfg.onNewContact) {
        sendContactNotification({ name, email, phone, subject, message, category })
          .catch(err => logger.error('Contact notification email failed:', err.message));
      }
      if (emailCfg.sendAutoReply) {
        sendContactAutoReply({ name, email, subject })
          .catch(err => logger.error('Auto-reply email failed:', err.message));
      }
    }
  } catch (emailErr) {
    logger.warn('Email setup error (non-fatal):', emailErr.message);
  }

  // Emit real-time notification to admins
  if (process.env.FEATURE_REAL_TIME_NOTIFICATIONS === 'true') {
    emitToAdmins('contact:new', {
      id: contact._id,
      name,
      email,
      subject,
      category
    });
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for your message. I will get back to you soon!',
    data: {
      id: contact._id,
      createdAt: contact.createdAt
    }
  });
});

// @desc    Get all contact submissions
// @route   GET /api/v1/contact
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    category,
    priority,
    search
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const contacts = await Contact.find(query)
    .populate('notes.addedBy', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Contact.countDocuments(query);

  res.json({
    success: true,
    data: contacts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get single contact
// @route   GET /api/v1/contact/:id
// @access  Private/Admin
const getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id)
    .populate('notes.addedBy', 'name email avatar');

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  // Mark as read if it was new
  if (contact.status === 'new') {
    contact.status = 'read';
    await contact.save();
  }

  res.json({
    success: true,
    data: contact
  });
});

// @desc    Update contact status
// @route   PUT /api/v1/contact/:id/status
// @access  Private/Admin
const updateContactStatus = asyncHandler(async (req, res, next) => {
  const { status, priority } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  if (status) contact.status = status;
  if (priority) contact.priority = priority;

  if (status === 'replied' && !contact.replied) {
    contact.replied = true;
    contact.repliedAt = new Date();
  }

  await contact.save();

  logger.info(`Contact ${contact._id} updated to ${status} by ${req.user.email}`);

  res.json({
    success: true,
    data: contact
  });
});

// @desc    Add note to contact
// @route   POST /api/v1/contact/:id/notes
// @access  Private/Admin
const addContactNote = asyncHandler(async (req, res, next) => {
  const { content } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  contact.notes.push({
    content,
    addedBy: req.user.id,
    addedAt: new Date()
  });

  await contact.save();

  res.json({
    success: true,
    data: contact
  });
});

// @desc    Delete contact
// @route   DELETE /api/v1/contact/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  await contact.deleteOne();

  logger.info(`Contact ${contact._id} deleted by ${req.user.email}`);

  res.json({
    success: true,
    message: 'Contact deleted successfully'
  });
});

// @desc    Get contact statistics
// @route   GET /api/v1/contact/stats
// @access  Private/Admin
const getContactStats = asyncHandler(async (req, res) => {
  const stats = await Contact.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        total: [
          { $count: 'count' }
        ],
        recentWeek: [
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          },
          { $count: 'count' }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0]
  });
});

module.exports = {
  submitContact,
  getContacts,
  getContact,
  updateContactStatus,
  addContactNote,
  deleteContact,
  getContactStats
};