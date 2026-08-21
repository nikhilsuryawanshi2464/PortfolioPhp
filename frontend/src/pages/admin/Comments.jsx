// PATH: frontend/src/pages/admin/Comments.jsx
import { useState, useEffect } from 'react';
import { commentsAPI } from '@services/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending:  { bg: '#1a1a2e', color: '#f59e0b', border: '#2e2a1a', label: '⏳ Pending'  },
  approved: { bg: '#0f1f18', color: '#10b981', border: '#1a2e24', label: '✓ Approved'  },
  rejected: { bg: '#1f0f18', color: '#f87171', border: '#2e1a24', label: '✕ Rejected'  },
};

const inp = { background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, padding: '9px 12px', color: '#e8e6f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' };

export default function AdminComments() {
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});
  const [actioning, setActioning] = useState(null);

  const fetchComments = async (status, p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 20 };
      if (status !== 'all') params.status = status;
      const res = await commentsAPI.getAll(params);
      setComments(res.data?.data || []);
      setPagination(res.data?.pagination || {});
    } catch { toast.error('Failed to load comments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComments(filter, page); }, [filter, page]);

  const handleStatus = async (id, status) => {
    setActioning(id + status);
    try {
      await commentsAPI.updateStatus(id, status);
      toast.success(`Comment ${status}`);
      fetchComments(filter, page);
    } catch { toast.error('Failed to update'); }
    finally { setActioning(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    setActioning(id + 'del');
    try {
      await commentsAPI.delete(id);
      toast.success('Deleted');
      fetchComments(filter, page);
    } catch { toast.error('Failed to delete'); }
    finally { setActioning(null); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';

  const FILTERS = ['all', 'pending', 'approved', 'rejected'];
  const pendingCount = comments.filter(c => c.status === 'pending').length;

  return (
    <div style={{ color: '#e8e6f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Comments
            {pendingCount > 0 && <span style={{ marginLeft: 10, fontSize: 13, background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', borderRadius: 20, padding: '2px 10px' }}>{pendingCount} pending</span>}
          </div>
          <div style={{ fontSize: 13, color: '#4a4a6a', marginTop: 3 }}>Moderate blog post comments</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: filter === f ? 'none' : '1px solid #2e2a4a', background: filter === f ? 'linear-gradient(135deg,#a78bfa,#60a5fa)' : '#0f0f1a', color: filter === f ? '#fff' : '#6b6b8a', transition: 'all 0.15s', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Comments list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 110, background: '#0f0f1a', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#4a4a6a' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: 15, color: '#6a6a8a' }}>No {filter !== 'all' ? filter : ''} comments yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.map(comment => {
            const s = STATUS_STYLES[comment.status] || STATUS_STYLES.pending;
            return (
              <div key={comment._id} style={{ background: '#0f0f1a', border: `1px solid #1e1e2e`, borderLeft: `3px solid ${s.color}`, borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                      {comment.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#e8e6f0' }}>{comment.name}</div>
                      <div style={{ fontSize: 11, color: '#4a4a6a' }}>{comment.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 20, padding: '2px 10px' }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: '#4a4a6a' }}>{fmtDate(comment.createdAt)}</span>
                  </div>
                </div>

                {comment.post && (
                  <div style={{ fontSize: 11, color: '#6b6b8a', marginBottom: 8, padding: '4px 10px', background: '#151520', borderRadius: 6, display: 'inline-block' }}>
                    📝 {comment.post?.title || 'Blog post'}
                  </div>
                )}

                <p style={{ fontSize: 14, color: '#c4b5fd', lineHeight: 1.6, margin: '8px 0 12px', padding: '10px 14px', background: '#13131e', borderRadius: 8, borderLeft: '2px solid #2e2a4a' }}>
                  {comment.message}
                </p>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {comment.status !== 'approved' && (
                    <button onClick={() => handleStatus(comment._id, 'approved')} disabled={!!actioning}
                      style={{ padding: '5px 14px', borderRadius: 7, fontSize: 12, border: 'none', cursor: 'pointer', background: '#0f1f18', color: '#10b981', fontFamily: 'inherit', fontWeight: 600 }}>
                      ✓ Approve
                    </button>
                  )}
                  {comment.status !== 'rejected' && (
                    <button onClick={() => handleStatus(comment._id, 'rejected')} disabled={!!actioning}
                      style={{ padding: '5px 14px', borderRadius: 7, fontSize: 12, border: 'none', cursor: 'pointer', background: '#1f1520', color: '#f87171', fontFamily: 'inherit', fontWeight: 600 }}>
                      ✕ Reject
                    </button>
                  )}
                  {comment.status === 'pending' && (
                    <button onClick={() => handleStatus(comment._id, 'pending')} disabled style={{ display: 'none' }} />
                  )}
                  <button onClick={() => handleDelete(comment._id)} disabled={!!actioning}
                    style={{ padding: '5px 14px', borderRadius: 7, fontSize: 12, border: '1px solid #2e1a2e', cursor: 'pointer', background: 'transparent', color: '#6b6b8a', fontFamily: 'inherit' }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, border: '1px solid #2e2a4a', background: '#0f0f1a', color: page === 1 ? '#3a3a5a' : '#a78bfa', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            ← Prev
          </button>
          <span style={{ fontSize: 13, color: '#6b6b8a' }}>Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, border: '1px solid #2e2a4a', background: '#0f0f1a', color: page === pagination.pages ? '#3a3a5a' : '#a78bfa', cursor: page === pagination.pages ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
