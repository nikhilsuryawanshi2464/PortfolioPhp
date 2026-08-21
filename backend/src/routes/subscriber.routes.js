// backend/src/routes/subscriber.routes.js
// Feature 15 — Newsletter Subscribe
const express    = require('express');
const router     = express.Router();
const Subscriber = require('../models/Subscriber.model');
const { protect, authorize } = require('../middleware/auth');

const ok   = (res, data, code=200) => res.status(code).json({ success:true, data });
const fail = (res, msg, code=400)  => res.status(code).json({ success:false, error:msg });

// POST /api/v1/subscribers — public subscribe
router.post('/', async (req, res) => {
  try {
    const { email, name, source } = req.body;
    if (!email) return fail(res, 'Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 'Invalid email format');

    const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (existing.active) return ok(res, { message: 'Already subscribed!' });
      // Re-activate
      existing.active = true;
      await existing.save();
      return ok(res, { message: 'Welcome back! You have been re-subscribed.' });
    }

    await Subscriber.create({
      email: email.toLowerCase().trim(),
      name: name?.trim() || '',
      source: source || 'website',
      ipAddress: req.ip,
    });
    ok(res, { message: 'Subscribed successfully! Thank you.' }, 201);
  } catch(e) {
    if (e.code === 11000) return ok(res, { message: 'Already subscribed!' });
    fail(res, e.message, 500);
  }
});

// POST /api/v1/subscribers/unsubscribe — public unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return fail(res, 'Email required');
    await Subscriber.findOneAndUpdate({ email: email.toLowerCase() }, { active: false });
    ok(res, { message: 'You have been unsubscribed.' });
  } catch(e) { fail(res, e.message, 500); }
});

// GET /api/v1/subscribers — admin list
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page=1, limit=50, active } = req.query;
    const filter = {};
    if (active !== undefined) filter.active = active === 'true';
    const skip = (Number(page)-1)*Number(limit);
    const [subscribers, total] = await Promise.all([
      Subscriber.find(filter).sort({ createdAt:-1 }).skip(skip).limit(Number(limit)),
      Subscriber.countDocuments(filter),
    ]);
    res.json({ success:true, data:{ subscribers, total, page:Number(page), pages:Math.ceil(total/Number(limit)) } });
  } catch(e) { fail(res, e.message, 500); }
});

// GET /api/v1/subscribers/export — CSV export (admin)
router.get('/export', protect, authorize('admin'), async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ active:true }).sort({ createdAt:-1 });
    const csv = [
      'Email,Name,Source,Subscribed At',
      ...subscribers.map(s =>
        `"${s.email}","${s.name || ''}","${s.source || 'website'}","${s.createdAt.toISOString()}"`
      )
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
    res.send(csv);
  } catch(e) { fail(res, e.message, 500); }
});

// DELETE /api/v1/subscribers/:id — admin delete
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    ok(res, {});
  } catch(e) { fail(res, e.message, 500); }
});

module.exports = router;
