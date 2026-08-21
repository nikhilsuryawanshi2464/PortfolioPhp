import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '/api/v1';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    fetch(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setProjects(data.data || data.projects || []); setLoading(false); })
      .catch(() => { setError('Could not load projects'); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    await fetch(`${API}/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setProjects(p => p.filter(x => x._id !== id));
  };

  return (
    <>
      <style>{`
        .proj-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .proj-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #e8e6f0; letter-spacing: -0.5px; }
        .proj-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #a78bfa, #60a5fa); border: none; border-radius: 10px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.2s; }
        .proj-add-btn:hover { opacity: 0.85; }
        .proj-table { background: #0f0f1a; border: 1px solid #1e1e2e; border-radius: 14px; overflow: hidden; }
        .proj-table-head { display: grid; grid-template-columns: 1fr 120px 100px 80px; padding: 14px 20px; border-bottom: 1px solid #1e1e2e; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4a4a6a; }
        .proj-row { display: grid; grid-template-columns: 1fr 120px 100px 80px; padding: 16px 20px; border-bottom: 1px solid #13131f; align-items: center; transition: background 0.15s; }
        .proj-row:last-child { border-bottom: none; }
        .proj-row:hover { background: #13131f; }
        .proj-name { font-size: 14px; font-weight: 500; color: #c4b5fd; }
        .proj-slug { font-size: 12px; color: #4a4a6a; margin-top: 2px; }
        .proj-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .proj-badge.published { background: #0d2a1f; color: #34d399; }
        .proj-badge.draft { background: #1f1a2e; color: #a78bfa; }
        .proj-actions { display: flex; gap: 8px; }
        .proj-btn { padding: 6px 12px; border-radius: 7px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; text-decoration: none; display: inline-block; }
        .proj-btn.edit { background: #1e1a3a; color: #a78bfa; }
        .proj-btn.edit:hover { background: #2a2450; }
        .proj-btn.del { background: #1f1520; color: #f87171; }
        .proj-btn.del:hover { background: #2a1a20; }
        .proj-empty { padding: 60px 20px; text-align: center; color: #4a4a6a; }
        .proj-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .proj-empty-text { font-size: 15px; margin-bottom: 6px; color: #6b6b8a; }
        .proj-empty-sub { font-size: 13px; }
        .proj-loading { padding: 40px; text-align: center; color: #4a4a6a; font-size: 14px; }
        .proj-error { padding: 16px 20px; background: #1f1520; border: 1px solid #3a1a25; border-radius: 10px; color: #f87171; font-size: 14px; margin-bottom: 20px; }
      `}</style>

      <div className="proj-header">
        <div className="proj-title">Projects</div>
        <Link to="/admin/projects/new" className="proj-add-btn">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Project
        </Link>
      </div>

      {error && <div className="proj-error">{error}</div>}

      <div className="proj-table">
        <div className="proj-table-head">
          <span>Project</span>
          <span>Category</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="proj-loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="proj-empty">
            <div className="proj-empty-icon">◈</div>
            <div className="proj-empty-text">No projects yet</div>
            <div className="proj-empty-sub">Add your first project to showcase your work</div>
          </div>
        ) : projects.map(p => (
          <div className="proj-row" key={p._id}>
            <div>
              <div className="proj-name">{p.title}</div>
              <div className="proj-slug">/{p.slug}</div>
            </div>
            <div style={{ fontSize: 13, color: '#6b6b8a' }}>{p.category || '—'}</div>
            <div>
              <span className={`proj-badge ${p.published ? 'published' : 'draft'}`}>
                {p.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="proj-actions">
              <Link to={`/admin/projects/edit/${p._id}`} className="proj-btn edit">Edit</Link>
              <button className="proj-btn del" onClick={() => handleDelete(p._id)}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminProjects;
