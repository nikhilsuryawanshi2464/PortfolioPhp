const express = require('express');
const router  = express.Router();
const Cert    = require('../models/Certification.model');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const filter = req.user?.role === 'admin' ? {} : { visible: true };
    const items  = await Cert.find(filter).sort({ order:-1, year:-1 });
    res.json({ success:true, data:items });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.use(protect, authorize('admin'));

router.post('/', async (req, res) => {
  try {
    const item = await Cert.create(req.body);
    res.status(201).json({ success:true, data:item });
  } catch(e) { res.status(400).json({ success:false, error:e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Cert.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if (!item) return res.status(404).json({ success:false, error:'Not found' });
    res.json({ success:true, data:item });
  } catch(e) { res.status(400).json({ success:false, error:e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Cert.findByIdAndDelete(req.params.id);
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;