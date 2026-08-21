// backend/src/routes/twofa.routes.js
// Feature 14 — 2FA (TOTP) for Admin Login
// Install dependency: npm install speakeasy qrcode
const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const TwoFactor = require('../models/TwoFactor.model');
const User      = require('../models/User.model');

const ok   = (res, data, code=200) => res.status(code).json({ success:true, data });
const fail = (res, msg,  code=400) => res.status(code).json({ success:false, error:msg });

// Lazy-load speakeasy and qrcode so server still starts if not installed
const getSpeakeasy = () => { try { return require('speakeasy'); } catch { return null; } };
const getQRCode    = () => { try { return require('qrcode');    } catch { return null; } };

// GET /api/v1/2fa/setup — generate QR code for scanning
router.get('/setup', protect, authorize('admin'), async (req, res) => {
  const speakeasy = getSpeakeasy();
  const QRCode    = getQRCode();
  if (!speakeasy || !QRCode) return fail(res, 'Run: npm install speakeasy qrcode in backend', 501);

  try {
    const user   = await User.findById(req.user.id);
    const secret = speakeasy.generateSecret({
      name: `Portfolio Admin (${user.email})`,
      issuer: 'Portfolio',
      length: 20,
    });

    // Save temp secret (not yet enabled)
    await TwoFactor.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, secret: secret.base32, enabled: false },
      { upsert: true, new: true }
    );

    const qrUrl = await QRCode.toDataURL(secret.otpauth_url);
    ok(res, { qrCode: qrUrl, secret: secret.base32, otpauth: secret.otpauth_url });
  } catch(e) { fail(res, e.message, 500); }
});

// POST /api/v1/2fa/enable — verify token and enable 2FA
router.post('/enable', protect, authorize('admin'), async (req, res) => {
  const speakeasy = getSpeakeasy();
  if (!speakeasy) return fail(res, 'Run: npm install speakeasy qrcode', 501);

  try {
    const { token } = req.body;
    if (!token) return fail(res, 'Token required');

    const tfa = await TwoFactor.findOne({ user: req.user.id });
    if (!tfa) return fail(res, 'Run /setup first');

    const valid = speakeasy.totp.verify({
      secret: tfa.secret, encoding: 'base32', token, window: 1,
    });
    if (!valid) return fail(res, 'Invalid code. Try again.');

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => ({
      code: Math.random().toString(36).slice(2,10).toUpperCase(), used: false,
    }));
    tfa.enabled     = true;
    tfa.backupCodes = backupCodes;
    await tfa.save();

    ok(res, { enabled: true, backupCodes: backupCodes.map(b => b.code) });
  } catch(e) { fail(res, e.message, 500); }
});

// POST /api/v1/2fa/verify — called during login if 2FA enabled
router.post('/verify', async (req, res) => {
  const speakeasy = getSpeakeasy();
  if (!speakeasy) return fail(res, 'Run: npm install speakeasy qrcode', 501);

  try {
    const { userId, token } = req.body;
    if (!userId || !token) return fail(res, 'userId and token required');

    const tfa = await TwoFactor.findOne({ user: userId, enabled: true });
    if (!tfa) return ok(res, { valid: true, message: '2FA not enabled' });

    // Check TOTP
    const valid = speakeasy.totp.verify({
      secret: tfa.secret, encoding: 'base32', token, window: 1,
    });

    if (!valid) {
      // Check backup codes
      const backup = tfa.backupCodes.find(b => !b.used && b.code === token.toUpperCase());
      if (backup) {
        backup.used = true;
        await tfa.save();
        return ok(res, { valid: true, usedBackup: true });
      }
      return fail(res, 'Invalid 2FA code', 401);
    }
    ok(res, { valid: true });
  } catch(e) { fail(res, e.message, 500); }
});

// DELETE /api/v1/2fa/disable — turn off 2FA
router.delete('/disable', protect, authorize('admin'), async (req, res) => {
  try {
    await TwoFactor.findOneAndDelete({ user: req.user.id });
    ok(res, { disabled: true });
  } catch(e) { fail(res, e.message, 500); }
});

// GET /api/v1/2fa/status — check if 2FA is enabled
router.get('/status', protect, async (req, res) => {
  try {
    const tfa = await TwoFactor.findOne({ user: req.user.id });
    ok(res, { enabled: !!(tfa?.enabled) });
  } catch(e) { fail(res, e.message, 500); }
});

module.exports = router;
