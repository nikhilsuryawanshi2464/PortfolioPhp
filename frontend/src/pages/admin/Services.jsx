import { useState, useEffect } from 'react';
import api from '@services/api';
import toast from 'react-hot-toast';

const PRICE_TYPES  = ['contact','fixed','hourly','monthly'];
const PRICE_LABELS = { contact:'Contact for Pricing', fixed:'Fixed Price', hourly:'Per Hour', monthly:'Per Month' };
const EMOJIS = ['💼','🌐','⚡','🔧','📱','🎨','🔒','📊','🚀','🛠️','💡','🤝','📝','☁️','🔌'];
const inp  = { width:'100%', padding:'9px 12px', background:'#111120', border:'1px solid #2e2a4a', borderRadius:8, color:'#e8e6f0', fontSize:13.5, outline:'none', fontFamily:'inherit', boxSizing:'border-box' };
const fo   = e => e.target.style.borderColor = '#a78bfa';
const fb   = e => e.target.style.borderColor = '#2e2a4a';
const card = { background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:14, padding:'20px 22px' };
const empty = { title:'', description:'', icon:'💼', features:'', priceType:'contact', priceFrom:'', priceTo:'', currency:'USD', popular:false, visible:true, order:0, cta:'Get in Touch', ctaLink:'/contact' };

