const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, uploadAvatar,
  uploadResume, downloadResume, deleteResume, upload
} = require('../controllers/profile.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/',                  getProfile);
router.get('/resume/download',   downloadResume);

// Protected routes (admin only)
router.use(protect);
router.use(authorize('admin'));

router.put('/',              updateProfile);
router.post('/avatar',       upload.single('avatar'),  uploadAvatar);
router.post('/resume',       upload.single('resume'),  uploadResume);
router.delete('/resume',     deleteResume);

module.exports = router;
