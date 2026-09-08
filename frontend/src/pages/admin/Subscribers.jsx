// frontend/src/pages/admin/Subscribers.jsx
// Feature 15 — Newsletter Subscribers Admin
import { useState, useEffect } from 'react';
import api from '@services/api';
import toast from 'react-hot-toast';

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); } catch { return ''; } };

export default function AdminSubscribers() {
  const [subscribers, setSubs] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [total, setTotal]      = useState(0);
  const [page, setPage]        = useState(1);
  const [pages, setPages]      = useState(1);
  const [filter, setFilter]    = useState('all');

  const load = (pg=1) => {
    setLoading(true);
    const params = { page: pg, limit: 50 };
    if (filter !== 'all') params.active = filter === 'active';
    api.get('/subscribers', { params })
      .then(r => {
        const d = r.data?.data || r.data || {};
        setSubs(d.subscribers || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .catch(() => toast.error('Failed to load subscribers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page, filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await api.delete(`/subscribers/${id}`);
      toast.success('Removed');
      load(page);
    } catch { toast.error('Failed'); }
  };

  const handleExport = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/v1/subscribers/export?token=${token}`, '_blank');
  };

  const S = { background:'#111120', border:'1px solid #2e2a4a', borderRadius:8 };

  return (
    <div style={{ color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>Newsletter Subscribers</div>
          <div style={{ fontSize:13, color:'#4a4a6a', marginTop:3 }}>
            {total} total subscriber{total !== 1 ? 's' : ''}
          </div>
        </div>
        <button onClick={handleExport}
          style={{ padding:'9px 18px', borderRadius:10, fontSize:13, border:'1px solid #2e2a4a', background:'#0f0f1a', color:'#a78bfa', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
          ↓ Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="adm-grid-3" style={{ marginBottom: 20 }}>
        {[
          { label:'Total', value: total, color:'#a78bfa' },
          { label:'Active', value: subscribers.filter(s=>s.active).length, color:'#10b981' },
          { label:'Inactive', value: subscribers.filter(s=>!s.active).length, color:'#f87171' },
        ].map(stat => (
          <div key={stat.label} style={{ background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontSize:22, fontWeight:800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize:12, color:'#4a4a6a', marginTop:2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {['all','active','inactive'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            style={{ padding:'5px 14px', borderRadius:7, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
              border: filter === f ? 'none' : '1px solid #2e2a4a',
              background: filter === f ? 'linear-gradient(135deg,#a78bfa,#60a5fa)' : '#0f0f1a',
              color: filter === f ? '#fff' : '#6b6b8a', textTransform:'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height:56, background:'#0f0f1a', borderRadius:10, animation:'pulse 1.5s infinite' }}/>)}
        </div>
      ) : subscribers.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#4a4a6a' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📧</div>
          <div style={{ fontSize:15, color:'#6a6a8a' }}>No subscribers yet. Add the subscribe widget to your frontend!</div>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 100px 90px 90px', gap:12, padding:'8px 14px', fontSize:11, fontWeight:600, color:'#4a4a6a', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid #1e1e2e', marginBottom:4 }}>
            <span>Email</span><span>Name</span><span>Source</span><span>Status</span><span>Joined</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            {subscribers.map(sub => (
              <div key={sub._id} style={{ display:'grid', gridTemplateColumns:'1fr 140px 100px 90px 90px', gap:12, padding:'11px 14px', background:'#0f0f1a', borderRadius:10, border:'1px solid #1e1e2e', alignItems:'center', fontSize:13 }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#2e2a4a'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#1e1e2e'}>
                <div style={{ color:'#c4b5fd', overflow: 'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub.email}</div>
                <div style={{ color:'#8a8aaa', overflow: 'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub.name || '—'}</div>
                <div style={{ fontSize:11, color:'#4a4a6a', textTransform:'capitalize' }}>{sub.source || 'website'}</div>
                <div>
                  <span style={{ fontSize:11, color: sub.active ? '#10b981' : '#f87171', fontWeight:600 }}>
                    {sub.active ? '● Active' : '○ Off'}
                  </span>
                </div>
                <div style={{ fontSize:11, color:'#4a4a6a' }}>{fmtDate(sub.createdAt)}</div>
                {/* Delete on hover — use group state workaround */}
                <button onClick={() => handleDelete(sub._id)}
                  style={{ position:'absolute', right:12, opacity:0, cursor:'pointer', background:'#1f1520', border:'none', color:'#f87171', borderRadius:6, padding:'3px 8px', fontSize:11, fontFamily:'inherit' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginTop:20 }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                style={{ padding:'6px 14px', borderRadius:8, fontSize:13, border:'1px solid #2e2a4a', background:'#0f0f1a', color:page===1?'#3a3a5a':'#a78bfa', cursor:page===1?'not-allowed':'pointer', fontFamily:'inherit' }}>← Prev</button>
              <span style={{ fontSize:13, color:'#6b6b8a' }}>Page {page} of {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
                style={{ padding:'6px 14px', borderRadius:8, fontSize:13, border:'1px solid #2e2a4a', background:'#0f0f1a', color:page===pages?'#3a3a5a':'#a78bfa', cursor:page===pages?'not-allowed':'pointer', fontFamily:'inherit' }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
