// backend/src/models/Subscriber.model.js
// Feature 15 — Newsletter Subscribe
const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:      { type: String, trim: true, default: '' },
  source:    { type: String, default: 'website' }, // 'website', 'blog', 'footer'
  active:    { type: Boolean, default: true },
  confirmedAt: { type: Date },
  tags:      [{ type: String }],
  ipAddress: { type: String },
}, { timestamps: true });

subscriberSchema.index({ email: 1 });
subscriberSchema.index({ active: 1, createdAt: -1 });

module.exports = mongoose.model('Subscriber', subscriberSchema);
