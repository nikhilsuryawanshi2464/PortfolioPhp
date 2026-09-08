import { useState, useEffect } from 'react';
import { experienceAPI } from '@services/api';
import toast from 'react-hot-toast';

const empty = { company: '', position: '', startDate: '', endDate: '', current: false, description: '', location: '', technologies: '' };

export default function AdminExperience() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => {
    try {
      const res = await experienceAPI.getAll();
      setItems(res.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editId) { await experienceAPI.update(editId, payload); toast.success('Updated!'); }
      else { await experienceAPI.create(payload); toast.success('Created!'); }
      setForm(empty); setEditId(null); setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleEdit = (item) => {
    setForm({ ...item, technologies: (item.technologies || []).join(', '), startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '' });
    setEditId(item._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await experienceAPI.delete(id); toast.success('Deleted!'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ color: '#e8e6f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Experience</h1>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}
          style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
          + Add Experience
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: 18 }}>{editId ? 'Edit' : 'New'} Experience</h2>
          <form onSubmit={handleSubmit}>
            <div className="adm-grid-2" style={{ gap: 16 }}>
              {[['company','Company',true],['position','Job Title',true],['location','Location',false]].map(([key,label,req]) => (
                <div key={key}>
                  <label style={{ fontSize: 13, color: '#6b6b8a', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={req}
                    style={{ width: '100%', background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, padding: '9px 12px', color: '#e8e6f0', fontSize: 14 }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, color: '#6b6b8a', display: 'block', marginBottom: 6 }}>Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required
                  style={{ width: '100%', background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, padding: '9px 12px', color: '#e8e6f0', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#6b6b8a', display: 'block', marginBottom: 6 }}>End Date</label>
                <input type="date" value={form.endDate} disabled={form.current} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  style={{ width: '100%', background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, padding: '9px 12px', color: '#e8e6f0', fontSize: 14, opacity: form.current ? 0.4 : 1 }} />
                <label style={{ fontSize: 12, color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.checked }))} />
                  Currently working here
                </label>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 13, color: '#6b6b8a', display: 'block', marginBottom: 6 }}>Technologies (comma separated)</label>
                <input value={form.technologies} onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))} placeholder="React, Node.js, MongoDB"
                  style={{ width: '100%', background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, padding: '9px 12px', color: '#e8e6f0', fontSize: 14 }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 13, color: '#6b6b8a', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                  style={{ width: '100%', background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, padding: '9px 12px', color: '#e8e6f0', fontSize: 14, resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                {editId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ background: '#1a1a2e', border: '1px solid #2e2a4a', color: '#6b6b8a', padding: '10px 24px', borderRadius: 10, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(item => (
            <div key={item._id} style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 17 }}>{item.position}</div>
                  <div style={{ color: '#a78bfa', fontSize: 14, marginTop: 2 }}>{item.company} {item.location && `• ${item.location}`}</div>
                  <div style={{ fontSize: 12, color: '#6b6b8a', marginTop: 4 }}>
                    {item.startDate?.split('T')[0]} — {item.current ? 'Present' : item.endDate?.split('T')[0]}
                  </div>
                  {item.technologies?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {item.technologies.map(t => (
                        <span key={t} style={{ background: '#1e1a3a', color: '#a78bfa', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  <button onClick={() => handleEdit(item)}
                    style={{ background: '#1a1a2e', border: '1px solid #2e2a4a', color: '#a78bfa', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Edit</button>
                  <button onClick={() => handleDelete(item._id)}
                    style={{ background: '#1f1520', border: '1px solid #2e1a2e', color: '#f87171', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: '#4a4a6a' }}>No experience yet. Add your first job!</p>}
        </div>
      )}
    </div>
  );
}