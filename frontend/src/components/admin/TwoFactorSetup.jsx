// frontend/src/components/admin/TwoFactorSetup.jsx
// Feature 14 — 2FA Setup widget for Admin Profile page
// Usage: drop <TwoFactorSetup /> inside your admin Profile page

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@services/api';
import toast from 'react-hot-toast';

export default function TwoFactorSetup() {
  const [status, setStatus]     = useState(null);   // null | { enabled: bool }
  const [step, setStep]         = useState('idle');  // 'idle'|'qr'|'verify'|'done'|'codes'
  const [qrCode, setQrCode]     = useState('');
  const [secret, setSecret]     = useState('');
  const [token, setToken]       = useState('');
  const [backupCodes, setCodes] = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    api.get('/2fa/status').then(r => setStatus(r.data?.data)).catch(() => {});
  }, []);

  const startSetup = async () => {
    setLoading(true);
    try {
      const r = await api.get('/2fa/setup');
      setQrCode(r.data?.data?.qrCode);
      setSecret(r.data?.data?.secret);
      setStep('qr');
    } catch(e) {
      toast.error(e.response?.data?.error || 'Failed. Install speakeasy: npm install speakeasy qrcode');
    }
    setLoading(false);
  };

  const enableTwoFA = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    try {
      const r = await api.post('/2fa/enable', { token });
      setCodes(r.data?.data?.backupCodes || []);
      setStatus({ enabled: true });
      setStep('codes');
      toast.success('2FA enabled!');
    } catch(e) {
      toast.error(e.response?.data?.error || 'Invalid code');
    }
    setLoading(false);
  };

  const disableTwoFA = async () => {
    if (!window.confirm('Disable 2FA? Your account will be less secure.')) return;
    setLoading(true);
    try {
      await api.delete('/2fa/disable');
      setStatus({ enabled: false });
      setStep('idle');
      toast.success('2FA disabled');
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)',
    color: '#e2e8f0', fontSize: 20, outline: 'none', textAlign: 'center',
    letterSpacing: '0.4em', fontFamily: 'monospace', boxSizing: 'border-box',
  };

  return (
    <div style={{
      background: '#0f0f1a', border: '1px solid #1e1e2e',
      borderRadius: 16, padding: 24, marginTop: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>
            Two-Factor Authentication
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            Adds a second layer of security to your admin login
          </div>
        </div>
        <div style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: status?.enabled ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)',
          color: status?.enabled ? '#10b981' : '#6b7280',
          border: `1px solid ${status?.enabled ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
        }}>
          {status === null ? '…' : status.enabled ? '● Enabled' : '○ Disabled'}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── IDLE: show enable/disable button ── */}
        {step === 'idle' && (
          <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            {status?.enabled ? (
              <button onClick={disableTwoFA} disabled={loading}
                style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'rgba(248,113,113,0.1)', color: '#f87171', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
                Disable 2FA
              </button>
            ) : (
              <button onClick={startSetup} disabled={loading}
                style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 700, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                {loading ? 'Setting up…' : '🔐 Set Up 2FA'}
              </button>
            )}
          </motion.div>
        )}

        {/* ── QR CODE step ── */}
        {step === 'qr' && (
          <motion.div key="qr" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, lineHeight: 1.7 }}>
              1. Install <strong style={{ color: '#a78bfa' }}>Google Authenticator</strong> or <strong style={{ color: '#a78bfa' }}>Authy</strong> on your phone<br/>
              2. Scan this QR code with the app
            </p>
            {qrCode && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <img src={qrCode} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 12, background: '#fff', padding: 8 }}/>
              </div>
            )}
            <p style={{ fontSize: 11, color: '#4b5563', textAlign: 'center', marginBottom: 16 }}>
              Or enter manually: <code style={{ color: '#a78bfa', wordBreak: 'break-all' }}>{secret}</code>
            </p>
            <button onClick={() => setStep('verify')}
              style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
              I've scanned it →
            </button>
          </motion.div>
        )}

        {/* ── VERIFY step ── */}
        {step === 'verify' && (
          <motion.div key="verify" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
              Enter the 6-digit code from your authenticator app to confirm:
            </p>
            <form onSubmit={enableTwoFA}>
              <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                value={token} onChange={e => setToken(e.target.value.replace(/\D/g,''))}
                placeholder="000000" style={inp}
                onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.6)'}
                onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.2)'}/>
              <button type="submit" disabled={loading || token.length !== 6}
                style={{ width: '100%', marginTop: 12, padding: '11px', borderRadius: 10, border: 'none', background: loading||token.length!==6?'rgba(99,102,241,0.3)':'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: token.length===6?'pointer':'not-allowed', fontWeight: 700, fontFamily: 'inherit' }}>
                {loading ? 'Verifying…' : '✓ Enable 2FA'}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── BACKUP CODES step ── */}
        {step === 'codes' && (
          <motion.div key="codes" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#10b981', fontWeight: 700, marginBottom: 8 }}>✅ 2FA is now enabled!</p>
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7, marginBottom: 12 }}>
                <strong style={{ color: '#e2e8f0' }}>Save these backup codes</strong> — you can use them to log in if you lose access to your phone. Each can only be used once.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {backupCodes.map(code => (
                  <code key={code} style={{ padding: '6px 10px', background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 7, fontSize: 13, color: '#a78bfa', letterSpacing: '0.1em', textAlign: 'center' }}>
                    {code}
                  </code>
                ))}
              </div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(backupCodes.join('\n')); toast.success('Copied!'); }}
              style={{ width: '100%', padding: '9px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)', background: 'transparent', color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
              Copy Backup Codes
            </button>
            <button onClick={() => setStep('idle')}
              style={{ width: '100%', padding: '9px', borderRadius: 10, border: 'none', background: 'rgba(99,102,241,0.15)', color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
