const express = require('express');
const router = express.Router();
const {
  submitContact,
  getContacts,
  getContact,
  updateContactStatus,
  addContactNote,
  deleteContact,
  getContactStats
} = require('../controllers/contact.controller');
const { protect, authorize } = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');

// Public route with rate limiting
router.post('/', contactLimiter, submitContact);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin', 'editor'));

router.get('/', getContacts);
router.get('/stats', getContactStats);
router.get('/:id', getContact);
router.put('/:id/status', updateContactStatus);
router.post('/:id/notes', addContactNote);
router.delete('/:id', authorize('admin'), deleteContact);

module.exports = router;
