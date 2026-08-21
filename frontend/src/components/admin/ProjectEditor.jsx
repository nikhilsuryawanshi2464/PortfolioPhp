import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '@services/api';
import toast from 'react-hot-toast';

const CATS = ['web','mobile','desktop','ai-ml','devops','other'];
const STATUSES = ['planning','in-progress','completed','archived'];

const Field = ({ label, error, children }) => (
  <div className="pe-field">
    <label className="pe-label">{label}</label>
    {children}
    {error && <span className="pe-error">{error}</span>}
  </div>
);

const AdminProjectEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', description: '', content: '', category: 'web', status: 'completed',
    technologies: '', tags: '', featured: false, published: false,
    links: { live: '', github: '', demo: '' },
    seo: { title: '', description: '' },
  });
  const [errors, setErrors] = useState({});
  const [techInput, setTechInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const { data: projectData, isLoading: loadingProject } = useQuery({
    queryKey: ['project-edit', id],
    queryFn: () => projectsAPI.getBySlug(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (projectData?.data?.data) {
      const p = projectData.data.data;
      setForm({
        title: p.title || '',
        description: p.description || '',
        content: p.content || '',
        category: p.category || 'web',
        status: p.status || 'completed',
        technologies: p.technologies?.join(', ') || '',
        tags: p.tags?.join(', ') || '',
        featured: p.featured || false,
        published: p.published || false,
        links: { live: p.links?.live || '', github: p.links?.github || '', demo: p.links?.demo || '' },
        seo: { title: p.seo?.title || '', description: p.seo?.description || '' },
      });
    }
  }, [projectData]);

  const saveMut = useMutation({
    mutationFn: (data) => isEdit ? projectsAPI.update(id, data) : projectsAPI.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Project updated!' : 'Project created!');
      queryClient.invalidateQueries(['admin-projects']);
      navigate('/admin/projects');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Save failed');
    },
  });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (published) => {
    if (!validate()) return;
    const payload = {
      ...form,
      technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      published,
    };
    saveMut.mutate(payload);
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setLink = (k, v) => setForm(f => ({ ...f, links: { ...f.links, [k]: v } }));
  const setSeo = (k, v) => setForm(f => ({ ...f, seo: { ...f.seo, [k]: v } }));

  if (isEdit && loadingProject) {
    return <div style={{textAlign:'center',padding:'60px',color:'#4a4a6a'}}>Loading project…</div>;
  }

  return (
    <>
      <style>{`
        .pe-page{display:flex;flex-direction:column;gap:24px;max-width:900px}
        .pe-topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
        .pe-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#e8e6f0}
        .pe-back{display:flex;align-items:center;gap:6px;font-size:13px;color:#6b6b8a;text-decoration:none;transition:color .2s}
        .pe-back:hover{color:#c4b5fd}
        .pe-actions{display:flex;gap:10px}
        .pe-btn{padding:9px 18px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all .2s}
        .pe-btn-save{background:#1e1a3a;color:#a78bfa}
        .pe-btn-save:hover{background:#2e2a4a}
        .pe-btn-pub{background:linear-gradient(135deg,#a78bfa,#60a5fa);color:white}
        .pe-btn-pub:hover{opacity:.85}
        .pe-btn:disabled{opacity:.5;cursor:not-allowed}
        .pe-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .pe-full{grid-column:1/-1}
        .pe-section{background:#0f0f1a;border:1px solid #1e1e2e;border-radius:14px;padding:24px;display:flex;flex-direction:column;gap:18px}
        .pe-section-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#c4b5fd;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
        .pe-field{display:flex;flex-direction:column;gap:6px}
        .pe-label{font-size:12px;font-weight:600;color:#6b6b8a;text-transform:uppercase;letter-spacing:.8px}
        .pe-input{background:#0a0a0f;border:1px solid #1e1e2e;border-radius:8px;padding:10px 14px;color:#e8e6f0;font-size:14px;outline:none;transition:border-color .2s;font-family:'DM Sans',sans-serif;width:100%;box-sizing:border-box}
        .pe-input:focus{border-color:#a78bfa}
        .pe-input::placeholder{color:#2a2a4a}
        textarea.pe-input{resize:vertical;min-height:100px}
        .pe-error{font-size:11px;color:#f87171}
        .pe-select{background:#0a0a0f;border:1px solid #1e1e2e;border-radius:8px;padding:10px 14px;color:#e8e6f0;font-size:14px;outline:none;cursor:pointer;width:100%}
        .pe-select:focus{border-color:#a78bfa}
        .pe-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #1a1a2a}
        .pe-toggle-row:last-child{border-bottom:none;padding-bottom:0}
        .pe-toggle-label{font-size:13px;color:#c4b5fd;font-weight:500}
        .pe-toggle-sub{font-size:11px;color:#4a4a6a;margin-top:2px}
        .pe-toggle{position:relative;width:42px;height:24px;flex-shrink:0}
        .pe-toggle input{opacity:0;width:0;height:0;position:absolute}
        .pe-toggle-slider{position:absolute;inset:0;background:#1e1e2e;border-radius:24px;cursor:pointer;transition:.3s}
        .pe-toggle-slider:before{content:'';position:absolute;width:18px;height:18px;left:3px;bottom:3px;background:#4a4a6a;border-radius:50%;transition:.3s}
        .pe-toggle input:checked+.pe-toggle-slider{background:#a78bfa}
        .pe-toggle input:checked+.pe-toggle-slider:before{transform:translateX(18px);background:white}
        .pe-char{font-size:11px;color:#3a3a5a;text-align:right;margin-top:2px}
      `}</style>

      <div className="pe-page">
        <div className="pe-topbar">
          <div>
            <a href="#" className="pe-back" onClick={e=>{e.preventDefault();navigate('/admin/projects')}}>
              ← Back to Projects
            </a>
            <div className="pe-title">{isEdit ? 'Edit Project' : 'New Project'}</div>
          </div>
          <div className="pe-actions">
            <button className="pe-btn pe-btn-save" onClick={() => handleSubmit(false)} disabled={saveMut.isPending}>
              Save Draft
            </button>
            <button className="pe-btn pe-btn-pub" onClick={() => handleSubmit(true)} disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Main Info */}
        <div className="pe-section">
          <div className="pe-section-title">Project Details</div>
          <div className="pe-grid">
            <Field label="Title *" error={errors.title}>
              <input className="pe-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="My Awesome Project" />
            </Field>
            <Field label="Category">
              <select className="pe-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <div className="pe-full">
              <Field label="Description * (max 500 chars)" error={errors.description}>
                <textarea className="pe-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="A brief description of your project…" maxLength={500} />
                <div className="pe-char">{form.description.length}/500</div>
              </Field>
            </div>
            <div className="pe-full">
              <Field label="Content / Case Study *" error={errors.content}>
                <textarea className="pe-input" rows={8} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Full project description, markdown supported…" />
              </Field>
            </div>
            <Field label="Status">
              <select className="pe-select" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Technologies (comma separated)">
              <input className="pe-input" value={form.technologies} onChange={e => set('technologies', e.target.value)} placeholder="React, Node.js, MongoDB…" />
            </Field>
            <Field label="Tags (comma separated)">
              <input className="pe-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="fullstack, saas, open-source…" />
            </Field>
          </div>
        </div>

        {/* Links */}
        <div className="pe-section">
          <div className="pe-section-title">Links</div>
          <div className="pe-grid">
            <Field label="Live URL"><input className="pe-input" value={form.links.live} onChange={e => setLink('live', e.target.value)} placeholder="https://myproject.com" /></Field>
            <Field label="GitHub URL"><input className="pe-input" value={form.links.github} onChange={e => setLink('github', e.target.value)} placeholder="https://github.com/…" /></Field>
            <Field label="Demo URL"><input className="pe-input" value={form.links.demo} onChange={e => setLink('demo', e.target.value)} placeholder="https://demo.myproject.com" /></Field>
          </div>
        </div>

        {/* SEO */}
        <div className="pe-section">
          <div className="pe-section-title">SEO</div>
          <div className="pe-grid">
            <Field label="SEO Title"><input className="pe-input" value={form.seo.title} onChange={e => setSeo('title', e.target.value)} placeholder="Override page title…" /></Field>
            <div className="pe-full">
              <Field label="SEO Description"><textarea className="pe-input" rows={2} value={form.seo.description} onChange={e => setSeo('description', e.target.value)} placeholder="Meta description for search engines…" maxLength={160} /></Field>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="pe-section">
          <div className="pe-section-title">Options</div>
          <div className="pe-toggle-row">
            <div>
              <div className="pe-toggle-label">Featured Project</div>
              <div className="pe-toggle-sub">Shows in the featured section on your homepage</div>
            </div>
            <label className="pe-toggle">
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              <span className="pe-toggle-slider" />
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
export default AdminProjectEditor;
