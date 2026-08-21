import { useState, useEffect, useRef } from 'react';
import api from '@services/api';
import toast from 'react-hot-toast';

const inp = {
  width:'100%', padding:'9px 12px', background:'#111120', border:'1px solid #2e2a4a',
  borderRadius:8, color:'#e8e6f0', fontSize:13.5, outline:'none', fontFamily:'inherit', boxSizing:'border-box',
};
const fo = e => e.target.style.borderColor = '#a78bfa';
const fb = e => e.target.style.borderColor = '#2e2a4a';
const empty = { name:'', role:'', company:'', quote:'', rating:5, featured:false, visible:true, order:0, linkedin:'' };

const Stars = ({ value, onChange }) => (
  <div style={{ display:'flex', gap:4 }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} onClick={() => onChange(n)}
        style={{ fontSize:22, cursor:'pointer', color: n <= value ? '#fbbf24' : '#2e2a4a', transition:'color 0.1s' }}>★</span>
    ))}
  </div>
);

export default function AdminTestimonials() {
  const [list, setList]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(empty);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(null); // holds id being uploaded
  const avatarRefs = useRef({});

  const load = () => api.get('/testimonials')
    .then(r => setList(r.data?.data || []))
    .catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) { toast.error('Name and quote are required'); return; }
    try {
      if (editId) { await api.put(`/testimonials/${editId}`, form); toast.success('Updated!'); }
      else        { await api.post('/testimonials', form);          toast.success('Added!'); }
      setForm(empty); setEditId(null); setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
  };

  const handleEdit = (t) => {
    setForm({ name:t.name||'', role:t.role||'', company:t.company||'', quote:t.quote||'',
      rating:t.rating||5, featured:t.featured||false, visible:t.visible!==false, order:t.order||0, linkedin:t.linkedin||'' });
    setEditId(t._id); setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try { await api.delete(`/testimonials/${id}`); setList(l => l.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (t, field) => {
    try {
      const r = await api.put(`/testimonials/${t._id}`, { [field]: !t[field] });
      setList(l => l.map(x => x._id === t._id ? r.data.data : x));
    } catch { toast.error('Update failed'); }
  };

  const handleAvatarUpload = async (t, file) => {
    if (!file) return;
    setUploadingAvatar(t._id);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const r = await api.post(`/testimonials/${t._id}/avatar`, fd, { headers:{ 'Content-Type':'multipart/form-data' }});
      setList(l => l.map(x => x._id === t._id ? { ...x, avatar: r.data.data.avatar } : x));
      toast.success('Photo uploaded!');
    } catch { toast.error('Upload failed'); }
    setUploadingAvatar(null);
  };

  const card = { background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:12, padding:'20px 22px', marginBottom:12 };

  return (
    <div style={{ color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'#e8e6f0', letterSpacing:'-0.5px' }}>Testimonials</div>
          <div style={{ fontSize:13, color:'#4a4a6a', marginTop:3 }}>Manage client & colleague recommendations</div>
        </div>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          {showForm && !editId ? '✕ Cancel' : '+ Add Testimonial'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...card, border:'1px solid #2e2a4a', marginBottom:24 }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18 }}>
            {editId ? 'Edit Testimonial' : 'New Testimonial'}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div>
                <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Name *</label>
                <input style={inp} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="John Smith" onFocus={fo} onBlur={fb} required />
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Role / Title</label>
                <input style={inp} value={form.role} onChange={e=>set('role',e.target.value)} placeholder="CTO" onFocus={fo} onBlur={fb} />
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Company</label>
                <input style={inp} value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Acme Inc." onFocus={fo} onBlur={fb} />
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>LinkedIn URL</label>
                <input style={inp} value={form.linkedin} onChange={e=>set('linkedin',e.target.value)} placeholder="https://linkedin.com/in/..." onFocus={fo} onBlur={fb} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Quote / Recommendation *</label>
                <textarea style={{...inp, minHeight:100, resize:'vertical', lineHeight:1.65}} value={form.quote} onChange={e=>set('quote',e.target.value)} placeholder="Working with Nikhil was fantastic. He delivered a world-class product..." maxLength={1000} onFocus={fo} onBlur={fb} required />
                <div style={{ fontSize:11, color:'#3a3a5a', textAlign:'right', marginTop:3 }}>{form.quote.length}/1000</div>
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:10 }}>Rating</label>
                <Stars value={form.rating} onChange={v => set('rating', v)} />
              </div>
              <div>
                <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Sort Order (higher = first)</label>
                <input type="number" style={inp} value={form.order} onChange={e=>set('order',Number(e.target.value))} onFocus={fo} onBlur={fb} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                {[['Featured','featured'],['Visible','visible']].map(([lbl,key]) => (
                  <label key={key} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13.5, color:'#8a8aaa' }}>
                    <input type="checkbox" checked={form[key]} onChange={e=>set(key,e.target.checked)} style={{ width:16, height:16, accentColor:'#a78bfa' }} />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button type="submit" style={{ padding:'9px 22px', background:'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                {editId ? 'Update' : 'Add Testimonial'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }}
                style={{ padding:'9px 22px', background:'#1a1a2e', border:'1px solid #2e2a4a', borderRadius:9, color:'#6a6a8a', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        Array.from({length:3}).map((_,i) => <div key={i} style={{ height:100, background:'#0f0f1a', borderRadius:12, marginBottom:12, opacity:0.5 }} />)
      ) : list.length === 0 ? (
        <div style={{ padding:'50px 20px', textAlign:'center', color:'#3a3a5a' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
          <div style={{ fontSize:16, color:'#6a6a8a', marginBottom:6 }}>No testimonials yet</div>
          <div style={{ fontSize:13 }}>Add recommendations from clients or colleagues</div>
        </div>
      ) : list.map(t => (
        <div key={t._id} style={{ ...card, display:'flex', gap:16, alignItems:'flex-start' }}>
          {/* Avatar */}
          <div style={{ flexShrink:0 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden', background:'#1a1a2e', border:'2px solid #2e2a4a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, cursor:'pointer', position:'relative' }}
              onClick={() => { const el = document.getElementById(`av-${t._id}`); el && el.click(); }}>
              {t.avatar ? <img src={t.avatar} alt={t.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <span>{t.name[0]?.toUpperCase()}</span>}
              {uploadingAvatar === t._id && (
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>...</div>
              )}
            </div>
            <input id={`av-${t._id}`} type="file" accept="image/*" style={{ display:'none' }}
              ref={el => avatarRefs.current[t._id] = el}
              onChange={e => handleAvatarUpload(t, e.target.files[0])} />
            <div style={{ fontSize:9, color:'#3a3a5a', textAlign:'center', marginTop:3, cursor:'pointer' }}
              onClick={() => document.getElementById(`av-${t._id}`)?.click()}>
              tap to change
            </div>
          </div>

          {/* Content */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:6 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color:'#c4b5fd' }}>{t.name}</div>
                {(t.role || t.company) && (
                  <div style={{ fontSize:12, color:'#5a5a7a', marginTop:2 }}>
                    {t.role}{t.role && t.company && ' · '}{t.company}
                  </div>
                )}
                <div style={{ display:'flex', gap:2, marginTop:4 }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize:13, color: n <= (t.rating||5) ? '#fbbf24' : '#2e2a4a' }}>★</span>)}
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                <button onClick={() => handleToggle(t,'featured')}
                  style={{ padding:'4px 9px', borderRadius:6, fontSize:11, border:'none', cursor:'pointer', fontFamily:'inherit', background: t.featured ? '#1c1a0a' : '#1a1a2e', color: t.featured ? '#fbbf24' : '#5a5a7a' }}>
                  {t.featured ? '⭐ Featured' : '☆ Feature'}
                </button>
                <button onClick={() => handleToggle(t,'visible')}
                  style={{ padding:'4px 9px', borderRadius:6, fontSize:11, border:'none', cursor:'pointer', fontFamily:'inherit', background: t.visible ? '#0d2a1f' : '#1a1a2e', color: t.visible ? '#34d399' : '#5a5a7a' }}>
                  {t.visible ? '● Visible' : '○ Hidden'}
                </button>
                <button onClick={() => handleEdit(t)}
                  style={{ padding:'4px 9px', borderRadius:6, fontSize:11, border:'none', cursor:'pointer', fontFamily:'inherit', background:'#1c1830', color:'#a78bfa' }}>Edit</button>
                <button onClick={() => handleDelete(t._id)}
                  style={{ padding:'4px 9px', borderRadius:6, fontSize:11, border:'none', cursor:'pointer', fontFamily:'inherit', background:'#1f1520', color:'#f87171' }}>Delete</button>
              </div>
            </div>
            <div style={{ fontSize:13, color:'#8a8aaa', lineHeight:1.65, fontStyle:'italic' }}>"{t.quote}"</div>
          </div>
        </div>
      ))}
    </div>
  );
}
