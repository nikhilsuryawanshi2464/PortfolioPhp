import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '/api/v1';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    fetch(`${API}/contact`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setContacts(data.data || data.contacts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <style>{`
        .con-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #e8e6f0; letter-spacing: -0.5px; margin-bottom: 28px; }
        .con-layout { display: grid; grid-template-columns: 1fr ${selected ? '360px' : '0px'}; gap: ${selected ? '20px' : '0'}; transition: all 0.3s; }
        .con-table { background: #0f0f1a; border: 1px solid #1e1e2e; border-radius: 14px; overflow: hidden; }
        .con-head { display: grid; grid-template-columns: 1fr 140px 100px; padding: 14px 20px; border-bottom: 1px solid #1e1e2e; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4a4a6a; }
        .con-row { display: grid; grid-template-columns: 1fr 140px 100px; padding: 16px 20px; border-bottom: 1px solid #13131f; align-items: center; cursor: pointer; transition: background 0.15s; }
        .con-row:last-child { border-bottom: none; }
        .con-row:hover, .con-row.active { background: #13131f; }
        .con-row.active { border-left: 3px solid #a78bfa; }
        .con-name { font-size: 14px; font-weight: 500; color: #c4b5fd; }
        .con-email { font-size: 12px; color: #4a4a6a; margin-top: 2px; }
        .con-subject { font-size: 13px; color: #6b6b8a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .con-date { font-size: 12px; color: #4a4a6a; }
        .con-badge { display: inline-flex; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .con-badge.new { background: #0d1f2a; color: #60a5fa; }
        .con-badge.read { background: #1a1a2e; color: #4a4a6a; }
        .con-detail { background: #0f0f1a; border: 1px solid #1e1e2e; border-radius: 14px; padding: 24px; height: fit-content; position: sticky; top: 96px; }
        .con-detail-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #e8e6f0; margin-bottom: 4px; }
        .con-detail-email { font-size: 13px; color: #a78bfa; margin-bottom: 20px; }
        .con-detail-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4a4a6a; margin-bottom: 6px; }
        .con-detail-subject { font-size: 14px; font-weight: 500; color: #c4b5fd; margin-bottom: 20px; }
        .con-detail-msg { font-size: 14px; color: #8888aa; line-height: 1.7; padding: 16px; background: #13131f; border-radius: 10px; white-space: pre-wrap; }
        .con-detail-close { display: flex; align-items: center; gap: 6px; margin-top: 20px; padding: 8px 14px; background: #1f1520; color: #f87171; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
        .con-empty { padding: 60px 20px; text-align: center; color: #4a4a6a; }
        .con-loading { padding: 40px; text-align: center; color: #4a4a6a; font-size: 14px; }
      `}</style>

      <div className="con-title">Contact Submissions</div>

      <div className="con-layout">
        <div className="con-table">
          <div className="con-head">
            <span>From</span>
            <span>Subject</span>
            <span>Date</span>
          </div>

          {loading ? (
            <div className="con-loading">Loading messages...</div>
          ) : contacts.length === 0 ? (
            <div className="con-empty">
              <div style={{ fontSize: 36, marginBottom: 12 }}>◉</div>
              <div style={{ color: '#6b6b8a', fontSize: 15 }}>No messages yet</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Contact submissions will appear here</div>
            </div>
          ) : contacts.map(c => (
            <div
              className={`con-row${selected?._id === c._id ? ' active' : ''}`}
              key={c._id}
              onClick={() => setSelected(selected?._id === c._id ? null : c)}
            >
              <div>
                <div className="con-name">{c.name}</div>
                <div className="con-email">{c.email}</div>
              </div>
              <div className="con-subject">{c.subject || c.message?.slice(0, 30) + '...'}</div>
              <div className="con-date">{formatDate(c.createdAt)}</div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="con-detail">
            <div className="con-detail-name">{selected.name}</div>
            <div className="con-detail-email">{selected.email}</div>
            <div className="con-detail-label">Subject</div>
            <div className="con-detail-subject">{selected.subject || 'No subject'}</div>
            <div className="con-detail-label">Message</div>
            <div className="con-detail-msg">{selected.message}</div>
            <button className="con-detail-close" onClick={() => setSelected(null)}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminContacts;
