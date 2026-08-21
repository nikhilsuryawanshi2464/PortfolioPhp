const mongoose = require('mongoose');

const navLinkSchema = new mongoose.Schema({
  label:   { type: String, required: true },
  path:    { type: String, required: true },
  visible: { type: Boolean, default: true },
  order:   { type: Number, default: 0 },
}, { _id: false });

const siteSettingsSchema = new mongoose.Schema({
  siteName:         { type: String, default: 'My Portfolio' },
  ownerName:        { type: String, default: 'Nikhil Suryawanshi' },
  tagline:          { type: String, default: 'Full-Stack Developer' },
  bio:              { type: String, default: '' },
  availableForWork: { type: Boolean, default: true },
  contactEmail:     { type: String, default: '' },
  phone:            { type: String, default: '' },
  location:         { type: String, default: '' },

  // ── Dynamic Navigation ─────────────────────────────────────
  logoText: {
    prefix: { type: String, default: 'dev' },
    suffix: { type: String, default: '.portfolio' },
  },
  showHireBtn:  { type: Boolean, default: true },
  hireBtnLabel: { type: String, default: 'Hire Me' },
  navLinks: {
    type: [navLinkSchema],
    default: [
      { label: 'Home',       path: '/',           visible: true, order: 0 },
      { label: 'Projects',   path: '/projects',   visible: true, order: 1 },
      { label: 'Blog',       path: '/blog',       visible: true, order: 2 },
      { label: 'Experience', path: '/experience', visible: true, order: 3 },
      { label: 'About',      path: '/about',      visible: true, order: 4 },
      { label: 'Contact',    path: '/contact',    visible: true, order: 5 },
    ],
  },

  // ── Scheduling ─────────────────────────────────────────────
  calendlyUrl: { type: String, default: '' },

  // ── Social ─────────────────────────────────────────────────
  social: {
    github:    { type: String, default: '' },
    linkedin:  { type: String, default: '' },
    twitter:   { type: String, default: '' },
    website:   { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube:   { type: String, default: '' },
  },

  // ── SEO per page ───────────────────────────────────────────
  seo: {
    home:       { title: String, description: String, ogImage: String },
    about:      { title: String, description: String, ogImage: String },
    projects:   { title: String, description: String, ogImage: String },
    blog:       { title: String, description: String, ogImage: String },
    contact:    { title: String, description: String, ogImage: String },
    experience: { title: String, description: String, ogImage: String },
  },

  // ── Theme ──────────────────────────────────────────────────
  theme: {
    accentColor:     { type: String, default: '#6366f1' },
    accentColorEnd:  { type: String, default: '#8b5cf6' },
    fontDisplay:     { type: String, default: 'Syne' },
    fontBody:        { type: String, default: 'DM Sans' },
    darkModeDefault: { type: Boolean, default: true },
  },

  // ── Email Notifications ────────────────────────────────────
  emailNotifications: {
    enabled:       { type: Boolean, default: false },
    onNewContact:  { type: Boolean, default: true },
    sendAutoReply: { type: Boolean, default: true },
    adminEmail:    { type: String, default: '' },
  },

  // ── GitHub ─────────────────────────────────────────────────
  github: {
    username: { type: String, default: '' },
    autoSync: { type: Boolean, default: false },
    syncedAt: { type: Date },
  },

  // ── Footer ─────────────────────────────────────────────────
  footerText: { type: String, default: '© {year} · Built with React & ❤️' },

}, { timestamps: true });

siteSettingsSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
