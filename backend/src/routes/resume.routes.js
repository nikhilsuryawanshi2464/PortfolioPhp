const express = require('express');
const router = express.Router();

router.get('/download', (req, res) => {
  res.json({ success: true, message: 'Resume download' });
});

module.exports = router;
