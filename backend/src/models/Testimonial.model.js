const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'], trim: true, maxlength: 100,
  },
  role: { type: String, trim: true, maxlength: 100 },
  company: { type: String, trim: true, maxlength: 100 },
  quote: {
    type: String, required: [true, 'Quote is required'], maxlength: 1000,
  },
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  featured: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  linkedin: { type: String, default: '' },
}, { timestamps: true });

testimonialSchema.index({ featured: 1, order: -1 });
testimonialSchema.index({ visible: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);