const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 600 },
  icon:        { type: String, default: '💼' },
  features:    [{ type: String, trim: true }],
  priceType:   { type: String, enum:['fixed','hourly','monthly','contact'], default:'contact' },
  priceFrom:   { type: Number },
  priceTo:     { type: Number },
  currency:    { type: String, default: 'USD', maxlength: 10 },
  popular:     { type: Boolean, default: false },
  visible:     { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
  cta:         { type: String, default: 'Get in Touch' },
  ctaLink:     { type: String, default: '/contact' },
}, { timestamps: true });

serviceSchema.index({ visible:1, order:-1 });

module.exports = mongoose.model('Service', serviceSchema);