const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Please provide position title'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    default: 'full-time'
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: [true, 'Please provide description']
  },
  responsibilities: [{
    type: String
  }],
  achievements: [{
    type: String
  }],
  technologies: [{
    type: String
  }],
  companyLogo: {
    url: String,
    publicId: String
  },
  companyWebsite: String,
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  priority: {
    type: Number,
    default: 0
  },
  visible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration calculation
experienceSchema.virtual('duration').get(function() {
  const end = this.current ? new Date() : this.endDate;
  if (!end) return null;
  
  const months = (end.getFullYear() - this.startDate.getFullYear()) * 12 + 
                 (end.getMonth() - this.startDate.getMonth());
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  return {
    years,
    months: remainingMonths,
    totalMonths: months,
    formatted: years > 0 
      ? `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`
      : `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`
  };
});

// Indexes
experienceSchema.index({ startDate: -1 });
experienceSchema.index({ current: 1 });
experienceSchema.index({ priority: -1 });

module.exports = mongoose.model('Experience', experienceSchema);
