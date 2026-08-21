const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a skill name'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['frontend', 'backend', 'database', 'devops', 'tools', 'soft-skills', 'other']
  },
  proficiency: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  // Light mode icon
  icon: {
    url: String,
    publicId: String
  },
  // Dark mode icon (optional — falls back to icon if not set)
  iconDark: {
    url: String,
    publicId: String
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    url: String
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
  timestamps: true
});

skillSchema.index({ category: 1, priority: -1 });

module.exports = mongoose.model('Skill', skillSchema);
