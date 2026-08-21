const mongoose = require('mongoose');

const certSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['certification','education','bootcamp','course','award'],
    default: 'certification',
  },
  title:        { type: String, required: true, trim: true, maxlength: 200 },
  institution:  { type: String, required: true, trim: true, maxlength: 200 },
  degree:       { type: String, trim: true, maxlength: 200 },
  year:         { type: Number },
  endYear:      { type: Number },
  credentialId: { type: String, trim: true },
  credentialUrl:{ type: String, trim: true },
  logo:         { type: String, default: '' },
  logoPublicId: { type: String, default: '' },
  description:  { type: String, maxlength: 500 },
  skills:       [{ type: String, trim: true }],
  featured:     { type: Boolean, default: false },
  visible:      { type: Boolean, default: true },
  order:        { type: Number, default: 0 },
}, { timestamps: true });

certSchema.index({ type:1, order:-1 });
certSchema.index({ visible:1 });

module.exports = mongoose.model('Certification', certSchema);