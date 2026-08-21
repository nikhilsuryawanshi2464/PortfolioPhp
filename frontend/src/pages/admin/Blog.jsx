import { useState, useEffect, useRef } from 'react';
import api from '@services/api';
import toast from 'react-hot-toast';

const CATS = ['tutorial','case-study','opinion','news','project','other'];
const inp  = { width:'100%', padding:'10px 13px', background:'#111120', border:'1px solid #2e2a4a', borderRadius:8, color:'#e8e6f0', fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box' };
const fo   = e => e.target.style.borderColor = '#a78bfa';
const fb   = e => e.target.style.borderColor = '#2e2a4a';
const card = { background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:14, padding:'22px' };
const empty = { title:'', excerpt:'', content:'', category:'tutorial', tags:'', published:false, featured:false, scheduledAt:'', seo:{ metaTitle:'', metaDesc:'' } };

function MdPreview({ md }) {
  const html = md
    .replace(/^### (.+)$/gm,'<h3 style="color:#c4b5fd;margin:16px 0 8px;font-size:16px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#e8e6f0;margin:20px 0 10px;font-size:19px">$1</h2>')
    .replace(/^# (.+)$/gm,  '<h1 style="color:#e8e6f0;margin:24px 0 12px;font-size:24px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e8e6f0">$1</strong>')
    .replace(/\*(.+?)\*/g,   '<em>$1</em>')
    .replace(/`(.+?)`/g,     '<code style="background:#1a1a2e;padding:2px 6px;border-radius:4px;color:#60a5fa;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm,   '<li style="margin:4px 0;color:#8a8aaa;list-style:disc;margin-left:20px">$1</li>')
    .replace(/\n\n/g,'<br/><br/>');
  return <div style={{ fontSize:14, color:'#8a8aaa', lineHeight:1.8 }} dangerouslySetInnerHTML={{ __html:html }} />;
}

export default function AdminBlog() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState('list');
  const [form, setForm]       = useState(empty);
  const [editId, setEditId]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const coverRef = useRef();

  const load = () => api.get('/blog')
    .then(r => setPosts(r.data?.data || []))
    .catch(() => toast.error('Failed to load posts'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set    = (k,v) => setForm(f => ({...f,[k]:v}));
  const setSeo = (k,v) => setForm(f => ({...f, seo:{...f.seo,[k]:v}}));

  // ── Bulk actions ──────────────────────────────────────────────
  const toggleSelect = (id) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const selectAll  = () => setSelectedIds(posts.map(p => p._id));
  const clearSel   = () => setSelectedIds([]);

  const bulkAction = async (action) => {
    if (!selectedIds.length) return;
    if (action === 'delete' && !window.confirm(`Delete ${selectedIds.length} post(s)?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map(id => {
        if (action === 'delete')    return api.delete(`/blog/${id}`);
        if (action === 'publish')   return api.put(`/blog/${id}`, { published: true });
        if (action === 'unpublish') return api.put(`/blog/${id}`, { published: false });
        return Promise.resolve();
      }));
      toast.success(`${action.charAt(0).toUpperCase()+action.slice(1)}ed ${selectedIds.length} post(s)`);
      clearSel(); load();
    } catch { toast.error('Bulk action failed'); }
    setBulkLoading(false);
  };

  const handleNew = () => { setForm(empty); setEditId(null); setView('edit'); };

  const handleEdit = async (post) => {
    try {
      const { data } = await api.get(`/blog/id/${post._id}`);
      const fullPost = data?.data;
      if (!fullPost) {
        toast.error('Post data not found');
        return;
      }

      setForm({
        title: fullPost.title || '',
        excerpt: fullPost.excerpt || '',
        content: fullPost.content || '',
        category: fullPost.category || 'tutorial',
        tags: (fullPost.tags || []).join(', '),
        published: fullPost.published || false,
        featured: fullPost.featured || false,
        coverImage: fullPost.coverImage,
        seo: {
          metaTitle: fullPost.seo?.metaTitle || '',
          metaDesc: fullPost.seo?.metaDesc || '',
        },
      });
      setEditId(fullPost._id);
      setView('edit');
    } catch {
      toast.error('Failed to load post content');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content required'); return; }
    const payload = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
    try {
      if (editId) { await api.put(`/blog/${editId}`, payload); toast.success('Post updated!'); }
      else        { const r = await api.post('/blog', payload); setEditId(r.data.data._id); toast.success('Post created!'); }
      load(); setView('list');
    } catch(err) { toast.error(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await api.delete(`/blog/${id}`); setPosts(p=>p.filter(x=>x._id!==id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const handleTogglePublish = async (post) => {
    try {
      const r = await api.put(`/blog/${post._id}`, { published:!post.published });
      setPosts(p => p.map(x => x._id===post._id ? r.data.data : x));
      toast.success(post.published ? 'Unpublished' : 'Published!');
    } catch { toast.error('Update failed'); }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editId) { toast.error('Save post first, then upload cover'); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('cover', file);
      const r = await api.post(`/blog/${editId}/cover`, fd, { headers:{'Content-Type':'multipart/form-data'} });
      setForm(f => ({...f, coverImage:r.data.data.coverImage}));
      toast.success('Cover uploaded!');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';

  // ── LIST ──────────────────────────────────────────────────
  if (view === 'list') return (
    <div style={{ color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>Blog & Articles</div>
          <div style={{ fontSize:13, color:'#4a4a6a', marginTop:3 }}>Write technical articles and case studies</div>
        </div>
        <button onClick={handleNew} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          + New Post
        </button>
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:20, fontSize:13, color:'#4a4a6a' }}>
        <span><strong style={{color:'#a78bfa'}}>{posts.length}</strong> total</span>
        <span><strong style={{color:'#34d399'}}>{posts.filter(p=>p.published).length}</strong> published</span>
        <span><strong style={{color:'#6a6a8a'}}>{posts.filter(p=>!p.published).length}</strong> drafts</span>
      </div>

      {loading ? (
        Array.from({length:3}).map((_,i) => <div key={i} style={{ height:64, background:'#0f0f1a', borderRadius:12, marginBottom:10 }} />)
      ) : posts.length === 0 ? (
        <div style={{ ...card, textAlign:'center', padding:'50px 20px', color:'#3a3a5a' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>✍️</div>
          <div style={{ fontSize:16, color:'#6a6a8a', marginBottom:6 }}>No posts yet</div>
          <div style={{ fontSize:13 }}>Start writing your first article</div>
        </div>
      ) : (
        <div style={{ background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 80px 90px 160px', padding:'11px 18px', borderBottom:'1px solid #1e1e2e', fontSize:10, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a' }}>
            <span>Title</span><span>Category</span><span>Read</span><span>Status</span><span>Actions</span>
          </div>
          {posts.map((p,i) => (
            <div key={p._id}
              style={{ display:'grid', gridTemplateColumns:'1fr 100px 80px 90px 160px', padding:'14px 18px', borderBottom:i<posts.length-1?'1px solid #111120':'none', alignItems:'center', transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#111120'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div>
                <div style={{ fontSize:14, fontWeight:500, color:'#c4b5fd' }}>{p.title}</div>
                <div style={{ fontSize:11, color:'#3a3a5a', marginTop:2 }}>{fmtDate(p.publishedAt||p.createdAt)} · {p.views||0} views</div>
              </div>
              <div style={{ fontSize:12, color:'#5a5a7a', textTransform:'capitalize' }}>{p.category}</div>
              <div style={{ fontSize:12, color:'#5a5a7a' }}>{p.readTime||1} min</div>
              <div>
                <button onClick={()=>handleTogglePublish(p)}
                  style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, cursor:'pointer', border:'none', fontFamily:'inherit', background:p.published?'#0d2a1f':'#1f1a2e', color:p.published?'#34d399':'#a78bfa' }}>
                  {p.published ? '● Live' : '○ Draft'}
                </button>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={()=>handleEdit(p)} style={{ padding:'5px 10px', borderRadius:6, fontSize:11, border:'none', cursor:'pointer', background:'#1c1830', color:'#a78bfa', fontFamily:'inherit' }}>Edit</button>
                <button onClick={()=>handleDelete(p._id,p.title)} style={{ padding:'5px 10px', borderRadius:6, fontSize:11, border:'none', cursor:'pointer', background:'#1f1520', color:'#f87171', fontFamily:'inherit' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── EDIT ──────────────────────────────────────────────────
  return (
    <div style={{ color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap'); .bi:focus{border-color:#a78bfa!important;outline:none}`}</style>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, letterSpacing:'-0.5px' }}>{editId ? 'Edit Post' : 'New Post'}</div>
        <div style={{ display:'flex', gap:8 }}>
          {view==='edit' && <button onClick={()=>setView('preview')} style={{ padding:'7px 14px', borderRadius:8, fontSize:12, border:'1px solid #2e2a4a', cursor:'pointer', background:'#1a1a2e', color:'#a78bfa', fontFamily:'inherit' }}>👁 Preview</button>}
          {view==='preview' && <button onClick={()=>setView('edit')} style={{ padding:'7px 14px', borderRadius:8, fontSize:12, border:'1px solid #2e2a4a', cursor:'pointer', background:'#1a1a2e', color:'#a78bfa', fontFamily:'inherit' }}>✏️ Edit</button>}
          <button onClick={()=>{ setView('list'); load(); }} style={{ padding:'7px 14px', borderRadius:8, fontSize:12, border:'none', cursor:'pointer', background:'#1a1a2e', color:'#6a6a8a', fontFamily:'inherit' }}>← Back</button>
        </div>
      </div>

      {view === 'preview' ? (
        <div style={card}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:20 }}>Markdown Preview</div>
          {form.coverImage?.url && <img src={form.coverImage.url} alt="" style={{ width:'100%', borderRadius:10, marginBottom:20, maxHeight:300, objectFit:'cover' }} />}
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color:'#e8e6f0', marginBottom:8 }}>{form.title||'Untitled'}</h1>
          {form.excerpt && <p style={{ fontSize:15, color:'#6a6a8a', marginBottom:20, fontStyle:'italic' }}>{form.excerpt}</p>}
          <MdPreview md={form.content} />
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20, alignItems:'start' }}>
            <div>
              <div style={{ ...card, marginBottom:16 }}>
                <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18 }}>Post Content</div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Title *</label>
                  <input className="bi" style={inp} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="How I Built a Scalable API with Node.js" required onFocus={fo} onBlur={fb} />
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Excerpt (shown on blog cards)</label>
                  <textarea className="bi" style={{...inp,minHeight:70,resize:'vertical',lineHeight:1.6}} value={form.excerpt} onChange={e=>set('excerpt',e.target.value)} placeholder="A brief summary of what readers will learn..." maxLength={400} onFocus={fo} onBlur={fb} />
                </div>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                    <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a' }}>Content * (Markdown)</label>
                    <span style={{ fontSize:11, color:'#3a3a5a' }}>**bold** *italic* # heading - list `code`</span>
                  </div>
                  <textarea className="bi" style={{...inp,minHeight:360,resize:'vertical',lineHeight:1.75,fontFamily:'monospace',fontSize:13}} value={form.content} onChange={e=>set('content',e.target.value)} placeholder={"# Introduction\n\nWrite your article here...\n\n## Section\n\n- Point one\n- Point two"} required onFocus={fo} onBlur={fb} />
                  <div style={{ fontSize:11, color:'#3a3a5a', marginTop:4, textAlign:'right' }}>~{Math.max(1,Math.ceil(form.content.split(/\s+/).length/200))} min read</div>
                </div>
              </div>
              <div style={card}>
                <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18 }}>SEO Settings</div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Meta Title <span style={{color:'#3a3a5a'}}>(max 70)</span></label>
                  <input className="bi" style={inp} value={form.seo.metaTitle} onChange={e=>setSeo('metaTitle',e.target.value)} placeholder={form.title||'SEO title...'} maxLength={70} onFocus={fo} onBlur={fb} />
                </div>
                <div>
                  <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Meta Description <span style={{color:'#3a3a5a'}}>(max 160)</span></label>
                  <textarea className="bi" style={{...inp,minHeight:70,resize:'vertical',lineHeight:1.6}} value={form.seo.metaDesc} onChange={e=>setSeo('metaDesc',e.target.value)} placeholder={form.excerpt||'SEO description...'} maxLength={160} onFocus={fo} onBlur={fb} />
                </div>
              </div>
            </div>

            <div>
              {/* Cover image */}
              <div style={{ ...card, marginBottom:16, textAlign:'center' }}>
                <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:14 }}>Cover Image</div>
                <div style={{ width:'100%', aspectRatio:'16/9', borderRadius:9, overflow:'hidden', background:'#111120', border:'1px solid #2e2a4a', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {form.coverImage?.url ? <img src={form.coverImage.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:28, color:'#3a3a5a' }}>🖼️</span>}
                </div>
                <input ref={coverRef} id="cover-up" type="file" accept="image/*" onChange={handleCoverUpload} style={{ display:'none' }} />
                <label htmlFor="cover-up" style={{ display:'block', padding:'8px', background:editId?'linear-gradient(135deg,#a78bfa,#60a5fa)':'#2e2a4a', borderRadius:8, color:'#fff', fontSize:12, fontWeight:600, cursor:editId?'pointer':'not-allowed', opacity:uploading?0.6:1 }}>
                  {uploading ? 'Uploading...' : form.coverImage?.url ? 'Replace Cover' : editId ? '↑ Upload Cover' : 'Save post first'}
                </label>
                <div style={{ fontSize:10, color:'#3a3a5a', marginTop:8 }}>1200×630px recommended</div>
              </div>

              {/* Settings */}
              <div style={{ ...card, marginBottom:16 }}>
                <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18 }}>Settings</div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Category</label>
                  <select className="bi" style={{...inp,cursor:'pointer'}} value={form.category} onChange={e=>set('category',e.target.value)} onFocus={fo} onBlur={fb}>
                    {CATS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Tags (comma separated)</label>
                  <input className="bi" style={inp} value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="javascript, nodejs, api" onFocus={fo} onBlur={fb} />
                </div>
                {/* Scheduled Publish */}
                <div style={{ padding:'11px 0', borderBottom:'1px solid #111120' }}>
                  <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', display:'block', marginBottom:7 }}>Schedule Publish (optional)</label>
                  <input type="datetime-local" className="bi" style={inp}
                    value={form.scheduledAt || ''}
                    onChange={e => set('scheduledAt', e.target.value)}
                    onFocus={fo} onBlur={fb}
                    min={new Date().toISOString().slice(0,16)}/>
                  <div style={{ fontSize:11, color:'#4a4a6a', marginTop:4 }}>Leave empty to publish immediately when Published is checked.</div>
                </div>
                {[['Published','published'],['Featured','featured']].map(([lbl,key]) => (
                  <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid #111120' }}>
                    <span style={{ fontSize:13.5, color:'#8a8aaa' }}>{lbl}</span>
                    <input type="checkbox" checked={form[key]} onChange={e=>set(key,e.target.checked)} style={{ width:17, height:17, cursor:'pointer', accentColor:'#a78bfa' }} />
                  </div>
                ))}
              </div>

              <button type="submit" style={{ width:'100%', padding:12, background:'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                {editId ? '✓ Update Post' : '✓ Create Post'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
