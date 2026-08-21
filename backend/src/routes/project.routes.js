const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const {
  getProjects, getProject, getProjectById, createProject, updateProject,
  deleteProject, getRelatedProjects, searchProjects
} = require('../controllers/project.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|webp|gif)/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files are allowed'), false);
  },
});

// Upload buffer → Cloudinary
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });

// POST /api/v1/projects/:id/thumbnail
router.post('/:id/thumbnail', protect, authorize('admin', 'editor'), upload.single('thumbnail'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded' });

    const Project = require('../models/Project.model');
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    // Delete old thumbnail
    if (project.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(project.thumbnail.publicId).catch(() => {});
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio/projects',
      transformation: [
        { width: 1200, height: 675, crop: 'fill', gravity: 'auto' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    project.thumbnail = {
      url:      result.secure_url,
      publicId: result.public_id,
      alt:      project.title,
    };
    await project.save({ validateBeforeSave: false });

    res.json({ success: true, data: { thumbnail: project.thumbnail } });
  } catch (err) { next(err); }
});

// POST /api/v1/projects/:id/images
router.post('/:id/images', protect, authorize('admin', 'editor'), upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, error: 'No images uploaded' });

    const Project = require('../models/Project.model');
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const uploadedImages = await Promise.all(req.files.map((file, index) => uploadToCloudinary(file.buffer, {
      folder: 'portfolio/projects/gallery',
      transformation: [
        { width: 1600, height: 900, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
      public_id: `${project.slug || project._id}-${Date.now()}-${index}`,
    })));

    const galleryItems = uploadedImages.map((result, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      title: '',
      caption: req.body?.captions?.[index] || '',
      description: '',
    }));

    project.images = [...(project.images || []), ...galleryItems];
    await project.save({ validateBeforeSave: false });

    res.json({ success: true, data: { images: project.images } });
  } catch (err) { next(err); }
});

// DELETE /api/v1/projects/:id/thumbnail
router.delete('/:id/thumbnail', protect, authorize('admin', 'editor'), async (req, res, next) => {
  try {
    const Project = require('../models/Project.model');
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    if (project.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(project.thumbnail.publicId).catch(() => {});
    }
    project.thumbnail = { url: '', publicId: '', alt: '' };
    await project.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Thumbnail deleted' });
  } catch (err) { next(err); }
});

// DELETE /api/v1/projects/:id/images
router.delete('/:id/images', protect, authorize('admin', 'editor'), async (req, res, next) => {
  try {
    const { publicId, index } = req.body || {};
    const Project = require('../models/Project.model');
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    let imageToDelete = null;
    let nextImages = project.images || [];

    if (publicId) {
      imageToDelete = nextImages.find((image) => image.publicId === publicId);
      nextImages = nextImages.filter((image) => image.publicId !== publicId);
    } else if (index !== undefined) {
      const imageIndex = Number(index);
      imageToDelete = nextImages[imageIndex];
      nextImages = nextImages.filter((_, currentIndex) => currentIndex !== imageIndex);
    }

    if (!imageToDelete) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    if (imageToDelete.publicId) {
      await cloudinary.uploader.destroy(imageToDelete.publicId).catch(() => {});
    }

    project.images = nextImages;
    await project.save({ validateBeforeSave: false });

    res.json({ success: true, data: { images: project.images } });
  } catch (err) { next(err); }
});

// Public routes
router.get('/', optionalAuth, getProjects);
router.get('/search', searchProjects);
router.get('/id/:id', protect, authorize('admin', 'editor'), getProjectById);
router.get('/:slug', optionalAuth, getProject);
router.get('/:id/related', getRelatedProjects);

// Protected routes
router.use(protect);
router.use(authorize('admin', 'editor'));
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', authorize('admin'), deleteProject);

module.exports = router;
