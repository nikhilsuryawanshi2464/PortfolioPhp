const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide a name'], trim: true, maxlength: [50, 'Name cannot exceed 50 characters'] },
  email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true, trim: true, match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'] },
  password: { type: String, required: [true, 'Please provide a password'], minlength: [6, 'Password must be at least 6 characters'], select: false },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },

  // ── PROFILE ──────────────────────────────────────────────
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  title: { type: String, default: 'Full-Stack Developer', maxlength: 100 },
  bio: { type: String, maxlength: 1000 },
  tagline: { type: String, maxlength: 200 },
  location: { type: String, maxlength: 100 },
  phone: { type: String, maxlength: 30 },
  contactEmail: { type: String, maxlength: 100 },
  yearsOfExperience: { type: Number, default: 0 },
  availableForWork: { type: Boolean, default: true },
  social: {
    github:   { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter:  { type: String, default: '' },
    website:  { type: String, default: '' },
    instagram:{ type: String, default: '' },
  },

  // ── RESUME ───────────────────────────────────────────────
  resume: {
    url:         { type: String, default: '' },
    publicId:    { type: String, default: '' },
    fileName:    { type: String, default: '' },
    uploadedAt:  { type: Date },
    downloadCount: { type: Number, default: 0 },
  },

  // ── AUTH ─────────────────────────────────────────────────
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String, select: false },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword  = async function(p) { return await bcrypt.compare(p, this.password); };
userSchema.methods.generateToken    = function() { return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE }); };
userSchema.methods.generateRefreshToken = function() { return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE }); };
userSchema.methods.changedPasswordAfter = function(ts) {
  if (this.passwordChangedAt) return ts < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  return false;
};
userSchema.methods.toJSON = function() {
  const u = this.toObject();
  delete u.password; delete u.refreshToken; delete u.__v;
  return u;
};

module.exports = mongoose.model('User', userSchema);
