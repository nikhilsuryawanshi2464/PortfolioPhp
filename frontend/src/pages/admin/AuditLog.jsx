// PATH: frontend/src/pages/admin/AuditLog.jsx
import { useState, useEffect } from 'react';
import { auditLogAPI } from '@services/api';
import toast from 'react-hot-toast';

const ACTION_COLORS = {
  CREATE: '#10b981', UPDATE: '#60a5fa', DELETE: '#f87171',
  LOGIN:  '#a78bfa', LOGOUT: '#6b7280', UPLOAD: '#f59e0b',
};

const inp = { background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, padding: '8px 12px', color: '#e8e6f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' };

const fmtDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
  catch { return d; }
};

const getActionColor = (action = '') => {
  const key = Object.keys(ACTION_COLORS).find(k => action.toUpperCase().includes(k));
  return key ? ACTION_COLORS[key] : '#6b7280';
};

export default function AdminAuditLog() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters]   = useState({ action: '', resource: '' });
  const [clearing, setClearing] = useState(false);

  const RESOURCES = ['', 'project', 'blog', 'skill', 'experience', 'profile', 'settings', 'user', 'contact'];

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 30 };
      if (filters.action)   params.action   = filters.action;
      if (filters.resource) params.resource = filters.resource;
      const res = await auditLogAPI.getAll(params);
      setLogs(res.data?.data || []);
      setPagination(res.data?.pagination || {});
    } catch { toast.error('Failed to load audit log'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(page); }, [page, filters]);

  const handleClear = async () => {
    if (!window.confirm('Delete all log entries older than 30 days?')) return;
    setClearing(true);
    try {
      const res = await auditLogAPI.getAll({ limit: 1 }); // just to call delete
      await fetch('/api/v1/audit-log', { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Old logs cleared');
      fetchLogs(1);
    } catch { toast.error('Failed to clear logs'); }
    finally { setClearing(false); }
  };

  return (
    <div style={{ color: '#e8e6f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Audit Log</div>
          <div style={{ fontSize: 13, color: '#4a4a6a', marginTop: 3 }}>
            {pagination.total ? `${pagination.total} total entries` : 'Activity history'}
          </div>
        </div>
        <button onClick={handleClear} disabled={clearing}
          style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, border: '1px solid #2e1a2e', background: '#1f1520', color: '#f87171', cursor: clearing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: clearing ? 0.6 : 1 }}>
          {clearing ? 'Clearing…' : '🗑 Clear Old Logs'}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input style={{ ...inp, flex: 1, minWidth: 140, maxWidth: 220 }} placeholder="Filter by action…"
          value={filters.action} onChange={e => { setFilters(f => ({ ...f, action: e.target.value })); setPage(1); }} />
        <select style={{ ...inp, cursor: 'pointer' }} value={filters.resource} onChange={e => { setFilters(f => ({ ...f, resource: e.target.value })); setPage(1); }}>
          {RESOURCES.map(r => <option key={r} value={r}>{r || 'All resources'}</option>)}
        </select>
        {(filters.action || filters.resource) && (
          <button onClick={() => { setFilters({ action: '', resource: '' }); setPage(1); }}
            style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, border: '1px solid #2e2a4a', background: 'transparent', color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Log table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height: 60, background: '#0f0f1a', borderRadius: 10, opacity: 0.6 }} />)}
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#4a4a6a' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, color: '#6a6a8a' }}>No log entries found.</div>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 100px 1fr 140px', gap: 12, padding: '8px 16px', fontSize: 11, fontWeight: 600, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #1e1e2e', marginBottom: 6 }}>
            <span>Action</span><span>Resource</span><span>Status</span><span>User / IP</span><span>Time</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {logs.map(log => {
              const actionColor = getActionColor(log.action);
              return (
                <div key={log._id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 110px 100px 1fr 140px', gap: 12, padding: '10px 16px', background: '#0f0f1a', borderRadius: 10, border: '1px solid #1e1e2e', alignItems: 'center', fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2e2a4a'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}
                >
                  {/* Action */}
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: actionColor, fontFamily: 'monospace', fontSize: 12 }}>{log.action}</span>
                    {log.details && <div style={{ fontSize: 11, color: '#4a4a6a', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</div>}
                  </div>

                  {/* Resource */}
                  <span style={{ fontSize: 12, color: '#8a8aaa', textTransform: 'capitalize' }}>{log.resource || '—'}</span>

                  {/* Status */}
                  <span style={{ fontSize: 11, fontWeight: 600, color: log.status === 'success' ? '#10b981' : '#f87171' }}>
                    {log.status === 'success' ? '✓ Success' : '✕ Failed'}
                  </span>

                  {/* User / IP */}
                  <div style={{ minWidth: 0 }}>
                    {log.user ? (
                      <div style={{ fontSize: 12, color: '#c4b5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.user.name || log.user.email}</div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#3a3a5a' }}>—</span>
                    )}
                    {log.ipAddress && <div style={{ fontSize: 11, color: '#3a3a5a', fontFamily: 'monospace' }}>{log.ipAddress}</div>}
                  </div>

                  {/* Time */}
                  <span style={{ fontSize: 11, color: '#4a4a6a', whiteSpace: 'nowrap' }}>{fmtDate(log.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, border: '1px solid #2e2a4a', background: '#0f0f1a', color: page === 1 ? '#3a3a5a' : '#a78bfa', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>← Prev</button>
          <span style={{ fontSize: 13, color: '#6b6b8a' }}>Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, border: '1px solid #2e2a4a', background: '#0f0f1a', color: page === pagination.pages ? '#3a3a5a' : '#a78bfa', cursor: page === pagination.pages ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
