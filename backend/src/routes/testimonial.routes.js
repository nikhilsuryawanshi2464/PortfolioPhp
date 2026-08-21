const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const cloudinary = require('cloudinary').v2;
const Testimonial = require('../models/Testimonial.model');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const uploadBuffer = (buf, opts) => new Promise((res, rej) => {
  const s = cloudinary.uploader.upload_stream(opts, (e, r) => e ? rej(e) : res(r));
  s.end(buf);
});

// GET all (public — only visible)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const filter = req.user?.role === 'admin' ? {} : { visible: true };
    const items  = await Testimonial.find(filter).sort({ order: -1, createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// All routes below require admin
router.use(protect, authorize('admin'));

// CREATE
router.post('/', async (req, res) => {
  try {
    const t = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (e) { res.status(400).json({ success: false, error: e.message }); }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: t });
  } catch (e) { res.status(400).json({ success: false, error: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id);
    if (t?.avatarPublicId) await cloudinary.uploader.destroy(t.avatarPublicId).catch(() => {});
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// UPLOAD AVATAR
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file' });
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, error: 'Not found' });
    if (t.avatarPublicId) await cloudinary.uploader.destroy(t.avatarPublicId).catch(() => {});
    const result = await uploadBuffer(req.file.buffer, {
      folder: 'portfolio/testimonials',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }, { quality: 'auto:good' }],
    });
    t.avatar = result.secure_url;
    t.avatarPublicId = result.public_id;
    await t.save({ validateBeforeSave: false });
    res.json({ success: true, data: { avatar: t.avatar } });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;