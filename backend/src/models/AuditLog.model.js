const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName:      String,
  userEmail:     String,
  action:        { type: String, required: true },
  resource:      { type: String, required: true },
  resourceId:    { type: String, default: null },
  resourceTitle: { type: String, default: null },
  changes:       { type: mongoose.Schema.Types.Mixed, default: null },
  ip:            String,
  userAgent:     String,
  status:        { type: String, enum: ['success','failure'], default: 'success' },
  errorMessage:  String,
}, { timestamps: true });

// Auto-delete logs older than 6 months
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
