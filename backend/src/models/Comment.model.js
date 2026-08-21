const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post:      { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
  name:      { type: String, required: true, trim: true, maxlength: 100 },
  email:     { type: String, required: true, trim: true, lowercase: true },
  message:   { type: String, required: true, trim: true, maxlength: 2000 },
  status:    { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true },
  ip:        String,
  userAgent: String,
}, { timestamps: true });

commentSchema.statics.getApproved = function(postId) {
  return this.find({ post: postId, status: 'approved' }).sort({ createdAt: 1 });
};

module.exports = mongoose.model('Comment', commentSchema);
