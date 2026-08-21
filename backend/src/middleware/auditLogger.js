const AuditLog = require('../models/AuditLog.model');

/**
 * auditLog middleware — logs admin actions after a 2xx response.
 * Usage: router.post('/', protect, auditLog('CREATE_PROJECT', 'Project'), handler);
 */
const auditLog = (action, resource) => (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function(body) {
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      AuditLog.create({
        user:         req.user._id || req.user.id,
        userName:     req.user.name,
        userEmail:    req.user.email,
        action, resource,
        resourceId:    req.params.id || body?.data?._id?.toString() || null,
        resourceTitle: body?.data?.title || body?.data?.name || body?.data?.slug || null,
        ip:           req.ip || req.connection?.remoteAddress,
        userAgent:    req.get('User-Agent'),
        status:       'success',
      }).catch(() => {});
    }
    return originalJson(body);
  };
  next();
};

const logAuditError = async (req, action, resource, errorMessage) => {
  if (!req?.user) return;
  try {
    await AuditLog.create({
      user: req.user._id || req.user.id, userName: req.user.name, userEmail: req.user.email,
      action, resource, resourceId: req.params?.id || null,
      ip: req.ip || req.connection?.remoteAddress, userAgent: req.get('User-Agent'),
      status: 'failure', errorMessage,
    });
  } catch {}
};

module.exports = { auditLog, logAuditError };