export default function AdminServices() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(empty);
  const [editId, setEditId]     = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/services')
    .then(r => setList(r.data?.data || []))
    .catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description required'); return; }
    const payload = { ...form, features: form.features.split('\n').map(f=>f.trim()).filter(Boolean), priceFrom: form.priceFrom ? Number(form.priceFrom) : undefined, priceTo: form.priceTo ? Number(form.priceTo) : undefined };
    try {
      if (editId) { await api.put(`/services/${editId}`, payload); toast.success('Updated!'); }
      else        { await api.post('/services', payload);           toast.success('Added!'); }
      setForm(empty); setEditId(null); setShowForm(false); load();
    } catch(err) { toast.error(err.response?.data?.error || 'Save failed'); }
  };

  const handleEdit = (s) => {
    setForm({ title:s.title, description:s.description, icon:s.icon||'💼', features:(s.features||[]).join('\n'), priceType:s.priceType||'contact', priceFrom:s.priceFrom||'', priceTo:s.priceTo||'', currency:s.currency||'USD', popular:s.popular||false, visible:s.visible!==false, order:s.order||0, cta:s.cta||'Get in Touch', ctaLink:s.ctaLink||'/contact' });
    setEditId(s._id); setShowForm(true);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await api.delete(`/services/${id}`); setList(l=>l.filter(x=>x._id!==id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (item, field) => {
    try {
      const r = await api.put(`/services/${item._id}`, { [field]: !item[field] });
      setList(l => l.map(x => x._id===item._id ? r.data.data : x));
    } catch { toast.error('Update failed'); }
  };

  const fmtPrice = (s) => {
    if (s.priceType==='contact') return 'Contact for Pricing';
    const sym = s.currency==='USD'?'$':s.currency==='INR'?'₹':s.currency==='EUR'?'€':s.currency;
    const sfx = { hourly:'/hr', monthly:'/mo', fixed:'' }[s.priceType]||'';
    if (s.priceFrom && s.priceTo) return `${sym}${s.priceFrom}–${sym}${s.priceTo}${sfx}`;
    if (s.priceFrom) return `From ${sym}${s.priceFrom}${sfx}`;
    return 'Pricing on request';
  };

  return (
    <div style={{ color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap'); .si:focus{border-color:#a78bfa!important;outline:none}`}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>Services</div>
          <div style={{ fontSize:13, color:'#4a4a6a', marginTop:3 }}>What you offer — shown on your portfolio</div>
        </div>
        <button onClick={()=>{ setForm(empty); setEditId(null); setShowForm(!showForm); }}
          style={{ padding:'9px 18px', background:'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          {showForm && !editId ? '✕ Cancel' : '+ Add Service'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...card, border:'1px solid #2e2a4a', marginBottom:24 }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18 }}>{editId?'Edit Service':'New Service'}</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Title *</label>
                <input className="si" style={inp} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Web Development" onFocus={fo} onBlur={fb} required /></div>
              <div>
                <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Icon Emoji</label>
                <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                  <input className="si" style={{...inp,width:60}} value={form.icon} onChange={e=>set('icon',e.target.value)} />
                  {EMOJIS.map(em => <span key={em} onClick={()=>set('icon',em)} style={{ fontSize:18, cursor:'pointer', padding:'2px', borderRadius:4, border:form.icon===em?'1px solid #a78bfa':'1px solid transparent' }}>{em}</span>)}
                </div>
              </div>
              <div style={{ gridColumn:'1/-1' }}><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Description *</label>
                <textarea className="si" style={{...inp,minHeight:80,resize:'vertical',lineHeight:1.65}} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Build modern, responsive websites..." maxLength={600} onFocus={fo} onBlur={fb} required /></div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Features / What's Included <span style={{color:'#3a3a5a'}}>(one per line)</span></label>
                <textarea className="si" style={{...inp,minHeight:100,resize:'vertical',lineHeight:1.65,fontFamily:'monospace',fontSize:13}} value={form.features} onChange={e=>set('features',e.target.value)} placeholder={"Responsive design\nSEO optimized\n3 revision rounds\nSource code included"} onFocus={fo} onBlur={fb} />
              </div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Pricing Type</label>
                <select className="si" style={{...inp,cursor:'pointer'}} value={form.priceType} onChange={e=>set('priceType',e.target.value)}>
                  {PRICE_TYPES.map(t=><option key={t} value={t}>{PRICE_LABELS[t]}</option>)}
                </select></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Currency</label>
                <select className="si" style={{...inp,cursor:'pointer'}} value={form.currency} onChange={e=>set('currency',e.target.value)} disabled={form.priceType==='contact'}>
                  {['USD','INR','EUR','GBP','AUD'].map(c=><option key={c} value={c}>{c}</option>)}
                </select></div>
              {form.priceType !== 'contact' && <>
                <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Price From</label>
                  <input className="si" type="number" style={inp} value={form.priceFrom} onChange={e=>set('priceFrom',e.target.value)} placeholder="500" min="0" onFocus={fo} onBlur={fb} /></div>
                <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Price To (optional max)</label>
                  <input className="si" type="number" style={inp} value={form.priceTo} onChange={e=>set('priceTo',e.target.value)} placeholder="2000" min="0" onFocus={fo} onBlur={fb} /></div>
              </>}
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Button Label</label>
                <input className="si" style={inp} value={form.cta} onChange={e=>set('cta',e.target.value)} placeholder="Get in Touch" onFocus={fo} onBlur={fb} /></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Button Link</label>
                <input className="si" style={inp} value={form.ctaLink} onChange={e=>set('ctaLink',e.target.value)} placeholder="/contact" onFocus={fo} onBlur={fb} /></div>
              <div><label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Sort Order</label>
                <input className="si" type="number" style={inp} value={form.order} onChange={e=>set('order',Number(e.target.value))} onFocus={fo} onBlur={fb} /></div>
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                {[['Popular (highlighted)','popular'],['Visible','visible']].map(([lbl,key]) => (
                  <label key={key} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'#8a8aaa' }}>
                    <input type="checkbox" checked={form[key]} onChange={e=>set(key,e.target.checked)} style={{ width:15, height:15, accentColor:'#a78bfa' }} />{lbl}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button type="submit" style={{ padding:'9px 22px', background:'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{editId?'Update':'Add Service'}</button>
              <button type="button" onClick={()=>{ setShowForm(false); setEditId(null); setForm(empty); }} style={{ padding:'9px 22px', background:'#1a1a2e', border:'1px solid #2e2a4a', borderRadius:9, color:'#6a6a8a', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Cards */}
      {loading ? (
        Array.from({length:2}).map((_,i) => <div key={i} style={{ height:120, background:'#0f0f1a', borderRadius:14, marginBottom:12 }} />)
      ) : list.length === 0 ? (
        <div style={{ ...card, textAlign:'center', padding:'50px 20px', color:'#3a3a5a' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💼</div>
          <div style={{ fontSize:16, color:'#6a6a8a', marginBottom:6 }}>No services yet</div>
          <div style={{ fontSize:13 }}>Add what you offer to potential clients</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {list.map(s => (
            <div key={s._id} style={{ ...card, position:'relative', border:s.popular?'1px solid #a78bfa':'1px solid #1e1e2e' }}>
              {s.popular && <div style={{ position:'absolute', top:-10, right:16, background:'linear-gradient(135deg,#a78bfa,#60a5fa)', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:20 }}>POPULAR</div>}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:28 }}>{s.icon||'💼'}</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:600, color:'#c4b5fd' }}>{s.title}</div>
                    <div style={{ fontSize:12, color:'#a78bfa', marginTop:2, fontWeight:600 }}>{fmtPrice(s)}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                  <button onClick={()=>handleToggle(s,'visible')} style={{ padding:'3px 8px', borderRadius:5, fontSize:10, border:'none', cursor:'pointer', fontFamily:'inherit', background:s.visible?'#0d2a1f':'#1a1a2e', color:s.visible?'#34d399':'#5a5a7a' }}>{s.visible?'On':'Off'}</button>
                  <button onClick={()=>handleEdit(s)} style={{ padding:'3px 8px', borderRadius:5, fontSize:10, border:'none', cursor:'pointer', background:'#1c1830', color:'#a78bfa', fontFamily:'inherit' }}>Edit</button>
                  <button onClick={()=>handleDelete(s._id)} style={{ padding:'3px 8px', borderRadius:5, fontSize:10, border:'none', cursor:'pointer', background:'#1f1520', color:'#f87171', fontFamily:'inherit' }}>Del</button>
                </div>
              </div>
              <div style={{ fontSize:13, color:'#7a7a9a', lineHeight:1.6, marginBottom:10 }}>{s.description}</div>
              {s.features?.length > 0 && (
                <ul style={{ margin:0, padding:'0 0 0 16px' }}>
                  {s.features.slice(0,4).map((f,i) => <li key={i} style={{ fontSize:12, color:'#5a5a7a', marginBottom:3 }}>{f}</li>)}
                  {s.features.length > 4 && <li style={{ fontSize:12, color:'#3a3a5a' }}>+{s.features.length-4} more...</li>}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
