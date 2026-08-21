import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || '/api/v1';

const AdminSettings = () => {
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (pw.newPw !== pw.confirm) { setPwErr('New passwords do not match'); return; }
    if (pw.newPw.length < 6) { setPwErr('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPw })
      });
      const data = await res.json();
      if (res.ok) { setPwMsg('Password updated successfully!'); setPw({ current: '', newPw: '', confirm: '' }); }
      else setPwErr(data.message || 'Failed to update password');
    } catch { setPwErr('Network error'); }
    setSaving(false);
  };

  return (
    <>
      <style>{`
        .set-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #e8e6f0; letter-spacing: -0.5px; margin-bottom: 28px; }
        .set-card { background: #0f0f1a; border: 1px solid #1e1e2e; border-radius: 14px; padding: 28px; margin-bottom: 20px; max-width: 520px; }
        .set-card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #c4b5fd; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #1e1e2e; display: flex; align-items: center; gap: 8px; }
        .set-field { margin-bottom: 16px; }
        .set-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a4a6a; margin-bottom: 8px; display: block; }
        .set-input { width: 100%; padding: 10px 14px; background: #13131f; border: 1px solid #1e1e2e; border-radius: 9px; color: #e8e6f0; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .set-input:focus { border-color: #a78bfa; }
        .set-btn { padding: 10px 22px; background: linear-gradient(135deg, #a78bfa, #60a5fa); border: none; border-radius: 9px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; font-family: 'DM Sans', sans-serif; }
        .set-btn:hover { opacity: 0.85; }
        .set-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .set-success { margin-top: 14px; padding: 10px 14px; background: #0d2a1f; border: 1px solid #1a4a35; border-radius: 9px; color: #34d399; font-size: 13px; }
        .set-error { margin-top: 14px; padding: 10px 14px; background: #1f1520; border: 1px solid #3a1a25; border-radius: 9px; color: #f87171; font-size: 13px; }
        .set-info { display: flex; flex-direction: column; gap: 12px; }
        .set-info-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #13131f; }
        .set-info-row:last-child { border-bottom: none; }
        .set-info-key { font-size: 13px; color: #6b6b8a; }
        .set-info-val { font-size: 13px; color: #c4b5fd; font-weight: 500; }
      `}</style>

      <div className="set-title">Settings</div>

      {/* Account Info */}
      <div className="set-card">
        <div className="set-card-title">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Account Info
        </div>
        <div className="set-info">
          <div className="set-info-row">
            <span className="set-info-key">Email</span>
            <span className="set-info-val">admin@portfolio.com</span>
          </div>
          <div className="set-info-row">
            <span className="set-info-key">Role</span>
            <span className="set-info-val">Administrator</span>
          </div>
          <div className="set-info-row">
            <span className="set-info-key">Backend</span>
            <span className="set-info-val" style={{ color: '#34d399' }}>● Connected</span>
          </div>
          <div className="set-info-row">
            <span className="set-info-key">API URL</span>
            <span className="set-info-val">localhost:5001</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="set-card">
        <div className="set-card-title">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Change Password
        </div>
        <form onSubmit={handlePassword}>
          <div className="set-field">
            <label className="set-label">Current Password</label>
            <input className="set-input" type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} required />
          </div>
          <div className="set-field">
            <label className="set-label">New Password</label>
            <input className="set-input" type="password" value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} required />
          </div>
          <div className="set-field">
            <label className="set-label">Confirm New Password</label>
            <input className="set-input" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required />
          </div>
          <button className="set-btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Update Password'}
          </button>
          {pwMsg && <div className="set-success">✓ {pwMsg}</div>}
          {pwErr && <div className="set-error">✕ {pwErr}</div>}
        </form>
      </div>
    </>
  );
};

export default AdminSettings;
