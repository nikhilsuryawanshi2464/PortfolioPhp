import { useState, useEffect } from 'react';
import api from '@services/api';
import toast from 'react-hot-toast';

const TYPES = ['certification','education','bootcamp','course','award'];
const TYPE_ICON  = { certification:'🏅', education:'🎓', bootcamp:'💻', course:'📚', award:'🏆' };
const TYPE_COLOR = { certification:'#a78bfa', education:'#60a5fa', bootcamp:'#34d399', course:'#fb923c', award:'#fbbf24' };
const inp  = { width:'100%', padding:'9px 12px', background:'#111120', border:'1px solid #2e2a4a', borderRadius:8, color:'#e8e6f0', fontSize:13.5, outline:'none', fontFamily:'inherit', boxSizing:'border-box' };
const fo   = e => e.target.style.borderColor = '#a78bfa';
const fb   = e => e.target.style.borderColor = '#2e2a4a';
const card = { background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:14, padding:'20px 22px' };
const empty = { type:'certification', title:'', institution:'', degree:'', year:'', endYear:'', credentialId:'', credentialUrl:'', description:'', skills:'', featured:false, visible:true, order:0 };

export default function AdminCertifications() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(empty);
  const [editId, setEditId]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeType, setActiveType] = useState('all');

  const load = () => api.get('/certifications')
    .then(r => setList(r.data?.data || []))
    .catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.institution.trim()) { toast.error('Title and institution required'); return; }
    const payload = { ...form, skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean) };
    try {
      if (editId) { await api.put(`/certifications/${editId}`, payload); toast.success('Updated!'); }
      else        { await api.post('/certifications', payload);           toast.success('Added!'); }
      setForm(empty); setEditId(null); setShowForm(false); load();
    } catch(err) { toast.error(err.response?.data?.error || 'Save failed'); }
  };

  const handleEdit = (c) => {
    setForm({ type:c.type, title:c.title, institution:c.institution, degree:c.degree||'', year:c.year||'', endYear:c.endYear||'', credentialId:c.credentialId||'', credentialUrl:c.credentialUrl||'', description:c.description||'', skills:(c.skills||[]).join(', '), featured:c.featured||false, visible:c.visible!==false, order:c.order||0 });
    setEditId(c._id); setShowForm(true);
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/certifications/${id}`); setList(l=>l.filter(x=>x._id!==id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (item, field) => {
    try {
      const r = await api.put(`/certifications/${item._id}`, { [field]: !item[field] });
      setList(l => l.map(x => x._id===item._id ? r.data.data : x));
    } catch { toast.error('Update failed'); }
  };

  const filtered = activeType==='all' ? list : list.filter(x=>x.type===activeType);

  return (
    <div style={{ color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap'); .ci:focus{border-color:#a78bfa!important;outline:none}`}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>Certifications & Education</div>
          <div style={{ fontSize:13, color:'#4a4a6a', marginTop:3 }}>Degrees, certifications, courses and awards</div>
        </div>
        <button onClick={()=>{ setForm(empty); setEditId(null); setShowForm(!showForm); }}
          style={{ padding:'9px 18px', background:'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          {showForm && !editId ? '✕ Cancel' : '+ Add New'}
        </button>
      </div>

      {/* Type filter */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {['all',...TYPES].map(t => (
          <button key={t} onClick={()=>setActiveType(t)}
            style={{ padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:500, border:'none', cursor:'pointer', fontFamily:'inherit', textTransform:'capitalize',
              background: activeType===t ? (TYPE_COLOR[t]||'#a78bfa') : '#1a1a2e',
              color: activeType===t ? '#fff' : '#6a6a8a' }}>
            {TYPE_ICON[t]||'📋'} {t}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...card, border:'1px solid #2e2a4a', marginBottom:24 }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18 }}>{editId?'Edit':'New'} Entry</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Type</label>
                <select className="ci" style={{...inp,cursor:'pointer'}} value={form.type} onChange={e=>set('type',e.target.value)}>
                  {TYPES.map(t=><option key={t} value={t}>{TYPE_ICON[t]} {t}</option>)}
                </select></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Title / Name *</label>
                <input className="ci" style={inp} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="AWS Solutions Architect" onFocus={fo} onBlur={fb} required /></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Institution / Issuer *</label>
                <input className="ci" style={inp} value={form.institution} onChange={e=>set('institution',e.target.value)} placeholder="Amazon Web Services" onFocus={fo} onBlur={fb} required /></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Degree / Specialization</label>
                <input className="ci" style={inp} value={form.degree} onChange={e=>set('degree',e.target.value)} placeholder="B.Tech Computer Science" onFocus={fo} onBlur={fb} /></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Start Year</label>
                <input className="ci" type="number" style={inp} value={form.year} onChange={e=>set('year',e.target.value)} placeholder="2023" min="1990" max="2030" onFocus={fo} onBlur={fb} /></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>End Year (blank = present)</label>
                <input className="ci" type="number" style={inp} value={form.endYear} onChange={e=>set('endYear',e.target.value)} placeholder="2027" min="1990" max="2030" onFocus={fo} onBlur={fb} /></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Credential ID</label>
                <input className="ci" style={inp} value={form.credentialId} onChange={e=>set('credentialId',e.target.value)} placeholder="ABC-12345" onFocus={fo} onBlur={fb} /></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Credential URL</label>
                <input className="ci" style={inp} value={form.credentialUrl} onChange={e=>set('credentialUrl',e.target.value)} placeholder="https://verify.credential..." onFocus={fo} onBlur={fb} /></div>
              <div style={{ gridColumn:'1/-1' }}><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Skills Learned (comma separated)</label>
                <input className="ci" style={inp} value={form.skills} onChange={e=>set('skills',e.target.value)} placeholder="Cloud Architecture, Security, Networking" onFocus={fo} onBlur={fb} /></div>
              <div style={{ gridColumn:'1/-1' }}><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Description (optional)</label>
                <textarea className="ci" style={{...inp,minHeight:70,resize:'vertical',lineHeight:1.6}} value={form.description} onChange={e=>set('description',e.target.value)} onFocus={fo} onBlur={fb} /></div>
              <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                {[['Featured','featured'],['Visible','visible']].map(([lbl,key]) => (
                  <label key={key} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13.5, color:'#8a8aaa' }}>
                    <input type="checkbox" checked={form[key]} onChange={e=>set(key,e.target.checked)} style={{ width:16, height:16, accentColor:'#a78bfa' }} />{lbl}
                  </label>
                ))}
              </div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Sort Order</label>
                <input className="ci" type="number" style={inp} value={form.order} onChange={e=>set('order',Number(e.target.value))} onFocus={fo} onBlur={fb} /></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button type="submit" style={{ padding:'9px 22px', background:'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{editId?'Update':'Add Entry'}</button>
              <button type="button" onClick={()=>{ setShowForm(false); setEditId(null); setForm(empty); }} style={{ padding:'9px 22px', background:'#1a1a2e', border:'1px solid #2e2a4a', borderRadius:9, color:'#6a6a8a', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        Array.from({length:3}).map((_,i) => <div key={i} style={{ height:80, background:'#0f0f1a', borderRadius:12, marginBottom:10 }} />)
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign:'center', padding:'50px 20px', color:'#3a3a5a' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>{TYPE_ICON[activeType]||'📋'}</div>
          <div style={{ fontSize:15, color:'#6a6a8a' }}>No {activeType==='all'?'entries':activeType+'s'} yet</div>
        </div>
      ) : filtered.map(item => (
        <div key={item._id} style={{ ...card, marginBottom:12, display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:`${TYPE_COLOR[item.type]||'#a78bfa'}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            {TYPE_ICON[item.type]||'📋'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'#c4b5fd' }}>{item.title}</div>
                <div style={{ fontSize:12, color:'#5a5a7a', marginTop:2 }}>{item.institution}{item.degree && <span style={{color:'#4a4a6a'}}> · {item.degree}</span>}</div>
                <div style={{ fontSize:11, color:'#3a3a5a', marginTop:2 }}>{item.year}{item.endYear ? ` — ${item.endYear}` : item.year ? ' — Present' : ''}{item.credentialId && <span> · ID: {item.credentialId}</span>}</div>
              </div>
              <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:`${TYPE_COLOR[item.type]||'#a78bfa'}18`, color:TYPE_COLOR[item.type]||'#a78bfa', textTransform:'capitalize' }}>{item.type}</span>
                <button onClick={()=>handleToggle(item,'visible')} style={{ padding:'4px 8px', borderRadius:6, fontSize:10, border:'none', cursor:'pointer', fontFamily:'inherit', background:item.visible?'#0d2a1f':'#1a1a2e', color:item.visible?'#34d399':'#5a5a7a' }}>{item.visible?'Visible':'Hidden'}</button>
                {item.credentialUrl && <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" style={{ padding:'4px 8px', borderRadius:6, fontSize:10, background:'#0d1f2a', color:'#60a5fa', textDecoration:'none' }}>Verify</a>}
                <button onClick={()=>handleEdit(item)} style={{ padding:'4px 8px', borderRadius:6, fontSize:10, border:'none', cursor:'pointer', background:'#1c1830', color:'#a78bfa', fontFamily:'inherit' }}>Edit</button>
                <button onClick={()=>handleDelete(item._id)} style={{ padding:'4px 8px', borderRadius:6, fontSize:10, border:'none', cursor:'pointer', background:'#1f1520', color:'#f87171', fontFamily:'inherit' }}>Del</button>
              </div>
            </div>
            {item.skills?.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:8 }}>
                {item.skills.map(s => <span key={s} style={{ padding:'2px 8px', background:'#1a1a2e', color:'#6a6a8a', borderRadius:4, fontSize:11 }}>{s}</span>)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
