const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const Skill      = require('../models/Skill.model');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|webp|svg\+xml|gif)/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Images only'), false);
  },
});

const uploadBuf = (buf, opts) => new Promise((res, rej) => {
  cloudinary.uploader.upload_stream(opts, (e, r) => e ? rej(e) : res(r)).end(buf);
});

// GET all skills (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const skills = await Skill.find({ visible: true }).sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, data: skills });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// GET all including hidden (admin)
router.get('/all', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const skills = await Skill.find().sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, data: skills });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// CREATE
router.post('/', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

// REORDER
router.put('/reorder', protect, authorize('admin'), async (req, res) => {
  try {
    const { skillIds } = req.body;
    if (!skillIds || !Array.isArray(skillIds)) {
      return res.status(400).json({ success: false, error: 'Please provide an array of skill IDs' });
    }

    const total = skillIds.length;
    const bulkOps = skillIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { priority: total - index }
      }
    }));

    if (bulkOps.length > 0) {
      await Skill.bulkWrite(bulkOps);
    }

    res.json({ success: true, message: 'Skills reordered successfully' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// UPDATE
router.put('/:id', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

// DELETE skill
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });
    // Clean up both icons from Cloudinary
    if (skill.icon?.publicId)     await cloudinary.uploader.destroy(skill.icon.publicId).catch(() => {});
    if (skill.iconDark?.publicId) await cloudinary.uploader.destroy(skill.iconDark.publicId).catch(() => {});
    res.json({ success: true, data: {} });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── LIGHT MODE ICON ──────────────────────────────────────────────────────────

// UPLOAD light icon  POST /api/v1/skills/:id/icon
router.post('/:id/icon', protect, authorize('admin', 'editor'), upload.single('icon'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded' });
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });

    if (skill.icon?.publicId) await cloudinary.uploader.destroy(skill.icon.publicId).catch(() => {});

    const result = await uploadBuf(req.file.buffer, {
      folder: 'portfolio/skills',
      transformation: [
        { width: 128, height: 128, crop: 'fit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    skill.icon = { url: result.secure_url, publicId: result.public_id };
    await skill.save({ validateBeforeSave: false });
    res.json({ success: true, data: { icon: skill.icon } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// DELETE light icon  DELETE /api/v1/skills/:id/icon
router.delete('/:id/icon', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, error: 'Not found' });
    if (skill.icon?.publicId) await cloudinary.uploader.destroy(skill.icon.publicId).catch(() => {});
    skill.icon = { url: '', publicId: '' };
    await skill.save({ validateBeforeSave: false });
    res.json({ success: true, data: {} });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── DARK MODE ICON ───────────────────────────────────────────────────────────

// UPLOAD dark icon  POST /api/v1/skills/:id/icon-dark
router.post('/:id/icon-dark', protect, authorize('admin', 'editor'), upload.single('icon'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded' });
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });

    if (skill.iconDark?.publicId) await cloudinary.uploader.destroy(skill.iconDark.publicId).catch(() => {});

    const result = await uploadBuf(req.file.buffer, {
      folder: 'portfolio/skills-dark',
      transformation: [
        { width: 128, height: 128, crop: 'fit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    skill.iconDark = { url: result.secure_url, publicId: result.public_id };
    await skill.save({ validateBeforeSave: false });
    res.json({ success: true, data: { iconDark: skill.iconDark } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// DELETE dark icon  DELETE /api/v1/skills/:id/icon-dark
router.delete('/:id/icon-dark', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, error: 'Not found' });
    if (skill.iconDark?.publicId) await cloudinary.uploader.destroy(skill.iconDark.publicId).catch(() => {});
    skill.iconDark = { url: '', publicId: '' };
    await skill.save({ validateBeforeSave: false });
    res.json({ success: true, data: {} });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
