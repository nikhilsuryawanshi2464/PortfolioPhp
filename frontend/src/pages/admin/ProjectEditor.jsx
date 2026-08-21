import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsAPI } from '@services/api';
import api from '@services/api';
import toast from 'react-hot-toast';

const CATS     = ['web', 'mobile', 'desktop', 'ai-ml', 'devops', 'other'];
const STATUSES = ['planning', 'in-progress', 'completed', 'archived'];

const inp = {
  width: '100%', background: '#1a1a2e', border: '1px solid #2e2a4a',
  borderRadius: 8, padding: '10px 13px', color: '#e8e6f0', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};
const fo  = e => e.target.style.borderColor = '#a78bfa';
const fb  = e => e.target.style.borderColor = '#2e2a4a';
const Lbl = ({ t }) => <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', marginBottom:7 }}>{t}</label>;
const F   = ({ t, children }) => <div style={{ marginBottom:16 }}><Lbl t={t} />{children}</div>;
const card = { background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:12, padding:24, marginBottom:16 };
const normalizeExternalUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export default function AdminProjectEditor() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = !!id;
  const thumbRef   = useRef();
  const galleryRef = useRef();

  const [saving, setSaving]               = useState(false);
  const [loadingProject, setLoadingProject] = useState(isEdit);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [thumbPreview, setThumbPreview]   = useState('');
  const [thumbUrl, setThumbUrl]           = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPending, setGalleryPending] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(id || null);

  const [form, setForm] = useState({
    title:'', description:'', content:'', category:'web', status:'completed',
    technologies:'', tags:'', liveUrl:'', githubUrl:'', demoUrl:'',
    published:false, featured:false, priority:0,
  });

  useEffect(() => {
    if (!isEdit) return;
    projectsAPI.getById(id).then(r => {
      const proj = r.data?.data;
      if (proj) {
        setForm({
          title: proj.title||'', description: proj.description||'', content: proj.content||'',
          category: proj.category||'web', status: proj.status||'completed',
          technologies: (proj.technologies||[]).join(', '), tags: (proj.tags||[]).join(', '),
          liveUrl: proj.links?.live||'', githubUrl: proj.links?.github||'', demoUrl: proj.links?.demo||'',
          published: proj.published||false, featured: proj.featured||false, priority: proj.priority||0,
        });
        setThumbUrl(proj.thumbnail?.url || '');
        setGalleryImages(proj.images || []);
        setCurrentProjectId(proj._id);
      } else { toast.error('Project not found'); navigate('/admin/projects'); }
    }).finally(() => setLoadingProject(false));
  }, [id, isEdit, navigate]);

  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const updateGalleryField = (index, key, value) => {
    setGalleryImages(prev => prev.map((image, imageIndex) => (
      imageIndex === index ? { ...image, [key]: value } : image
    )));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())       { toast.error('Title is required');       return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    if (!form.content.trim())     { toast.error('Content is required');     return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(), description: form.description.trim(), content: form.content.trim(),
      category: form.category, status: form.status,
      technologies: form.technologies.split(',').map(t=>t.trim()).filter(Boolean),
      tags:         form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      images: galleryImages.map(image => ({
        url: image.url,
        publicId: image.publicId,
        title: image.title?.trim() || '',
        caption: image.caption?.trim() || '',
        description: image.description?.trim() || '',
      })),
      links: {
        live: normalizeExternalUrl(form.liveUrl),
        github: normalizeExternalUrl(form.githubUrl),
        demo: normalizeExternalUrl(form.demoUrl),
      },
      published: form.published, featured: form.featured, priority: Number(form.priority),
    };
    try {
      if (isEdit) {
        await projectsAPI.update(id, payload);
        toast.success('Project updated!');
        navigate('/admin/projects');
      } else {
        const res = await projectsAPI.create(payload);
        const newId = res.data?.data?._id;
        setCurrentProjectId(newId);
        toast.success('Project created!');
        // If user selected a thumbnail before saving, upload now
        if (thumbRef.current?.files[0] && newId) {
          await doThumbUpload(thumbRef.current.files[0], newId);
        }
        if (galleryPending.length && newId) {
          await doGalleryUpload(galleryPending.map(item => item.file), newId);
        }
        navigate(`/admin/projects/${newId}/edit`);
      }
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
    setSaving(false);
  };

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }
    setThumbPreview(URL.createObjectURL(file));
    // If editing existing project, auto-upload immediately
    if (currentProjectId) doThumbUpload(file, currentProjectId);
  };

  const doThumbUpload = async (file, projId) => {
    setUploadingThumb(true);
    try {
      const fd = new FormData();
      fd.append('thumbnail', file);
      const res = await api.post(`/projects/${projId}/thumbnail`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setThumbUrl(res.data?.data?.thumbnail?.url || '');
      setThumbPreview('');
      toast.success('Thumbnail uploaded!');
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed'); }
    setUploadingThumb(false);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const oversized = files.find(file => file.size > 10 * 1024 * 1024);
    if (oversized) {
      toast.error('Each gallery image must be under 10MB');
      return;
    }

    const pendingItems = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    if (currentProjectId) {
      doGalleryUpload(files, currentProjectId);
    } else {
      setGalleryPending(prev => [...prev, ...pendingItems]);
    }
  };

  const doGalleryUpload = async (files, projId) => {
    setUploadingGallery(true);
    try {
      const fd = new FormData();
      files.forEach(file => fd.append('images', file));
      const res = await api.post(`/projects/${projId}/images`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setGalleryImages(res.data?.data?.images || []);
      setGalleryPending([]);
      if (galleryRef.current) galleryRef.current.value = '';
      toast.success('Gallery images uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gallery upload failed');
    }
    setUploadingGallery(false);
  };

  const handleGalleryDelete = async ({ publicId, pendingIndex }) => {
    if (pendingIndex !== undefined) {
      setGalleryPending(prev => prev.filter((_, index) => index !== pendingIndex));
      return;
    }

    if (!currentProjectId || !publicId) return;

    try {
      const res = await api.delete(`/projects/${currentProjectId}/images`, {
        data: { publicId },
      });
      setGalleryImages(res.data?.data?.images || []);
      toast.success('Gallery image removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleThumbDelete = async () => {
    if (!currentProjectId || !thumbUrl) return;
    try {
      await api.delete(`/projects/${currentProjectId}/thumbnail`);
      setThumbUrl(''); setThumbPreview('');
      toast.success('Thumbnail removed');
    } catch { toast.error('Delete failed'); }
  };

  if (loadingProject) return <div style={{ color:'#4a4a6a', padding:40, textAlign:'center' }}>Loading...</div>;

  const liveHref = normalizeExternalUrl(form.liveUrl);
  const demoHref = normalizeExternalUrl(form.demoUrl);

  return (
    <div style={{ color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:26 }}>
        <h1 style={{ fontSize:24, fontWeight:700, fontFamily:'Syne,sans-serif', letterSpacing:'-0.5px' }}>
          {isEdit ? 'Edit Project' : 'New Project'}
        </h1>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {form.liveUrl.trim() && (
            <a href={liveHref} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:'#8ab4ff', textDecoration:'none', padding:'8px 12px', border:'1px solid #2e2a4a', borderRadius:8 }}>
              Live Preview
            </a>
          )}
          {form.demoUrl.trim() && (
            <a href={demoHref} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:'#f9a8d4', textDecoration:'none', padding:'8px 12px', border:'1px solid #2e2a4a', borderRadius:8 }}>
              Demo Preview
            </a>
          )}
          <Link to="/admin/projects" style={{ fontSize:13, color:'#5a5a7a', textDecoration:'none' }}>← Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:20, alignItems:'start' }}>

          {/* ── LEFT ─────────────────────────────────── */}
          <div>
            <div style={card}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18 }}>Project Details</div>
              <F t="Title *">
                <input style={inp} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="My Awesome Project" onFocus={fo} onBlur={fb} required />
              </F>
              <F t="Short Description * (shown on cards, max 500 chars)">
                <textarea style={{...inp,minHeight:80,resize:'vertical',lineHeight:1.6}} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Brief description..." maxLength={500} onFocus={fo} onBlur={fb} required />
              </F>
              <F t="Full Content / Case Study *">
                <textarea style={{...inp,minHeight:240,resize:'vertical',lineHeight:1.7}} value={form.content} onChange={e=>set('content',e.target.value)} placeholder="Write the full story of your project..." onFocus={fo} onBlur={fb} required />
              </F>
            </div>

            <div style={card}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18 }}>Technologies & Links</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <F t="Technologies (comma separated)">
                  <input style={inp} value={form.technologies} onChange={e=>set('technologies',e.target.value)} placeholder="React, Node.js, MongoDB" onFocus={fo} onBlur={fb} />
                </F>
                <F t="Tags (comma separated)">
                  <input style={inp} value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="fullstack, saas" onFocus={fo} onBlur={fb} />
                </F>
                <F t="Live URL">
                  <input type="url" style={inp} value={form.liveUrl} onChange={e=>set('liveUrl',e.target.value)} placeholder="https://myproject.com" onFocus={fo} onBlur={fb} />
                </F>
                <F t="GitHub URL">
                  <input type="url" style={inp} value={form.githubUrl} onChange={e=>set('githubUrl',e.target.value)} placeholder="https://github.com/..." onFocus={fo} onBlur={fb} />
                </F>
                <F t="Demo Video URL">
                  <input type="url" style={inp} value={form.demoUrl} onChange={e=>set('demoUrl',e.target.value)} placeholder="https://youtube.com/watch?v=..." onFocus={fo} onBlur={fb} />
                </F>
              </div>
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────── */}
          <div>
            {/* Thumbnail */}
            <div style={card}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:14 }}>Cover Image</div>

              {/* Preview */}
              <div style={{ width:'100%', aspectRatio:'16/9', borderRadius:10, overflow:'hidden', background:'#111120', border:'1px solid #2e2a4a', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                {(thumbPreview || thumbUrl) ? (
                  <>
                    <img src={thumbPreview || thumbUrl} alt="thumbnail" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    {uploadingThumb && (
                      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#a78bfa', fontSize:13 }}>
                        Uploading...
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign:'center', color:'#3a3a5a' }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🖼️</div>
                    <div style={{ fontSize:12 }}>No cover image</div>
                  </div>
                )}
              </div>

              <input ref={thumbRef} id="thumb-input" type="file" accept="image/*" onChange={handleThumbChange} style={{ display:'none' }} />
              <label htmlFor="thumb-input" style={{ display:'block', textAlign:'center', padding:'9px', background:'linear-gradient(135deg,#a78bfa,#60a5fa)', borderRadius:8, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:8 }}>
                {uploadingThumb ? 'Uploading...' : thumbUrl ? 'Replace Image' : '↑ Upload Cover Image'}
              </label>
              {thumbUrl && (
                <button type="button" onClick={handleThumbDelete} style={{ width:'100%', padding:'7px', background:'#1f1520', border:'1px solid #3a1a25', borderRadius:8, color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                  Remove Image
                </button>
              )}
              <div style={{ fontSize:11, color:'#3a3a5a', marginTop:8, textAlign:'center' }}>JPG, PNG, WebP · 16:9 ratio recommended · Max 10MB</div>
              {!isEdit && thumbRef.current?.files[0] && (
                <div style={{ fontSize:11, color:'#f59e0b', marginTop:6, textAlign:'center' }}>⚠ Image will upload after project is saved</div>
              )}
            </div>

            <div style={card}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:14 }}>Project Gallery</div>
              <input ref={galleryRef} id="gallery-input" type="file" accept="image/*" multiple onChange={handleGalleryChange} style={{ display:'none' }} />
              <label htmlFor="gallery-input" style={{ display:'block', textAlign:'center', padding:'9px', background:'linear-gradient(135deg,#22c55e,#14b8a6)', borderRadius:8, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:12 }}>
                {uploadingGallery ? 'Uploading Gallery...' : '＋ Add Multiple Images'}
              </label>
              {(!galleryImages.length && !galleryPending.length) && (
                <div style={{ fontSize:12, color:'#5a5a7a', textAlign:'center', padding:'10px 0' }}>No gallery images added yet</div>
              )}
              <div style={{ display:'grid', gap:10 }}>
                {galleryImages.map((image, index) => (
                  <div key={image.publicId || image.url || index} style={{ display:'grid', gridTemplateColumns:'72px 1fr auto', gap:10, alignItems:'start', padding:8, border:'1px solid #1e1e2e', borderRadius:10, background:'#111120' }}>
                    <img src={image.url} alt={image.caption || `gallery-${index + 1}`} style={{ width:72, height:48, objectFit:'cover', borderRadius:8 }} />
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, color:'#d4d4f4', marginBottom:8 }}>Gallery image {index + 1}</div>
                      <input
                        style={{ ...inp, padding:'8px 10px', fontSize:12, marginBottom:8 }}
                        value={image.title || ''}
                        onChange={e => updateGalleryField(index, 'title', e.target.value)}
                        placeholder="Image title"
                      />
                      <input
                        style={{ ...inp, padding:'8px 10px', fontSize:12, marginBottom:8 }}
                        value={image.caption || ''}
                        onChange={e => updateGalleryField(index, 'caption', e.target.value)}
                        placeholder="Short caption"
                      />
                      <textarea
                        style={{ ...inp, padding:'8px 10px', fontSize:12, minHeight:72, resize:'vertical', lineHeight:1.5 }}
                        value={image.description || ''}
                        onChange={e => updateGalleryField(index, 'description', e.target.value)}
                        placeholder="Image content / description shown on frontend"
                      />
                    </div>
                    <button type="button" onClick={() => handleGalleryDelete({ publicId: image.publicId })} style={{ padding:'6px 10px', background:'#1f1520', border:'1px solid #3a1a25', borderRadius:8, color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                      Remove
                    </button>
                  </div>
                ))}
                {galleryPending.map((image, index) => (
                  <div key={`${image.name}-${index}`} style={{ display:'grid', gridTemplateColumns:'72px 1fr auto', gap:10, alignItems:'center', padding:8, border:'1px solid #1e1e2e', borderRadius:10, background:'#111120' }}>
                    <img src={image.preview} alt={image.name} style={{ width:72, height:48, objectFit:'cover', borderRadius:8 }} />
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, color:'#d4d4f4' }}>{image.name}</div>
                      <div style={{ fontSize:11, color:'#f59e0b' }}>Will upload after project is saved</div>
                    </div>
                    <button type="button" onClick={() => handleGalleryDelete({ pendingIndex: index })} style={{ padding:'6px 10px', background:'#1f1520', border:'1px solid #3a1a25', borderRadius:8, color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, color:'#3a3a5a', marginTop:8, textAlign:'center' }}>You can upload multiple screenshots for the project carousel</div>
            </div>

            {/* Settings */}
            <div style={card}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18 }}>Settings</div>
              <F t="Category">
                <select style={{...inp,cursor:'pointer'}} value={form.category} onChange={e=>set('category',e.target.value)} onFocus={fo} onBlur={fb}>
                  {CATS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </F>
              <F t="Status">
                <select style={{...inp,cursor:'pointer'}} value={form.status} onChange={e=>set('status',e.target.value)} onFocus={fo} onBlur={fb}>
                  {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </F>
              <F t="Priority (higher = appears first)">
                <input type="number" style={inp} value={form.priority} onChange={e=>set('priority',e.target.value)} onFocus={fo} onBlur={fb} />
              </F>
              {[['Published (visible on portfolio)','published'],['Featured (shown in hero section)','featured']].map(([label,key]) => (
                <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #111120' }}>
                  <span style={{ fontSize:13.5, color:'#8a8aaa' }}>{label}</span>
                  <input type="checkbox" checked={form[key]} onChange={e=>set(key,e.target.checked)} style={{ width:17, height:17, cursor:'pointer', accentColor:'#a78bfa' }} />
                </div>
              ))}
            </div>

            <button type="submit" disabled={saving} style={{ width:'100%', padding:12, background:saving?'#2e2a4a':'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:600, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit' }}>
              {saving ? 'Saving...' : isEdit ? '✓ Update Project' : '✓ Create Project'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
