const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title:    { type: String, required: [true,'Title required'], trim: true, maxlength: 200 },
  slug:     { type: String, unique: true, lowercase: true, trim: true },
  excerpt:  { type: String, maxlength: 400, trim: true },
  content:  { type: String, required: [true,'Content required'] },
  coverImage: {
    url:      { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt:      { type: String, default: '' },
  },
  tags:     [{ type: String, trim: true, lowercase: true }],
  category: {
    type: String,
    enum: ['tutorial','case-study','opinion','news','project','other'],
    default: 'other',
  },
  published:   { type: Boolean, default: false },
  publishedAt: { type: Date },
  featured:    { type: Boolean, default: false },
  readTime:    { type: Number, default: 0 },
  views:       { type: Number, default: 0 },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seo: {
    metaTitle: { type: String, maxlength: 70 },
    metaDesc:  { type: String, maxlength: 160 },
  },
}, { timestamps: true });

blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug)
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  if (this.isModified('content'))
    this.readTime = Math.max(1, Math.ceil(this.content.split(/\s+/).length / 200));
  if (this.isModified('published') && this.published && !this.publishedAt)
    this.publishedAt = new Date();
  next();
});

blogSchema.index({ published: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ featured: 1 });
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
