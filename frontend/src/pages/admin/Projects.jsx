import { useState, useEffect } from 'react';
import api from '@services/api';
import { Link } from 'react-router-dom';
import { projectsAPI } from '@services/api';
import toast from 'react-hot-toast';

const st = {
  btn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit' },
  table: { background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 12, overflow: 'hidden' },
  head: { display: 'grid', gridTemplateColumns: '1fr 110px 100px 150px', padding: '12px 18px', borderBottom: '1px solid #1e1e2e', fontSize: 10, textTransform: 'uppercase', letterSpacing: '2px', color: '#3a3a5a' },
  row: { display: 'grid', gridTemplateColumns: '1fr 110px 100px 150px', padding: '14px 18px', borderBottom: '1px solid #0f0f1a', alignItems: 'center' },
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const selectAll  = (items) => setSelectedIds(items.map(p=>p._id));
  const clearSel   = () => setSelectedIds([]);

  const bulkAction = async (action, items) => {
    if (!selectedIds.length) return;
    if (action === 'delete' && !window.confirm(`Delete ${selectedIds.length} project(s)?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map(id => {
        if (action === 'delete')    return api.delete(`/projects/${id}`);
        if (action === 'publish')   return api.put(`/projects/${id}`, { published:true });
        if (action === 'unpublish') return api.put(`/projects/${id}`, { published:false });
        return Promise.resolve();
      }));
      const msg = action.charAt(0).toUpperCase()+action.slice(1);
      const toast = window._toast || console;
      try{ window._toastSuccess(`${msg}ed ${selectedIds.length} project(s)`); }catch{}
      clearSel(); load();
    } catch(e) { console.error(e); }
    setBulkLoading(false);
  };

  const load = () => projectsAPI.getAll({ limit: 200 })
    .then(r => setProjects(r.data?.data || []))
    .catch(() => toast.error('Failed to load projects'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try { await projectsAPI.delete(id); setProjects(p => p.filter(x => x._id !== id)); toast.success('Project deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const togglePublish = async (proj) => {
    try {
      const r = await projectsAPI.update(proj._id, { published: !proj.published });
      setProjects(p => p.map(x => x._id === proj._id ? r.data.data : x));
      toast.success(proj.published ? 'Set to Draft' : 'Published!');
    } catch { toast.error('Update failed'); }
  };

  return (
    <div style={{ color: '#e8e6f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>Projects</h1>
        <Link to="/admin/projects/new" style={st.btn}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Project
        </Link>
      </div>

      <div style={st.table}>
        <div style={st.head}><span>Project</span><span>Category</span><span>Status</span><span>Actions</span></div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#3a3a5a' }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: '#3a3a5a' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
            <div style={{ fontSize: 16, color: '#6a6a8a', marginBottom: 6 }}>No projects yet</div>
            <div style={{ fontSize: 13 }}>Click "Add Project" to create your first one</div>
          </div>
        ) : projects.map((p, i) => (
          <div key={p._id} style={{ ...st.row, background: i % 2 === 0 ? '#0f0f1a' : '#0b0b14' }}
            onMouseEnter={e => e.currentTarget.style.background = '#161626'}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#0f0f1a' : '#0b0b14'}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#c4b5fd' }}>{p.title}</div>
              <div style={{ fontSize: 11, color: '#3a3a5a', marginTop: 2 }}>/{p.slug}</div>
            </div>
            <div style={{ fontSize: 12, color: '#5a5a7a', textTransform: 'capitalize' }}>{p.category || '—'}</div>
            <div>
              <button onClick={() => togglePublish(p)}
                style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: p.published ? '#0d2a1f' : '#1f1a2e', color: p.published ? '#34d399' : '#a78bfa' }}>
                {p.published ? '● Live' : '○ Draft'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <Link to={`/admin/projects/${p._id}/edit`}
                style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#1a1630', color: '#a78bfa', textDecoration: 'none' }}>Edit</Link>
              <button onClick={() => handleDelete(p._id, p.title)}
                style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#1f1520', color: '#f87171', fontFamily: 'inherit' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {projects.length > 0 && (
        <div style={{ fontSize: 12, color: '#3a3a5a', marginTop: 12, textAlign: 'right' }}>{projects.length} project{projects.length !== 1 ? 's' : ''} total · Click status badge to toggle Live/Draft</div>
      )}
    </div>
  );
}
