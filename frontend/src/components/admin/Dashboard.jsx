import { useEffect, useState } from 'react';

const stats = [
  { label: 'Total Projects', key: 'projects', icon: '◈', color: '#a78bfa' },
  { label: 'Contacts', key: 'contacts', icon: '◉', color: '#60a5fa' },
  { label: 'Page Views', key: 'views', icon: '◎', color: '#34d399' },
  { label: 'Skills', key: 'skills', icon: '◇', color: '#f472b6' },
];

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ projects: 0, contacts: 0, views: 0, skills: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Animate counters
    setTimeout(() => {
      setCounts({ projects: 0, contacts: 0, views: 0, skills: 0 });
      setLoading(false);
    }, 400);
  }, []);

  return (
    <>
      <style>{`
        .dash-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #e8e6f0; margin-bottom: 6px; letter-spacing: -0.5px; }
        .dash-sub { font-size: 14px; color: #4a4a6a; margin-bottom: 32px; }
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .dash-card { background: #0f0f1a; border: 1px solid #1e1e2e; border-radius: 14px; padding: 24px; transition: border-color 0.2s, transform 0.2s; }
        .dash-card:hover { border-color: #2e2a4a; transform: translateY(-2px); }
        .dash-card-icon { font-size: 22px; margin-bottom: 16px; }
        .dash-card-val { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; margin-bottom: 4px; }
        .dash-card-label { font-size: 13px; color: #4a4a6a; }
        .dash-section-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #c4b5fd; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; }
        .dash-quick { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
        .dash-quick-btn { background: #0f0f1a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; gap: 12px; text-decoration: none; color: #8888aa; font-size: 14px; font-weight: 500; transition: all 0.2s; cursor: pointer; }
        .dash-quick-btn:hover { border-color: #a78bfa; color: #c4b5fd; background: #1e1a3a; }
        .dash-tip { margin-top: 32px; background: linear-gradient(135deg, #1e1a3a, #0f1a2e); border: 1px solid #2e2a4a; border-radius: 14px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; }
        .dash-tip-icon { font-size: 24px; flex-shrink: 0; }
        .dash-tip-text { font-size: 13px; color: #6b6b8a; line-height: 1.6; }
        .dash-tip-text strong { color: #a78bfa; }
      `}</style>

      <div className="dash-title">Welcome back 👋</div>
      <div className="dash-sub">Here's what's happening with your portfolio.</div>

      {/* Stats */}
      <div className="dash-grid">
        {stats.map(s => (
          <div className="dash-card" key={s.key}>
            <div className="dash-card-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="dash-card-val" style={{ color: s.color }}>
              {loading ? '—' : counts[s.key]}
            </div>
            <div className="dash-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dash-section-title">Quick Actions</div>
      <div className="dash-quick">
        <a href="/admin/projects" className="dash-quick-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Project
        </a>
        <a href="/admin/contacts" className="dash-quick-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          View Messages
        </a>
        <a href="/admin/analytics" className="dash-quick-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          View Analytics
        </a>
        <a href="/admin/settings" className="dash-quick-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </a>
      </div>

      <div className="dash-tip">
        <div className="dash-tip-icon">💡</div>
        <div className="dash-tip-text">
          <strong>Getting started:</strong> Add your first project from the Projects section, then check Analytics to track your portfolio visitors. Your portfolio is live at <strong>localhost:3000</strong>.
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
