const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const Comment  = require('../models/Comment.model');
const Blog     = require('../models/Blog.model');
const { protect } = require('../middleware/auth');

const ok   = (res, data, code=200) => res.status(code).json({ success:true, data });
const fail = (res, msg, code=400)  => res.status(code).json({ success:false, error:msg });

const resolveBlog = async (param) => {
  if (mongoose.Types.ObjectId.isValid(param)) return Blog.findById(param).select('_id');
  return Blog.findOne({ slug: param }).select('_id');
};

// GET /api/v1/comments?post=<slug|id>  — approved comments only
router.get('/', async (req, res) => {
  try {
    const { post } = req.query;
    if (!post) return fail(res, 'post query param required');
    const blog = await resolveBlog(post);
    if (!blog) return ok(res, []);
    ok(res, await Comment.getApproved(blog._id));
  } catch(e) { fail(res, e.message, 500); }
});

// POST /api/v1/comments  — submit a comment (pending approval)
router.post('/', async (req, res) => {
  try {
    const { post, name, email, message } = req.body;
    if (!post||!name||!email||!message) return fail(res, 'post, name, email, message required');
    if (message.length > 2000) return fail(res, 'Comment too long (max 2000 chars)');
    const blog = await resolveBlog(post);
    if (!blog) return fail(res, 'Blog post not found', 404);
    const comment = await Comment.create({
      post: blog._id,
      name: name.trim().slice(0,100),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      ip: req.ip, userAgent: req.get('User-Agent'), status: 'pending',
    });
    ok(res, comment, 201);
  } catch(e) { fail(res, e.message, 500); }
});

// GET /api/v1/comments/admin  — all comments (admin)
router.get('/admin', protect, async (req, res) => {
  try {
    const { status, page=1, limit=30 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page)-1)*Number(limit);
    const [comments, total] = await Promise.all([
      Comment.find(filter).populate('post','title slug').sort({ createdAt:-1 }).skip(skip).limit(Number(limit)),
      Comment.countDocuments(filter),
    ]);
    res.json({ success:true, data:comments, pagination:{ total, page:Number(page), pages:Math.ceil(total/limit) } });
  } catch(e) { fail(res, e.message, 500); }
});

// PUT /api/v1/comments/:id/status  — approve/reject (admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved','rejected','pending'].includes(status)) return fail(res, 'Invalid status');
    const comment = await Comment.findByIdAndUpdate(req.params.id, { status }, { new:true });
    if (!comment) return fail(res, 'Comment not found', 404);
    ok(res, comment);
  } catch(e) { fail(res, e.message, 500); }
});

// DELETE /api/v1/comments/:id  — delete (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return fail(res, 'Comment not found', 404);
    ok(res, { message: 'Deleted' });
  } catch(e) { fail(res, e.message, 500); }
});

module.exports = router;
