const express  = require('express');
const router   = express.Router();
const AuditLog = require('../models/AuditLog.model');
const { protect } = require('../middleware/auth');

const fail = (res, msg, code=400) => res.status(code).json({ success:false, error:msg });

// GET /api/v1/audit-log
router.get('/', protect, async (req, res) => {
  try {
    const { page=1, limit=50, action, resource, userId, status } = req.query;
    const filter = {};
    if (action)   filter.action   = new RegExp(action, 'i');
    if (resource) filter.resource = resource;
    if (userId)   filter.user     = userId;
    if (status)   filter.status   = status;
    const skip = (Number(page)-1)*Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).populate('user','name email').sort({ createdAt:-1 }).skip(skip).limit(Number(limit)).lean(),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success:true, data:logs, pagination:{ total, page:Number(page), pages:Math.ceil(total/Number(limit)), limit:Number(limit) } });
  } catch(e) { fail(res, e.message, 500); }
});

// DELETE /api/v1/audit-log  — clear logs older than 30 days
router.delete('/', protect, async (req, res) => {
  try {
    const threshold = new Date(Date.now() - 30*24*60*60*1000);
    const result = await AuditLog.deleteMany({ createdAt: { $lt: threshold } });
    res.json({ success:true, data:{ deleted: result.deletedCount } });
  } catch(e) { fail(res, e.message, 500); }
});

module.exports = router;
