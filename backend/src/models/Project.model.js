const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: String, // Rich text content (HTML/Markdown)
    required: true
  },
  contentType: {
    type: String,
    enum: ['markdown', 'html'],
    default: 'markdown'
  },
  thumbnail: {
    url: String,
    publicId: String,
    alt: String
  },
  images: [{
    url: String,
    publicId: String,
    title: String,
    caption: String,
    description: String
  }],
  technologies: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['web', 'mobile', 'desktop', 'ai-ml', 'devops', 'other'],
    default: 'web'
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'archived'],
    default: 'completed'
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0 // Higher priority appears first
  },
  links: {
    live: String,
    github: String,
    demo: String,
    case_study: String
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  relatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  client: {
    name: String,
    logo: String,
    testimonial: String
  },
  duration: {
    start: Date,
    end: Date
  },
  team: [{
    name: String,
    role: String,
    avatar: String
  }],
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug from title
projectSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Text search index
projectSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text',
  technologies: 'text'
});

// Indexes for common queries
projectSchema.index({ slug: 1 });
projectSchema.index({ published: 1, priority: -1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for reading time (words per minute)
projectSchema.virtual('readingTime').get(function() {
  if (!this.content) return 0;
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Method to increment views
projectSchema.methods.incrementViews = async function() {
  this.metrics.views += 1;
  await this.save();
};

// Static method to get related projects based on tags and technologies
projectSchema.statics.findRelated = async function(projectId, limit = 3) {
  const project = await this.findById(projectId);
  if (!project) return [];

  const relatedProjects = await this.find({
    _id: { $ne: projectId },
    published: true,
    $or: [
      { tags: { $in: project.tags } },
      { technologies: { $in: project.technologies } },
      { category: project.category }
    ]
  })
  .limit(limit)
  .select('title slug description thumbnail tags technologies')
  .sort({ priority: -1, createdAt: -1 });

  return relatedProjects;
};

module.exports = mongoose.model('Project', projectSchema);
