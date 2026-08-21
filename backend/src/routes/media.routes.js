// backend/src/routes/media.routes.js
// Feature 18 — Admin Media Library (Cloudinary browser)
// Lists, searches and deletes files from your Cloudinary account

const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, authorize } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10*1024*1024 } });
const ok   = (res, data, code=200) => res.status(code).json({ success:true, data });
const fail = (res, msg,  code=400) => res.status(code).json({ success:false, error:msg });

// GET /api/v1/media — list all media (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      max_results = 30,
      next_cursor = null,
      folder = null,
      resource_type = 'image',
      prefix = 'portfolio', // your Cloudinary folder prefix
    } = req.query;

    const options = {
      type: 'upload',
      resource_type,
      max_results: Math.min(Number(max_results), 100),
    };

    if (next_cursor) options.next_cursor = next_cursor;
    if (folder && folder !== 'All') {
      options.prefix = folder;
    } else {
      options.prefix = prefix;
    }

    const result = await cloudinary.api.resources(options);

    ok(res, {
      resources:   result.resources || [],
      next_cursor: result.next_cursor || null,
      total_count: result.total_count || 0,
    });
  } catch(e) { fail(res, e.message, 500); }
});

// POST /api/v1/media/upload — upload a file (admin only)
router.post('/upload', protect, authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return fail(res, 'No file provided');

    const folder = req.body.folder || 'portfolio/general';

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto', quality: 'auto:good' },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(req.file.buffer);
    });

    ok(res, {
      public_id:   result.public_id,
      secure_url:  result.secure_url,
      width:       result.width,
      height:      result.height,
      format:      result.format,
      bytes:       result.bytes,
      resource_type: result.resource_type,
    }, 201);
  } catch(e) { fail(res, e.message, 500); }
});

// DELETE /api/v1/media/:publicId — delete from Cloudinary (admin only)
router.delete('/:publicId', protect, authorize('admin'), async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'not found') return fail(res, 'File not found on Cloudinary', 404);
    ok(res, { deleted: publicId });
  } catch(e) { fail(res, e.message, 500); }
});

// GET /api/v1/media/search?q=keyword — search by tag or filename
router.get('/search', protect, authorize('admin'), async (req, res) => {
  try {
    const { q = '', max_results = 20 } = req.query;
    if (!q) return fail(res, 'Search query required');

    const result = await cloudinary.search
      .expression(`folder:portfolio* AND (tags=${q} OR public_id:*${q}*)`)
      .sort_by('created_at', 'desc')
      .max_results(Number(max_results))
      .execute();

    ok(res, {
      resources:   result.resources || [],
      total_count: result.total_count || 0,
    });
  } catch(e) { fail(res, e.message, 500); }
});

module.exports = router;
