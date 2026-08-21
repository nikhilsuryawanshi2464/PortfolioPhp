// PATH: backend/src/controllers/project.controller.js
const Project = require('../models/Project.model');
const { AppError } = require('../utils/appError');
const { asyncHandler } = require('../middleware/errorHandler');
const { cache } = require('../config/redis');          // always safe — no-ops when Redis is off
const cloudinaryConfig = require('../config/cloudinary');
const { emitToAdmins } = require('../utils/socket');
const logger = require('../utils/logger');

// Helper: safe cloudinary delete — never crashes the main operation
const safeDeleteImage = async (publicId) => {
  try {
    if (publicId && cloudinaryConfig.deleteImage) {
      await cloudinaryConfig.deleteImage(publicId);
    }
  } catch (err) {
    logger.warn('Cloudinary delete failed (non-fatal): ' + err.message);
  }
};

// ─── GET all projects ─────────────────────────────────────────
// @route   GET /api/v1/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const {
    page     = 1,
    limit    = 10,
    search,
    category,
    tags,
    featured,
    published,
    sort     = '-createdAt',
  } = req.query;

  // Build filter
  const query = {};

  // Non-admin users only see published projects
  if (!req.user || req.user.role === 'viewer') {
    query.published = true;
  } else if (published !== undefined) {
    query.published = published === 'true';
  }

  if (category)              query.category = category;
  if (featured !== undefined) query.featured = featured === 'true';
  if (tags)                  query.tags = { $in: tags.split(',') };
  if (search)                query.$text = { $search: search };

  // Try cache
  const cacheKey = `projects:${JSON.stringify(query)}:${page}:${limit}:${sort}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json({ success: true, cached: true, ...cached });
  }

  const skip     = (parseInt(page) - 1) * parseInt(limit);
  const projects = await Project.find(query)
    .populate('author', 'name email avatar')
    .select('-content')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total  = await Project.countDocuments(query);
  const result = {
    data: projects,
    pagination: {
      page:  parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };

  await cache.set(cacheKey, result, 300);

  res.json({ success: true, ...result });
});

// ─── GET single project by slug ────────────────────────────────
// @route   GET /api/v1/projects/:slug
// @access  Public
const getProject = asyncHandler(async (req, res, next) => {
  const cacheKey = `project:${req.params.slug}`;
  const cached   = await cache.get(cacheKey);
  if (cached) {
    return res.json({ success: true, cached: true, data: cached });
  }

  const project = await Project.findOne({ slug: req.params.slug })
    .populate('author', 'name email avatar bio');

  if (!project) return next(new AppError('Project not found', 404));

  // Public users can only see published projects
  if (!project.published && (!req.user || req.user.role === 'viewer')) {
    return next(new AppError('Project not found', 404));
  }

  // Increment views (fire-and-forget)
  Project.findByIdAndUpdate(project._id, { $inc: { views: 1 } }).exec();

  await cache.set(cacheKey, project, 300);

  res.json({ success: true, data: project });
});

// ─── GET single project by ID (admin) ─────────────────────────
// @route   GET /api/v1/projects/id/:id
// @access  Private/Admin
const getProjectById = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('author', 'name email avatar');

  if (!project) return next(new AppError('Project not found', 404));

  res.json({ success: true, data: project });
});

// ─── CREATE project ────────────────────────────────────────────
// @route   POST /api/v1/projects
// @access  Private/Admin/Editor
const createProject = asyncHandler(async (req, res) => {
  req.body.author = req.user.id;

  const project = await Project.create(req.body);

  await cache.delPattern('projects:*');

  // Notify via socket (optional feature)
  try {
    if (process.env.FEATURE_REAL_TIME_NOTIFICATIONS === 'true') {
      emitToAdmins('project:created', { project: project.title, author: req.user.name });
    }
  } catch {}

  logger.info(`Project created: ${project.title} by ${req.user.email}`);

  res.status(201).json({ success: true, data: project });
});

// ─── UPDATE project ────────────────────────────────────────────
// @route   PUT /api/v1/projects/:id
// @access  Private/Admin/Editor
const updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);
  if (!project) return next(new AppError('Project not found', 404));

  // Editors can only edit their own projects
  if (req.user.role === 'editor' && project.author.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this project', 403));
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await cache.delPattern('projects:*');
  await cache.del(`project:${project.slug}`);

  logger.info(`Project updated: ${project.title} by ${req.user.email}`);

  res.json({ success: true, data: project });
});

// ─── DELETE project ────────────────────────────────────────────
// @route   DELETE /api/v1/projects/:id
// @access  Private/Admin
const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new AppError('Project not found', 404));

  // Delete images from Cloudinary (non-fatal if it fails)
  await safeDeleteImage(project.thumbnail?.publicId);
  for (const image of project.images || []) {
    await safeDeleteImage(image.publicId);
  }

  await project.deleteOne();

  await cache.delPattern('projects:*');
  await cache.del(`project:${project.slug}`);

  logger.info(`Project deleted: ${project.title} by ${req.user.email}`);

  res.json({ success: true, message: 'Project deleted successfully' });
});

// ─── GET related projects ──────────────────────────────────────
// @route   GET /api/v1/projects/:id/related
// @access  Public
const getRelatedProjects = asyncHandler(async (req, res) => {
  // Use the model's static if it exists, otherwise fallback
  let related = [];
  try {
    if (typeof Project.findRelated === 'function') {
      related = await Project.findRelated(req.params.id, 5);
    } else {
      // Fallback: same category, published, not self
      const current = await Project.findById(req.params.id).select('category tags');
      if (current) {
        related = await Project.find({
          _id:       { $ne: current._id },
          published: true,
          $or: [
            { category: current.category },
            { tags: { $in: current.tags || [] } },
          ],
        })
          .select('title slug description thumbnail category technologies')
          .limit(5);
      }
    }
  } catch {
    related = [];
  }

  res.json({ success: true, data: related });
});

// ─── SEARCH projects ───────────────────────────────────────────
// @route   GET /api/v1/projects/search
// @access  Public
const searchProjects = asyncHandler(async (req, res) => {
  const { q, tags, technologies, category, limit = 10 } = req.query;

  const query = { published: true };
  if (q)            query.$text = { $search: q };
  if (tags)         query.tags = { $in: tags.split(',') };
  if (technologies) query.technologies = { $in: technologies.split(',') };
  if (category)     query.category = category;

  const projects = await Project.find(query)
    .select('title slug description thumbnail tags technologies category')
    .limit(parseInt(limit))
    .sort(q ? { score: { $meta: 'textScore' }, priority: -1 } : { priority: -1, createdAt: -1 });

  res.json({ success: true, count: projects.length, data: projects });
});

module.exports = {
  getProjects,
  getProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getRelatedProjects,
  searchProjects,
};