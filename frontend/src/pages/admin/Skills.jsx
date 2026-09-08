import { useState, useEffect, useRef } from 'react';
import { skillsAPI } from '@services/api';
import api from '@services/api';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CATEGORIES = ['frontend', 'backend', 'database', 'devops', 'tools', 'soft-skills', 'other'];
const inp = {
  width: '100%', background: '#1a1a2e', border: '1px solid #2e2a4a',
  borderRadius: 8, padding: '9px 12px', color: '#e8e6f0', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};
const fo = e => e.target.style.borderColor = '#a78bfa';
const fb = e => e.target.style.borderColor = '#2e2a4a';

const empty = { name: '', category: 'frontend', proficiency: 50, color: '#3b82f6', yearsOfExperience: 0, description: '', visible: true, iconUrl: '' };

const QUICK_LOGOS = [
  { name: 'React',      url: 'https://cdn.simpleicons.org/react/61DAFB' },
  { name: 'Node.js',    url: 'https://cdn.simpleicons.org/nodedotjs/339933' },
  { name: 'JavaScript', url: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
  { name: 'TypeScript', url: 'https://cdn.simpleicons.org/typescript/3178C6' },
  { name: 'Python',     url: 'https://cdn.simpleicons.org/python/3776AB' },
  { name: 'MongoDB',    url: 'https://cdn.simpleicons.org/mongodb/47A248' },
  { name: 'PostgreSQL', url: 'https://cdn.simpleicons.org/postgresql/4169E1' },
  { name: 'MySQL',      url: 'https://cdn.simpleicons.org/mysql/4479A1' },
  { name: 'Docker',     url: 'https://cdn.simpleicons.org/docker/2496ED' },
  { name: 'AWS',        url: 'https://cdn.simpleicons.org/amazonwebservices/FF9900' },
  { name: 'Git',        url: 'https://cdn.simpleicons.org/git/F05032' },
  { name: 'GitHub',     url: 'https://cdn.simpleicons.org/github/ffffff' },
  { name: 'Vue.js',     url: 'https://cdn.simpleicons.org/vuedotjs/4FC08D' },
  { name: 'Angular',    url: 'https://cdn.simpleicons.org/angular/DD0031' },
  { name: 'Next.js',    url: 'https://cdn.simpleicons.org/nextdotjs/ffffff' },
  { name: 'Tailwind',   url: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
  { name: 'Laravel',    url: 'https://cdn.simpleicons.org/laravel/FF2D20' },
  { name: 'Express',    url: 'https://cdn.simpleicons.org/express/ffffff' },
  { name: 'Redis',      url: 'https://cdn.simpleicons.org/redis/DC382D' },
  { name: 'Kubernetes', url: 'https://cdn.simpleicons.org/kubernetes/326CE5' },
  { name: 'Linux',      url: 'https://cdn.simpleicons.org/linux/FCC624' },
  { name: 'GraphQL',    url: 'https://cdn.simpleicons.org/graphql/E10098' },
  { name: 'Firebase',   url: 'https://cdn.simpleicons.org/firebase/FFCA28' },
  { name: 'Figma',      url: 'https://cdn.simpleicons.org/figma/F24E1E' },
  { name: 'Shopify',    url: 'https://cdn.simpleicons.org/shopify/96BF48' },
  { name: 'Vercel',     url: 'https://cdn.simpleicons.org/vercel/ffffff' },
  { name: 'Vite',       url: 'https://cdn.simpleicons.org/vite/646CFF' },
  { name: 'JWT',        url: 'https://cdn.simpleicons.org/jsonwebtokens/ffffff' },
  { name: 'CI/CD',      url: 'https://cdn.simpleicons.org/githubactions/2088FF' },
  { name: 'Postman',    url: 'https://cdn.simpleicons.org/postman/FF6C37' },
];

export default function AdminSkills() {
  const [skills, setSkills]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(empty);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(null);
  const [uploadingIconDark, setUploadingIconDark] = useState(null);
  const [savingForm, setSavingForm] = useState(false);
  const [showLogoSearch, setShowLogoSearch] = useState(false);
  const [logoSearch, setLogoSearch] = useState('');
  const fileRefs     = useRef({});
  const fileDarkRefs = useRef({});

  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = skills.findIndex(s => s._id === active.id);
      const newIndex = skills.findIndex(s => s._id === over.id);
      const newSkills = arrayMove(skills, oldIndex, newIndex);
      setSkills(newSkills);
      
      try {
        await skillsAPI.reorder({ skillIds: newSkills.map(s => s._id) });
        toast.success('Order saved');
      } catch {
        toast.error('Failed to save order');
        fetchSkills(); // revert
      }
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await skillsAPI.getAll();
      setSkills(res.data.data || []);
    } catch { toast.error('Failed to load skills'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSkills(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingForm(true);
    const { iconUrl, ...payload } = form;
    try {
      if (editId) {
        await skillsAPI.update(editId, payload);
        toast.success('Skill updated!');
      } else {
        await skillsAPI.create(payload);
        toast.success('Skill created!');
      }
      setForm(empty); setEditId(null); setShowForm(false);
      fetchSkills();
    } catch (err) { toast.error(err.response?.data?.error || 'Error saving skill'); }
    setSavingForm(false);
  };

  const handleEdit = (skill) => {
    setForm({
      name: skill.name, category: skill.category, proficiency: skill.proficiency,
      color: skill.color || '#3b82f6', yearsOfExperience: skill.yearsOfExperience || 0,
      description: skill.description || '', visible: skill.visible,
      iconUrl: skill.icon?.url || '',
    });
    setEditId(skill._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try { await skillsAPI.delete(id); toast.success('Deleted!'); fetchSkills(); }
    catch { toast.error('Failed to delete'); }
  };

  // Upload LIGHT icon
  const handleIconUpload = async (skillId, file) => {
    if (!file) return;
    setUploadingIcon(skillId);
    try {
      const fd = new FormData();
      fd.append('icon', file);
      const r = await api.post(`/skills/${skillId}/icon`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSkills(prev => prev.map(s => s._id === skillId ? { ...s, icon: r.data.data.icon } : s));
      toast.success('Light icon uploaded!');
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed'); }
    setUploadingIcon(null);
  };

  // Upload DARK icon
  const handleIconDarkUpload = async (skillId, file) => {
    if (!file) return;
    setUploadingIconDark(skillId);
    try {
      const fd = new FormData();
      fd.append('icon', file);
      const r = await api.post(`/skills/${skillId}/icon-dark`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSkills(prev => prev.map(s => s._id === skillId ? { ...s, iconDark: r.data.data.iconDark } : s));
      toast.success('Dark icon uploaded!');
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed'); }
    setUploadingIconDark(null);
  };

  // Set icon from URL
  const handleIconUrl = async (skillId, url) => {
    try {
      const r = await skillsAPI.update(skillId, { icon: { url, publicId: '' } });
      setSkills(prev => prev.map(s => s._id === skillId ? r.data.data : s));
      toast.success('Icon set!');
    } catch { toast.error('Failed to set icon'); }
  };

  // Remove LIGHT icon
  const handleIconDelete = async (skillId) => {
    try {
      await api.delete(`/skills/${skillId}/icon`);
      setSkills(prev => prev.map(s => s._id === skillId ? { ...s, icon: { url: '', publicId: '' } } : s));
      toast.success('Light icon removed');
    } catch { toast.error('Failed to remove icon'); }
  };

  // Remove DARK icon
  const handleIconDarkDelete = async (skillId) => {
    try {
      await api.delete(`/skills/${skillId}/icon-dark`);
      setSkills(prev => prev.map(s => s._id === skillId ? { ...s, iconDark: { url: '', publicId: '' } } : s));
      toast.success('Dark icon removed');
    } catch { toast.error('Failed to remove dark icon'); }
  };

  const filteredLogos = QUICK_LOGOS.filter(l =>
    !logoSearch || l.name.toLowerCase().includes(logoSearch.toLowerCase())
  );

  return (
    <div style={{ color: '#e8e6f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap'); .sk-inp:focus{border-color:#a78bfa!important;outline:none}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Skills</div>
          <div style={{ fontSize: 13, color: '#4a4a6a', marginTop: 3 }}>Upload separate icons for light & dark mode</div>
        </div>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}
          style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
          {showForm && !editId ? '✕ Cancel' : '+ Add Skill'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: '#0f0f1a', border: '1px solid #2e2a4a', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px', color: '#3a3a5a', marginBottom: 18 }}>
            {editId ? 'Edit Skill' : 'New Skill'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="adm-grid-2" style={{ gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6b6b8a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Skill Name *</label>
                <input className="sk-inp" style={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. React" required onFocus={fo} onBlur={fb} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b6b8a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Years of Experience</label>
                <input className="sk-inp" type="number" style={inp} value={form.yearsOfExperience} onChange={e => set('yearsOfExperience', e.target.value)} min="0" onFocus={fo} onBlur={fb} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b6b8a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Category</label>
                <select className="sk-inp" style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)} onFocus={fo} onBlur={fb}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b6b8a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Proficiency: {form.proficiency}%</label>
                <input type="range" min="0" max="100" value={form.proficiency}
                  onChange={e => set('proficiency', Number(e.target.value))}
                  style={{ width: '100%', accentColor: form.color, marginTop: 8 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b6b8a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                    style={{ width: 44, height: 38, background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, cursor: 'pointer', padding: '3px' }} />
                  <input className="sk-inp" style={{ ...inp, flex: 1 }} value={form.color} onChange={e => set('color', e.target.value)} onFocus={fo} onBlur={fb} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b6b8a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Visible</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 10 }}>
                  <input type="checkbox" checked={form.visible} onChange={e => set('visible', e.target.checked)} style={{ width: 17, height: 17, accentColor: '#a78bfa' }} />
                  <span style={{ fontSize: 13.5, color: '#8a8aaa' }}>Show on portfolio</span>
                </label>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, color: '#6b6b8a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Description (optional)</label>
                <textarea className="sk-inp" value={form.description} onChange={e => set('description', e.target.value)} rows={2}
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} onFocus={fo} onBlur={fb} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" disabled={savingForm}
                style={{ background: savingForm ? '#2e2a4a' : 'linear-gradient(135deg,#a78bfa,#60a5fa)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 10, cursor: savingForm ? 'not-allowed' : 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                {savingForm ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }}
                style={{ background: '#1a1a2e', border: '1px solid #2e2a4a', color: '#6b6b8a', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Logo Picker */}
      <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showLogoSearch ? 16 : 0 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd' }}>🎯 Quick Logo Picker</span>
            <span style={{ fontSize: 12, color: '#4a4a6a', marginLeft: 10 }}>Apply a logo URL to any skill's light icon</span>
          </div>
          <button onClick={() => setShowLogoSearch(!showLogoSearch)}
            style={{ fontSize: 12, padding: '5px 12px', background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 7, color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit' }}>
            {showLogoSearch ? 'Hide' : 'Show Logos'}
          </button>
        </div>
        {showLogoSearch && (
          <>
            <input style={{ ...inp, marginBottom: 12 }} placeholder="Search logo... (React, Node, Docker...)"
              value={logoSearch} onChange={e => setLogoSearch(e.target.value)} className="sk-inp" onFocus={fo} onBlur={fb} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
              {filteredLogos.map(logo => (
                <div key={logo.name} style={{ textAlign: 'center', cursor: 'pointer', padding: '8px 10px', background: '#111120', borderRadius: 10, border: '1px solid #1e1e2e', minWidth: 70, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.background = '#1a1630'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.background = '#111120'; }}
                  title={`Apply ${logo.name} logo`}>
                  <img src={logo.url} alt={logo.name} style={{ width: 28, height: 28, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }}
                    onError={e => e.target.style.display = 'none'} />
                  <div style={{ fontSize: 10, color: '#6a6a8a', whiteSpace: 'nowrap' }}>{logo.name}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 220, background: '#0f0f1a', borderRadius: 14 }} />)}
        </div>
      ) : skills.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#4a4a6a' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 15, color: '#6a6a8a' }}>No skills yet. Add your first skill!</div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={skills.map(s => String(s._id))} strategy={rectSortingStrategy}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {skills.map(skill => (
                <SkillCard
                  key={skill._id}
                  skill={skill}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onIconUpload={handleIconUpload}
                  onIconDarkUpload={handleIconDarkUpload}
                  onIconUrl={handleIconUrl}
                  onIconDelete={handleIconDelete}
                  onIconDarkDelete={handleIconDarkDelete}
                  uploading={uploadingIcon === skill._id}
                  uploadingDark={uploadingIconDark === skill._id}
                  fileRefs={fileRefs}
                  fileDarkRefs={fileDarkRefs}
                  quickLogos={QUICK_LOGOS}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SkillCard({
  skill, onEdit, onDelete,
  onIconUpload, onIconDarkUpload,
  onIconUrl, onIconDelete, onIconDarkDelete,
  uploading, uploadingDark,
  fileRefs, fileDarkRefs, quickLogos,
}) {
  const [showUrlInput, setShowUrlInput]       = useState(false);
  const [urlVal, setUrlVal]                   = useState('');
  const [showLogoPicker, setShowLogoPicker]   = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(skill._id) });
  const style = {
    background: isDragging ? '#1a1a2e' : '#0f0f1a', 
    border: '1px solid #1e1e2e', borderRadius: 14, padding: 20, position: 'relative', 
    transition: transition || 'border-color 0.2s',
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 10 : 1,
  };

  const lightInputId = `icon-file-${skill._id}`;
  const darkInputId  = `icon-dark-file-${skill._id}`;

  return (
    <div ref={setNodeRef} style={style}
      onMouseEnter={e => { if(!isDragging) e.currentTarget.style.borderColor = '#2e2a4a' }}
      onMouseLeave={e => { if(!isDragging) e.currentTarget.style.borderColor = '#1e1e2e' }}>
      
      <div {...attributes} {...listeners} style={{ position: 'absolute', top: 15, right: 15, cursor: 'grab', color: '#6a6a8a', fontSize: 16, touchAction: 'none' }}>☰</div>

      {/* Skill name + meta */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#e8e6f0', marginBottom: 2 }}>{skill.name}</div>
        <div style={{ fontSize: 12, color: '#6b6b8a', marginBottom: 6 }}>{skill.category} • {skill.yearsOfExperience}yr</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b6b8a', marginBottom: 4 }}>
          <span>Proficiency</span><span style={{ color: skill.color }}>{skill.proficiency}%</span>
        </div>
        <div style={{ background: '#1a1a2e', borderRadius: 4, height: 5 }}>
          <div style={{ background: skill.color, height: 5, borderRadius: 4, width: `${skill.proficiency}%`, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* ── ICON UPLOAD ROW ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>

        {/* Light mode icon */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#4a4a6a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
            ☀️ Light Icon
          </div>
          <input id={lightInputId} type="file" accept="image/*" style={{ display: 'none' }}
            ref={el => fileRefs.current[skill._id] = el}
            onChange={e => { const f = e.target.files[0]; if (f) onIconUpload(skill._id, f); e.target.value = ''; }} />
          <label htmlFor={lightInputId} style={{ display: 'block', cursor: 'pointer' }} title="Upload light mode icon">
            <div style={{
              width: '100%', height: 64, borderRadius: 10,
              background: uploading ? '#1a1630' : '#f1f5f9',  /* light bg to preview light icons */
              border: `2px dashed ${skill.icon?.url ? skill.color || '#2e2a4a' : '#cbd5e1'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', transition: 'all 0.2s', position: 'relative',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.borderColor = skill.icon?.url ? skill.color || '#2e2a4a' : '#cbd5e1'}>
              {uploading ? (
                <span style={{ fontSize: 10, color: '#a78bfa' }}>Uploading...</span>
              ) : skill.icon?.url ? (
                <img src={skill.icon.url} alt="light" style={{ width: 40, height: 40, objectFit: 'contain' }}
                  onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <span style={{ fontSize: 11, color: '#94a3b8' }}>+ Upload</span>
              )}
            </div>
          </label>
          {skill.icon?.url && (
            <button onClick={() => onIconDelete(skill._id)}
              style={{ marginTop: 4, fontSize: 10, padding: '2px 8px', background: '#1f1520', border: 'none', borderRadius: 5, color: '#f87171', cursor: 'pointer', fontFamily: 'inherit' }}>
              Remove
            </button>
          )}
        </div>

        {/* Dark mode icon */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#4a4a6a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
            🌙 Dark Icon
          </div>
          <input id={darkInputId} type="file" accept="image/*" style={{ display: 'none' }}
            ref={el => fileDarkRefs.current[skill._id] = el}
            onChange={e => { const f = e.target.files[0]; if (f) onIconDarkUpload(skill._id, f); e.target.value = ''; }} />
          <label htmlFor={darkInputId} style={{ display: 'block', cursor: 'pointer' }} title="Upload dark mode icon">
            <div style={{
              width: '100%', height: 64, borderRadius: 10,
              background: uploadingDark ? '#1a1630' : '#1e293b',  /* dark bg to preview dark icons */
              border: `2px dashed ${skill.iconDark?.url ? skill.color || '#2e2a4a' : '#334155'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', transition: 'all 0.2s', position: 'relative',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.borderColor = skill.iconDark?.url ? skill.color || '#2e2a4a' : '#334155'}>
              {uploadingDark ? (
                <span style={{ fontSize: 10, color: '#a78bfa' }}>Uploading...</span>
              ) : skill.iconDark?.url ? (
                <img src={skill.iconDark.url} alt="dark" style={{ width: 40, height: 40, objectFit: 'contain' }}
                  onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <span style={{ fontSize: 11, color: '#475569' }}>+ Upload</span>
              )}
            </div>
          </label>
          {skill.iconDark?.url && (
            <button onClick={() => onIconDarkDelete(skill._id)}
              style={{ marginTop: 4, fontSize: 10, padding: '2px 8px', background: '#1f1520', border: 'none', borderRadius: 5, color: '#f87171', cursor: 'pointer', fontFamily: 'inherit' }}>
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Tip if only one icon is set */}
      {(skill.icon?.url && !skill.iconDark?.url) && (
        <div style={{ fontSize: 10, color: '#a78bfa', background: '#1a1630', borderRadius: 7, padding: '5px 10px', marginBottom: 10 }}>
          💡 No dark icon set — light icon will be used in both modes
        </div>
      )}
      {(!skill.icon?.url && skill.iconDark?.url) && (
        <div style={{ fontSize: 10, color: '#60a5fa', background: '#0d1f2a', borderRadius: 7, padding: '5px 10px', marginBottom: 10 }}>
          💡 No light icon set — dark icon will be used in both modes
        </div>
      )}

      {/* Icon management buttons */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => { setShowLogoPicker(!showLogoPicker); setShowUrlInput(false); }}
          style={{ padding: '4px 9px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer', background: '#1c1830', color: '#a78bfa', fontFamily: 'inherit' }}>
          🎨 Quick Logo
        </button>
        <button onClick={() => { setShowUrlInput(!showUrlInput); setShowLogoPicker(false); setUrlVal(skill.icon?.url || ''); }}
          style={{ padding: '4px 9px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer', background: '#0d1f2a', color: '#60a5fa', fontFamily: 'inherit' }}>
          🔗 Set URL
        </button>
      </div>

      {/* Quick logo picker */}
      {showLogoPicker && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: '#4a4a6a', marginBottom: 6 }}>Sets as light icon URL</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto', padding: '4px 0' }}>
            {quickLogos.map(logo => (
              <div key={logo.name} onClick={() => { onIconUrl(skill._id, logo.url); setShowLogoPicker(false); }}
                style={{ cursor: 'pointer', padding: '5px 8px', background: '#111120', borderRadius: 8, border: '1px solid #1e1e2e', textAlign: 'center', minWidth: 52, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.background = '#1a1630'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.background = '#111120'; }}
                title={logo.name}>
                <img src={logo.url} alt={logo.name} style={{ width: 22, height: 22, objectFit: 'contain', display: 'block', margin: '0 auto 2px' }}
                  onError={e => e.target.style.display = 'none'} />
                <div style={{ fontSize: 9, color: '#5a5a7a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 48 }}>{logo.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL input */}
      {showUrlInput && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 6 }}>
          <input
            style={{ flex: 1, background: '#111120', border: '1px solid #2e2a4a', borderRadius: 7, padding: '7px 10px', color: '#e8e6f0', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            value={urlVal} onChange={e => setUrlVal(e.target.value)}
            placeholder="https://cdn.simpleicons.org/react/61DAFB"
            onFocus={fo} onBlur={fb}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onIconUrl(skill._id, urlVal); setShowUrlInput(false); } }}
          />
          <button onClick={() => { onIconUrl(skill._id, urlVal); setShowUrlInput(false); }}
            style={{ padding: '7px 12px', borderRadius: 7, fontSize: 12, border: 'none', cursor: 'pointer', background: '#a78bfa', color: '#fff', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            Apply
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onEdit(skill)}
          style={{ flex: 1, background: '#1a1a2e', border: '1px solid #2e2a4a', color: '#a78bfa', padding: '7px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
          Edit
        </button>
        <button onClick={() => onDelete(skill._id)}
          style={{ flex: 1, background: '#1f1520', border: '1px solid #2e1a2e', color: '#f87171', padding: '7px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
          Delete
        </button>
      </div>
    </div>
  );
}
