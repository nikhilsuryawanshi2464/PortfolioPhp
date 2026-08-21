const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const cloudinary = require('cloudinary').v2;
const Blog     = require('../models/Blog.model');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload   = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const uploadBuf = (buf, opts) => new Promise((res, rej) => {
  cloudinary.uploader.upload_stream(opts, (e,r) => e ? rej(e) : res(r)).end(buf);
});

// ── PUBLIC ───────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page=1, limit=10, tag, category, search, featured } = req.query;
    const isAdmin = req.user?.role === 'admin';
    const filter  = isAdmin ? {} : { published: true };
    if (tag)      filter.tags     = tag;
    if (category) filter.category = category;
    if (featured) filter.featured = featured === 'true';
    if (search)   filter.$text    = { $search: search };
    const skip  = (parseInt(page)-1) * parseInt(limit);
    const posts = await Blog.find(filter)
      .populate('author','name avatar')
      .select('-content')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip).limit(parseInt(limit));
    const total = await Blog.countDocuments(filter);
    res.json({ success:true, data:posts, pagination:{ page:+page, limit:+limit, total, pages:Math.ceil(total/+limit) } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const post = await Blog.findOne({ slug: req.params.slug }).populate('author','name avatar bio');
    if (!post || (!post.published && !isAdmin))
      return res.status(404).json({ success:false, error:'Post not found' });
    Blog.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).exec();
    res.json({ success:true, data:post });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── ADMIN ONLY ───────────────────────────────────────────────
router.use(protect, authorize('admin','editor'));

router.get('/id/:id', async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id).populate('author', 'name avatar bio');
    if (!post) return res.status(404).json({ success:false, error:'Post not found' });
    res.json({ success:true, data:post });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const post = await Blog.create({ ...req.body, author: req.user.id });
    res.status(201).json({ success:true, data:post });
  } catch(e) { res.status(400).json({ success:false, error:e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.body.title && !req.body.slug)
      req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    const post = await Blog.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if (!post) return res.status(404).json({ success:false, error:'Not found' });
    res.json({ success:true, data:post });
  } catch(e) { res.status(400).json({ success:false, error:e.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const post = await Blog.findByIdAndDelete(req.params.id);
    if (post?.coverImage?.publicId) await cloudinary.uploader.destroy(post.coverImage.publicId).catch(()=>{});
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.post('/:id/cover', upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, error:'No file' });
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success:false, error:'Not found' });
    if (post.coverImage?.publicId) await cloudinary.uploader.destroy(post.coverImage.publicId).catch(()=>{});
    const result = await uploadBuf(req.file.buffer, {
      folder: 'portfolio/blog',
      transformation:[{ width:1200, height:630, crop:'fill', gravity:'auto' },{ quality:'auto:good' },{ fetch_format:'auto' }],
    });
    post.coverImage = { url:result.secure_url, publicId:result.public_id, alt:post.title };
    await post.save({ validateBeforeSave:false });
    res.json({ success:true, data:{ coverImage:post.coverImage } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;
