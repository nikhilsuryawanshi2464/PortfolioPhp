const User = require('../models/User.model');
const { AppError } = require('../utils/appError');
const { asyncHandler } = require('../middleware/errorHandler');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer: memory storage (no disk writes) ──────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|webp|gif/;
  const pdfTypes   = /pdf/;
  const ext  = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype;

  if (mime === 'application/pdf' || pdfTypes.test(ext)) return cb(null, true);
  if (imageTypes.test(ext) && imageTypes.test(mime.split('/')[1])) return cb(null, true);
  cb(new AppError('Only images (jpg/png/webp) and PDFs are allowed', 400));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Helper: upload buffer to Cloudinary
const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });

// ── GET /api/v1/profile ──────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ role: 'admin' }).sort({ updatedAt: -1 }).select('-password -refreshToken');
  if (!user) return res.json({ success: true, data: null });
  res.json({ success: true, data: user });
});

// ── PUT /api/v1/profile ──────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name','title','tagline','bio','location','phone','contactEmail','yearsOfExperience','availableForWork','social'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  logger.info(`Profile updated by ${user.email}`);
  res.json({ success: true, data: user });
});

// ── POST /api/v1/profile/avatar ──────────────────────────────
const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image', 400));

  const user = await User.findById(req.user.id);

  // Delete old avatar from Cloudinary
  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
  }

  const result = await uploadBuffer(req.file.buffer, {
    folder: 'portfolio/avatars',
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }, { quality: 'auto:good' }, { fetch_format: 'auto' }],
  });

  user.avatar = result.secure_url;
  user.avatarPublicId = result.public_id;
  await user.save({ validateBeforeSave: false });

  logger.info(`Avatar uploaded for ${user.email}`);
  res.json({ success: true, data: { avatar: user.avatar } });
});

// ── POST /api/v1/profile/resume ──────────────────────────────
const uploadResume = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload a PDF file', 400));
  if (req.file.mimetype !== 'application/pdf') return next(new AppError('Resume must be a PDF file', 400));

  const user = await User.findById(req.user.id);

  // Delete old resume from Cloudinary
  if (user.resume?.publicId) {
    await cloudinary.uploader.destroy(user.resume.publicId, { resource_type: 'raw' }).catch(() => {});
  }

  const result = await uploadBuffer(req.file.buffer, {
    folder: 'portfolio/resumes',
    resource_type: 'raw',
    public_id: `resume_${user._id}_${Date.now()}`,
    format: 'pdf',
  });

  user.resume = {
    url: result.secure_url,
    publicId: result.public_id,
    fileName: req.file.originalname,
    uploadedAt: new Date(),
    downloadCount: user.resume?.downloadCount || 0,
  };
  await user.save({ validateBeforeSave: false });

  logger.info(`Resume uploaded for ${user.email}: ${req.file.originalname}`);
  res.json({ success: true, data: { resume: user.resume } });
});

// ── GET /api/v1/profile/resume/download (PUBLIC) ─────────────
const downloadResume = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ role: 'admin' });
  if (!user?.resume?.url) return next(new AppError('No resume uploaded yet', 404));

  // Increment download counter
  await User.findByIdAndUpdate(user._id, { $inc: { 'resume.downloadCount': 1 } });

  logger.info(`Resume downloaded. Total: ${(user.resume.downloadCount || 0) + 1}`);

  // Redirect to the Cloudinary URL (direct download)
  res.redirect(user.resume.url);
});

// ── DELETE /api/v1/profile/resume ────────────────────────────
const deleteResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.resume?.publicId) {
    await cloudinary.uploader.destroy(user.resume.publicId, { resource_type: 'raw' }).catch(() => {});
  }
  user.resume = { url: '', publicId: '', fileName: '', downloadCount: 0 };
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Resume deleted' });
});

module.exports = { getProfile, updateProfile, uploadAvatar, uploadResume, downloadResume, deleteResume, upload };
