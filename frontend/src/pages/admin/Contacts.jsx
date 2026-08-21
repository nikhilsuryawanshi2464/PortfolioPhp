import { useState, useEffect } from 'react';
import { contactAPI } from '@services/api';
import toast from 'react-hot-toast';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => contactAPI.getAll({ limit: 200 })
    .then(r => setContacts(r.data?.data || []))
    .catch(() => toast.error('Failed to load messages'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await contactAPI.delete(id);
      setContacts(c => c.filter(x => x._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Message deleted');
    } catch { toast.error('Delete failed'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await contactAPI.updateStatus(id, { status });
      setContacts(c => c.map(x => x._id === id ? { ...x, status } : x));
      if (selected?._id === id) setSelected(s => ({ ...s, status }));
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Update failed'); }
  };

  const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusColor = s => ({ new: '#60a5fa', read: '#4a4a6a', replied: '#34d399', archived: '#f59e0b' }[s] || '#4a4a6a');
  const statusBg = s => ({ new: '#0d1f2a', read: '#1a1a2e', replied: '#0d2a1f', archived: '#2a1f0d' }[s] || '#1a1a2e');

  const filtered = filter === 'all' ? contacts : contacts.filter(c => c.status === filter);

  return (
    <div style={{ color: '#e8e6f0', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>Messages</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'new', 'read', 'replied'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, background: filter === f ? '#a78bfa' : '#1a1a2e', color: filter === f ? '#fff' : '#6a6a8a' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 16 }}>
        {/* List */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 80px 80px', padding: '11px 18px', borderBottom: '1px solid #1e1e2e', fontSize: 10, textTransform: 'uppercase', letterSpacing: '2px', color: '#3a3a5a' }}>
            <span>From</span><span>Subject</span><span>Status</span><span>Date</span>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#3a3a5a' }}>Loading messages...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', color: '#3a3a5a' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✉️</div>
              <div style={{ fontSize: 15, color: '#6a6a8a' }}>{filter === 'all' ? 'No messages yet' : `No ${filter} messages`}</div>
            </div>
          ) : filtered.map(c => (
            <div key={c._id} onClick={() => setSelected(selected?._id === c._id ? null : c)}
              style={{ display: 'grid', gridTemplateColumns: '1fr 130px 80px 80px', padding: '13px 18px', borderBottom: '1px solid #0b0b14', alignItems: 'center', cursor: 'pointer', background: selected?._id === c._id ? '#161626' : 'transparent', borderLeft: selected?._id === c._id ? '3px solid #a78bfa' : '3px solid transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (selected?._id !== c._id) e.currentTarget.style.background = '#131320'; }}
              onMouseLeave={e => { if (selected?._id !== c._id) e.currentTarget.style.background = 'transparent'; }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#c4b5fd' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#3a3a5a', marginTop: 2 }}>{c.email}</div>
              </div>
              <div style={{ fontSize: 12, color: '#5a5a7a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{c.subject || c.message?.slice(0, 28) + '...'}</div>
              <div><span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: statusBg(c.status), color: statusColor(c.status) }}>{c.status || 'new'}</span></div>
              <div style={{ fontSize: 11, color: '#3a3a5a' }}>{fmt(c.createdAt)}</div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 12, padding: 22, position: 'sticky', top: 76, height: 'fit-content', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#e8e6f0', marginBottom: 3 }}>{selected.name}</div>
            <a href={`mailto:${selected.email}`} style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none', display: 'block', marginBottom: 4 }}>{selected.email}</a>
            {selected.phone && <div style={{ fontSize: 12, color: '#4a4a6a', marginBottom: 16 }}>📞 {selected.phone}</div>}
            <div style={{ fontSize: 12, color: '#3a3a5a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Received</div>
            <div style={{ fontSize: 13, color: '#5a5a7a', marginBottom: 18 }}>{fmt(selected.createdAt)}</div>
            <div style={{ fontSize: 12, color: '#3a3a5a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Subject</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#c4b5fd', marginBottom: 18 }}>{selected.subject || 'No subject'}</div>
            <div style={{ fontSize: 12, color: '#3a3a5a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Message</div>
            <div style={{ fontSize: 13, color: '#8a8aaa', lineHeight: 1.75, padding: 14, background: '#131320', borderRadius: 9, whiteSpace: 'pre-wrap', marginBottom: 18, maxHeight: 220, overflowY: 'auto' }}>{selected.message}</div>

            <div style={{ fontSize: 12, color: '#3a3a5a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Mark as</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {['new', 'read', 'replied', 'archived'].map(s => (
                <button key={s} onClick={() => updateStatus(selected._id, s)}
                  style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, background: selected.status === s ? statusBg(s) : '#1a1a2e', color: selected.status === s ? statusColor(s) : '#4a4a6a' }}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || ''}`}
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: '#fff', textDecoration: 'none', textAlign: 'center', fontWeight: 600 }}>Reply via Email</a>
              <button onClick={() => handleDelete(selected._id)}
                style={{ padding: '9px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: 'none', background: '#1f1520', color: '#f87171', fontFamily: 'inherit' }}>Delete</button>
              <button onClick={() => setSelected(null)}
                style={{ padding: '9px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: 'none', background: '#1a1a2e', color: '#6a6a8a', fontFamily: 'inherit' }}>✕</button>
            </div>
          </div>
        )}
      </div>
      {contacts.length > 0 && (
        <div style={{ fontSize: 12, color: '#3a3a5a', marginTop: 12 }}>{contacts.length} total messages · Click a row to read it · Use status buttons to track replies</div>
      )}
    </div>
  );
}
