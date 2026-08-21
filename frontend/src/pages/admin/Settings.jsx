// PATH: frontend/src/pages/admin/Settings.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import api from '@services/api';
import toast from 'react-hot-toast';

// ── shared styles ─────────────────────────────────────────────
const inp = {
  width:'100%', padding:'10px 13px', background:'#111120',
  border:'1px solid #2e2a4a', borderRadius:8, color:'#e8e6f0',
  fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box',
};
const fo  = e => e.target.style.borderColor = '#a78bfa';
const fb  = e => e.target.style.borderColor = '#2e2a4a';
const Lbl = ({ t }) => <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'1.5px', color:'#4a4a6a', marginBottom:7 }}>{t}</label>;
const F   = ({ label, children }) => <div style={{ marginBottom:16 }}><Lbl t={label} />{children}</div>;

const card  = { background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:14, padding:'22px 24px', marginBottom:18 };
const cHead = (emoji, title) => (
  <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
    <span>{emoji}</span> {title}
  </div>
);

const Toggle = ({ label, sub, checked, onChange }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid #111120' }}>
    <div><div style={{ fontSize:13.5, color:'#8a8aaa' }}>{label}</div>{sub && <div style={{ fontSize:11, color:'#4a4a6a', marginTop:2 }}>{sub}</div>}</div>
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{ width:18, height:18, cursor:'pointer', accentColor:'#a78bfa', flexShrink:0 }} />
  </div>
);

const SaveBtn = ({ saving, label='Save Changes' }) => (
  <button type="submit" disabled={saving}
    style={{ padding:'10px 24px', background:saving?'#2e2a4a':'linear-gradient(135deg,#a78bfa,#60a5fa)', border:'none', borderRadius:9, color:'#fff', fontSize:14, fontWeight:600, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', marginTop:4 }}>
    {saving ? 'Saving...' : `✓ ${label}`}
  </button>
);

const ACCENT_PRESETS = [
  { name:'Indigo',  a:'#6366f1', b:'#8b5cf6' },
  { name:'Blue',    a:'#3b82f6', b:'#06b6d4' },
  { name:'Rose',    a:'#f43f5e', b:'#ec4899' },
  { name:'Emerald', a:'#10b981', b:'#06b6d4' },
  { name:'Amber',   a:'#f59e0b', b:'#ef4444' },
  { name:'Purple',  a:'#a855f7', b:'#ec4899' },
  { name:'Slate',   a:'#64748b', b:'#475569' },
];

const DEFAULT_NAV_LINKS = [
  { label:'Home',       path:'/',           visible:true, order:0 },
  { label:'Projects',   path:'/projects',   visible:true, order:1 },
  { label:'Blog',       path:'/blog',       visible:true, order:2 },
  { label:'Experience', path:'/experience', visible:true, order:3 },
  { label:'About',      path:'/about',      visible:true, order:4 },
  { label:'Contact',    path:'/contact',    visible:true, order:5 },
];

const TABS = ['General','Navigation','SEO','Theme','Email','GitHub','Deploy','Password'];

export default function AdminSettings() {
  const { user, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  // Password state
  const [pw, setPw]       = useState({ current:'', newPw:'', confirm:'' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // GitHub state
  const [repos, setRepos]                 = useState([]);
  const [repoLoading, setRepoLoading]     = useState(false);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [syncing, setSyncing]             = useState(false);

  // Email test
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    api.get('/site-settings')
      .then(r => {
        const data = r.data?.data || {};
        // Ensure navLinks has defaults if empty
        if (!data.navLinks || data.navLinks.length === 0) {
          data.navLinks = DEFAULT_NAV_LINKS;
        }
        setSettings(data);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const setSett = (path, value) => {
    setSettings(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let cur = next;
      keys.slice(0,-1).forEach(k => { cur[k] = { ...cur[k] }; cur = cur[k]; });
      cur[keys[keys.length-1]] = value;
      return next;
    });
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      let payload = {};
      if (section === 'general') {
        const {
          siteName, ownerName, tagline, bio, availableForWork,
          contactEmail, phone, location, social,
          logoText, showHireBtn, hireBtnLabel, calendlyUrl, footerText,
        } = settings;
        payload = {
          siteName, ownerName, tagline, bio, availableForWork,
          contactEmail, phone, location, social,
          logoText, showHireBtn, hireBtnLabel, calendlyUrl, footerText,
        };
      } else if (section === 'navigation') {
        payload = { navLinks: settings.navLinks };
      } else if (section === 'seo') {
        payload = { seo: settings.seo };
      } else if (section === 'theme') {
        payload = { theme: settings.theme };
      } else if (section === 'emailNotifications') {
        payload = { emailNotifications: settings.emailNotifications };
      } else if (section === 'github') {
        payload = { github: settings.github };
      } else {
        payload = settings;
      }
      const r = await api.put('/site-settings', payload);
      setSettings(prev => ({ ...prev, ...r.data?.data }));
      toast.success('Settings saved!');
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault(); setPwMsg(''); setPwErr('');
    if (pw.newPw !== pw.confirm) { setPwErr('Passwords do not match'); return; }
    if (pw.newPw.length < 6)     { setPwErr('Min 6 characters'); return; }
    setPwSaving(true);
    const r = await updatePassword({ currentPassword: pw.current, newPassword: pw.newPw });
    if (r?.success) { setPwMsg('Password updated!'); setPw({ current:'', newPw:'', confirm:'' }); }
    else setPwErr(r?.error || 'Failed');
    setPwSaving(false);
  };

  const fetchRepos = async () => {
    setRepoLoading(true);
    try {
      const r = await api.get('/site-settings/github/repos');
      setRepos(r.data?.data || []);
      toast.success(`Found ${r.data?.count} repos`);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to fetch repos'); }
    setRepoLoading(false);
  };

  const handleSync = async () => {
    if (!selectedRepos.length) { toast.error('Select at least one repo'); return; }
    setSyncing(true);
    try {
      const toSync = repos.filter(r => selectedRepos.includes(r.id));
      const r = await api.post('/site-settings/github/sync', { repos: toSync });
      const created = r.data?.synced || 0;
      toast.success(`${created} project${created!==1?'s':''} created! Check Admin → Projects.`);
      setSelectedRepos([]);
    } catch (err) { toast.error(err.response?.data?.error || 'Sync failed'); }
    setSyncing(false);
  };

  const testEmail = async () => {
    setTestingEmail(true);
    try {
      const r = await api.post('/site-settings/test-email');
      toast.success(r.data?.message || 'Test email sent!');
    } catch (err) { toast.error(err.response?.data?.error || 'Email test failed'); }
    setTestingEmail(false);
  };

  // Nav link helpers
  const updateNavLink = (idx, field, value) => {
    setSettings(prev => {
      const links = [...(prev.navLinks || DEFAULT_NAV_LINKS)];
      links[idx] = { ...links[idx], [field]: value };
      return { ...prev, navLinks: links };
    });
  };
  const addNavLink = () => {
    setSettings(prev => ({
      ...prev,
      navLinks: [...(prev.navLinks || []), { label:'New Page', path:'/new', visible:true, order:(prev.navLinks||[]).length }],
    }));
  };
  const removeNavLink = (idx) => {
    setSettings(prev => ({ ...prev, navLinks: prev.navLinks.filter((_,i)=>i!==idx) }));
  };

  // Apply accent color preview live
  useEffect(() => {
    if (!settings?.theme) return;
    const root = document.documentElement;
    root.style.setProperty('--accent', settings.theme.accentColor || '#6366f1');
    root.style.setProperty('--accent-end', settings.theme.accentColorEnd || '#8b5cf6');
  }, [settings?.theme?.accentColor, settings?.theme?.accentColorEnd]);

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#4a4a6a' }}>Loading settings...</div>;

  const s = settings || {};

  return (
    <div style={{ color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap'); .si:focus{border-color:#a78bfa!important;outline:none}`}</style>

      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>Settings</div>
        <div style={{ fontSize:13, color:'#4a4a6a', marginTop:3 }}>Site-wide configuration, SEO, theme, email, and integrations</div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:24, flexWrap:'wrap', borderBottom:'1px solid #1e1e2e', paddingBottom:12 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:500, border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
              background: activeTab===t ? 'linear-gradient(135deg,#a78bfa,#60a5fa)' : '#111120',
              color: activeTab===t ? '#fff' : '#5a5a7a' }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── GENERAL ──────────────────────────────────────────── */}
      {activeTab === 'General' && (
        <form onSubmit={e=>{ e.preventDefault(); handleSave('general'); }}>

          {/* Site Information */}
          <div style={card}>
            {cHead('🌐','Site Information')}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <F label="Site Name"><input className="si" style={inp} value={s.siteName||''} onChange={e=>setSett('siteName',e.target.value)} placeholder="My Portfolio" onFocus={fo} onBlur={fb} /></F>
              <F label="Your Name"><input className="si" style={inp} value={s.ownerName||''} onChange={e=>setSett('ownerName',e.target.value)} placeholder="Nikhil Suryawanshi" onFocus={fo} onBlur={fb} /></F>
              <F label="Tagline / Headline"><input className="si" style={inp} value={s.tagline||''} onChange={e=>setSett('tagline',e.target.value)} placeholder="Full-Stack Developer" onFocus={fo} onBlur={fb} /></F>
              <F label="Contact Email (public)"><input className="si" style={inp} value={s.contactEmail||''} onChange={e=>setSett('contactEmail',e.target.value)} placeholder="hello@yoursite.com" onFocus={fo} onBlur={fb} /></F>
              <F label="Phone (optional)"><input className="si" style={inp} value={s.phone||''} onChange={e=>setSett('phone',e.target.value)} placeholder="+91 98765 43210" onFocus={fo} onBlur={fb} /></F>
              <F label="Location"><input className="si" style={inp} value={s.location||''} onChange={e=>setSett('location',e.target.value)} placeholder="Mumbai, India" onFocus={fo} onBlur={fb} /></F>
              <div style={{ gridColumn:'1/-1' }}>
                <F label="Bio (shown on About page)">
                  <textarea className="si" style={{...inp,minHeight:90,resize:'vertical',lineHeight:1.65}} value={s.bio||''} onChange={e=>setSett('bio',e.target.value)} placeholder="Write about yourself..." onFocus={fo} onBlur={fb} />
                </F>
              </div>
            </div>
            <Toggle label="Available for Work" sub="Shows green 'Open to Work' badge on your portfolio" checked={s.availableForWork!==false} onChange={v=>setSett('availableForWork',v)} />
          </div>

          {/* ── LOGO (NEW) ── */}
          <div style={card}>
            {cHead('✨','Logo Text — Header & Footer')}
            <div style={{ fontSize:13, color:'#6a6a8a', marginBottom:14, lineHeight:1.6 }}>
              Your logo is two parts: <strong style={{color:'#a78bfa'}}>Prefix</strong> (plain text) + <strong style={{color:'#60a5fa'}}>Suffix</strong> (colored text).
              Example: <strong style={{color:'#e8e6f0'}}>Nikhil</strong><strong style={{color:'#a78bfa'}}>.Portfolio</strong>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <F label="Logo Prefix (plain color)">
                <input className="si" style={inp} value={s.logoText?.prefix||'dev'} onChange={e=>setSett('logoText.prefix',e.target.value)} placeholder="Nikhil" onFocus={fo} onBlur={fb} />
              </F>
              <F label="Logo Suffix (accent color)">
                <input className="si" style={inp} value={s.logoText?.suffix||'.portfolio'} onChange={e=>setSett('logoText.suffix',e.target.value)} placeholder=".Portfolio" onFocus={fo} onBlur={fb} />
              </F>
            </div>
            {/* Live preview */}
            <div style={{ marginTop:8, padding:'12px 16px', background:'#111120', borderRadius:10, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12, color:'#4a4a6a', marginRight:8 }}>Preview:</span>
              <span style={{ fontWeight:900, fontSize:20, letterSpacing:'-0.5px', color:'#e8e6f0' }}>{s.logoText?.prefix||'dev'}</span>
              <span style={{ fontWeight:900, fontSize:20, letterSpacing:'-0.5px', color:'#a78bfa' }}>{s.logoText?.suffix||'.portfolio'}</span>
            </div>
          </div>

          {/* ── HIRE ME BUTTON (NEW) ── */}
          <div style={card}>
            {cHead('🎯','Hire Me Button — Navigation')}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <F label="Button Label">
                <input className="si" style={inp} value={s.hireBtnLabel||'Hire Me'} onChange={e=>setSett('hireBtnLabel',e.target.value)} placeholder="Hire Me" onFocus={fo} onBlur={fb} />
              </F>
              <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:22 }}>
                <Toggle label="Show Hire Me Button" sub="Displays in the top navigation" checked={s.showHireBtn!==false} onChange={v=>setSett('showHireBtn',v)} />
              </div>
            </div>
          </div>

          {/* ── CALENDLY (NEW) ── */}
          <div style={card}>
            {cHead('📅','Calendly Booking — Contact Page')}
            <div style={{ fontSize:13, color:'#6a6a8a', marginBottom:14, lineHeight:1.6 }}>
              Add your Calendly link to show a booking calendar on your Contact page. Leave empty to hide it.
            </div>
            <F label="Calendly URL">
              <input className="si" style={inp} value={s.calendlyUrl||''} onChange={e=>setSett('calendlyUrl',e.target.value)} placeholder="https://calendly.com/your-username" onFocus={fo} onBlur={fb} />
            </F>
          </div>

          {/* ── FOOTER TEXT (NEW) ── */}
          <div style={card}>
            {cHead('🦶','Footer Text')}
            <div style={{ fontSize:13, color:'#6a6a8a', marginBottom:14, lineHeight:1.6 }}>
              Use <code style={{color:'#60a5fa',background:'#1a1a2e',padding:'1px 5px',borderRadius:4}}>{'{year}'}</code> to auto-insert the current year.
            </div>
            <F label="Footer Copyright Text">
              <input className="si" style={inp} value={s.footerText||'© {year} · Built with React & ❤️'} onChange={e=>setSett('footerText',e.target.value)} placeholder="© {year} · Your Name" onFocus={fo} onBlur={fb} />
            </F>
            <div style={{ fontSize:12, color:'#4a4a6a', marginTop:-8 }}>
              Preview: {(s.footerText||'© {year} · Built with React & ❤️').replace('{year}', new Date().getFullYear())}
            </div>
          </div>

          {/* Social Links */}
          <div style={card}>
            {cHead('🔗','Social Links')}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[
                ['GitHub',      'github',   'https://github.com/yourusername'],
                ['LinkedIn',    'linkedin', 'https://linkedin.com/in/yourname'],
                ['Twitter / X', 'twitter',  'https://twitter.com/yourusername'],
                ['Website',     'website',  'https://yoursite.com'],
                ['Instagram',   'instagram','https://instagram.com/yourusername'],
                ['YouTube',     'youtube',  'https://youtube.com/@yourchannel'],
              ].map(([lbl,key,ph]) => (
                <F key={key} label={lbl}><input className="si" style={inp} value={s.social?.[key]||''} onChange={e=>setSett(`social.${key}`,e.target.value)} placeholder={ph} onFocus={fo} onBlur={fb} /></F>
              ))}
            </div>
          </div>

          <SaveBtn saving={saving} />
        </form>
      )}

      {/* ── NAVIGATION ───────────────────────────────────────── */}
      {activeTab === 'Navigation' && (
        <form onSubmit={e=>{ e.preventDefault(); handleSave('navigation'); }}>
          <div style={card}>
            {cHead('🗺️','Navigation Links')}
            <div style={{ fontSize:13, color:'#6a6a8a', marginBottom:18, lineHeight:1.6 }}>
              Control which pages appear in your site nav. Toggle visibility, change labels, or reorder. Changes are live instantly after saving.
            </div>

            {(s.navLinks || DEFAULT_NAV_LINKS).map((link, idx) => (
              <div key={idx} style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr auto auto', gap:10, alignItems:'center', padding:'12px 0', borderBottom:'1px solid #111120' }}>
                {/* Visible toggle */}
                <input type="checkbox" checked={link.visible!==false} onChange={e=>updateNavLink(idx,'visible',e.target.checked)}
                  style={{ width:16, height:16, cursor:'pointer', accentColor:'#a78bfa' }} title="Show in nav" />
                {/* Label */}
                <input className="si" style={{...inp, opacity: link.visible===false ? 0.4 : 1 }}
                  value={link.label} onChange={e=>updateNavLink(idx,'label',e.target.value)}
                  placeholder="Label" onFocus={fo} onBlur={fb} />
                {/* Path */}
                <input className="si" style={{...inp, opacity: link.visible===false ? 0.4 : 1 }}
                  value={link.path} onChange={e=>updateNavLink(idx,'path',e.target.value)}
                  placeholder="/path" onFocus={fo} onBlur={fb} />
                {/* Order */}
                <input type="number" className="si" style={{...inp, width:60 }}
                  value={link.order??idx} onChange={e=>updateNavLink(idx,'order',Number(e.target.value))}
                  onFocus={fo} onBlur={fb} title="Order (lower = first)" />
                {/* Delete */}
                <button type="button" onClick={()=>removeNavLink(idx)}
                  style={{ padding:'8px 12px', background:'#1a1a2e', border:'1px solid #3a1a25', borderRadius:8, color:'#f87171', cursor:'pointer', fontSize:14, fontFamily:'inherit' }}
                  title="Remove">✕</button>
              </div>
            ))}

            {/* Column headers */}
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr auto auto', gap:10, marginBottom:12, marginTop:12 }}>
              <span style={{ fontSize:10, color:'#3a3a5a', textTransform:'uppercase', letterSpacing:'1px' }}>Show</span>
              <span style={{ fontSize:10, color:'#3a3a5a', textTransform:'uppercase', letterSpacing:'1px' }}>Label</span>
              <span style={{ fontSize:10, color:'#3a3a5a', textTransform:'uppercase', letterSpacing:'1px' }}>Path</span>
              <span style={{ fontSize:10, color:'#3a3a5a', textTransform:'uppercase', letterSpacing:'1px' }}>Order</span>
              <span />
            </div>

            <button type="button" onClick={addNavLink}
              style={{ padding:'9px 18px', background:'#1a1a2e', border:'1px dashed #2e2a4a', borderRadius:9, color:'#a78bfa', fontSize:13, cursor:'pointer', fontFamily:'inherit', marginTop:8 }}>
              + Add Nav Link
            </button>

            <div style={{ marginTop:18, padding:'12px 16px', background:'#111120', borderRadius:10 }}>
              <div style={{ fontSize:11, color:'#4a4a6a', marginBottom:8, textTransform:'uppercase', letterSpacing:'1px' }}>Preview</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {(s.navLinks||DEFAULT_NAV_LINKS).filter(l=>l.visible!==false).sort((a,b)=>(a.order??0)-(b.order??0)).map((l,i) => (
                  <span key={i} style={{ padding:'5px 14px', background:'#1a1a2e', borderRadius:6, fontSize:13, color:'#c4b5fd' }}>{l.label}</span>
                ))}
                {s.showHireBtn!==false && (
                  <span style={{ padding:'5px 14px', background:'linear-gradient(135deg,#a78bfa,#60a5fa)', borderRadius:6, fontSize:13, color:'#fff', fontWeight:600 }}>
                    {s.hireBtnLabel||'Hire Me'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <SaveBtn saving={saving} label="Save Navigation" />
        </form>
      )}

      {/* ── SEO ──────────────────────────────────────────────── */}
      {activeTab === 'SEO' && (
        <form onSubmit={e=>{ e.preventDefault(); handleSave('seo'); }}>
          {['home','about','projects','blog','contact','experience'].map(page => (
            <div key={page} style={card}>
              {cHead('🔍', `${page.charAt(0).toUpperCase()+page.slice(1)} Page SEO`)}
              <F label="Meta Title (max 70 chars)">
                <input className="si" style={inp} value={s.seo?.[page]?.title||''} onChange={e=>setSett(`seo.${page}.title`,e.target.value)} placeholder={`${s.siteName||'Portfolio'} | ${page.charAt(0).toUpperCase()+page.slice(1)}`} maxLength={70} onFocus={fo} onBlur={fb} />
                <div style={{ fontSize:11, color:'#3a3a5a', marginTop:4, textAlign:'right' }}>{(s.seo?.[page]?.title||'').length}/70</div>
              </F>
              <F label="Meta Description (max 160 chars)">
                <textarea className="si" style={{...inp,minHeight:68,resize:'vertical',lineHeight:1.6}} value={s.seo?.[page]?.description||''} onChange={e=>setSett(`seo.${page}.description`,e.target.value)} placeholder="Describe this page for search engines..." maxLength={160} onFocus={fo} onBlur={fb} />
                <div style={{ fontSize:11, color:'#3a3a5a', marginTop:4, textAlign:'right' }}>{(s.seo?.[page]?.description||'').length}/160</div>
              </F>
              <F label="OG Image URL (1200×630 recommended)">
                <input className="si" style={inp} value={s.seo?.[page]?.ogImage||''} onChange={e=>setSett(`seo.${page}.ogImage`,e.target.value)} placeholder="https://yoursite.com/og-image.png" onFocus={fo} onBlur={fb} />
              </F>
            </div>
          ))}
          <SaveBtn saving={saving} label="Save SEO Settings" />
        </form>
      )}

      {/* ── THEME ────────────────────────────────────────────── */}
      {activeTab === 'Theme' && (
        <form onSubmit={e=>{ e.preventDefault(); handleSave('theme'); }}>
          <div style={card}>
            {cHead('🎨','Accent Color')}
            <div style={{ marginBottom:20 }}>
              <Lbl t="Quick Presets" />
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
                {ACCENT_PRESETS.map(p => (
                  <button key={p.name} type="button" onClick={()=>{ setSett('theme.accentColor',p.a); setSett('theme.accentColorEnd',p.b); }}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, border: s.theme?.accentColor===p.a?'2px solid #fff':'2px solid transparent', cursor:'pointer', background:'#1a1a2e', color:'#e8e6f0', fontSize:13, fontFamily:'inherit', transition:'border 0.15s' }}>
                    <div style={{ width:20, height:20, borderRadius:5, background:`linear-gradient(135deg,${p.a},${p.b})` }} />{p.name}
                  </button>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <F label="Accent Color Start">
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <input type="color" value={s.theme?.accentColor||'#6366f1'} onChange={e=>setSett('theme.accentColor',e.target.value)} style={{...inp,width:50,height:42,padding:'4px 6px',cursor:'pointer'}} />
                    <input className="si" style={{...inp,flex:1}} value={s.theme?.accentColor||'#6366f1'} onChange={e=>setSett('theme.accentColor',e.target.value)} onFocus={fo} onBlur={fb} />
                  </div>
                </F>
                <F label="Accent Color End (gradient)">
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <input type="color" value={s.theme?.accentColorEnd||'#8b5cf6'} onChange={e=>setSett('theme.accentColorEnd',e.target.value)} style={{...inp,width:50,height:42,padding:'4px 6px',cursor:'pointer'}} />
                    <input className="si" style={{...inp,flex:1}} value={s.theme?.accentColorEnd||'#8b5cf6'} onChange={e=>setSett('theme.accentColorEnd',e.target.value)} onFocus={fo} onBlur={fb} />
                  </div>
                </F>
              </div>
              <div style={{ marginTop:16, padding:'14px 18px', background:'#111120', borderRadius:10, display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${s.theme?.accentColor||'#6366f1'},${s.theme?.accentColorEnd||'#8b5cf6'})` }} />
                <div>
                  <div style={{ fontSize:13, color:'#8a8aaa', marginBottom:6 }}>Live Preview</div>
                  <button type="button" style={{ padding:'7px 18px', background:`linear-gradient(135deg,${s.theme?.accentColor||'#6366f1'},${s.theme?.accentColorEnd||'#8b5cf6'})`, border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                    Sample Button
                  </button>
                </div>
              </div>
            </div>
            <Toggle label="Dark Mode by Default" sub="New visitors see dark theme first" checked={s.theme?.darkModeDefault!==false} onChange={v=>setSett('theme.darkModeDefault',v)} />
          </div>
          <SaveBtn saving={saving} label="Save Theme" />
        </form>
      )}

      {/* ── EMAIL ────────────────────────────────────────────── */}
      {activeTab === 'Email' && (
        <form onSubmit={e=>{ e.preventDefault(); handleSave('emailNotifications'); }}>
          <div style={card}>
            {cHead('📧','Email Notifications')}
            <F label="Admin Email (where to receive notifications)">
              <input className="si" style={inp} value={s.emailNotifications?.adminEmail||''} onChange={e=>setSett('emailNotifications.adminEmail',e.target.value)} placeholder="you@gmail.com" onFocus={fo} onBlur={fb} />
            </F>
            <Toggle label="Enable Email Notifications" sub="Requires SMTP setup in backend .env" checked={s.emailNotifications?.enabled||false} onChange={v=>setSett('emailNotifications.enabled',v)} />
            <Toggle label="Notify on New Contact Message" sub="Get an email when someone submits the contact form" checked={s.emailNotifications?.onNewContact!==false} onChange={v=>setSett('emailNotifications.onNewContact',v)} />
            <Toggle label="Send Auto-Reply to Visitor" sub="Visitor gets a 'thank you' email after submitting" checked={s.emailNotifications?.sendAutoReply!==false} onChange={v=>setSett('emailNotifications.sendAutoReply',v)} />
          </div>
          <div style={card}>
            {cHead('🔧','SMTP Setup (in backend .env)')}
            <div style={{ background:'#111120', borderRadius:10, padding:'14px 16px', fontFamily:'monospace', fontSize:12, color:'#60a5fa', lineHeight:2, marginBottom:16 }}>
              {`SMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=your@gmail.com\nSMTP_PASSWORD=your_app_password\nEMAIL_FROM=your@gmail.com\nADMIN_EMAIL=your@gmail.com`}
            </div>
            <div style={{ fontSize:13, color:'#6a6a8a', lineHeight:1.7, marginBottom:16 }}>
              For Gmail: enable 2FA → generate an <strong style={{color:'#a78bfa'}}>App Password</strong> at{' '}
              <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={{color:'#60a5fa'}}>myaccount.google.com/apppasswords</a>
            </div>
            <button type="button" onClick={testEmail} disabled={testingEmail}
              style={{ padding:'9px 20px', background:'#1a1a2e', border:'1px solid #2e2a4a', borderRadius:9, color:'#a78bfa', fontSize:13, fontWeight:600, cursor:testingEmail?'not-allowed':'pointer', fontFamily:'inherit', opacity:testingEmail?0.6:1 }}>
              {testingEmail ? 'Sending...' : '📤 Send Test Email'}
            </button>
          </div>
          <SaveBtn saving={saving} label="Save Email Settings" />
        </form>
      )}

      {/* ── GITHUB ───────────────────────────────────────────── */}
      {activeTab === 'GitHub' && (
        <div>
          <form onSubmit={e=>{ e.preventDefault(); handleSave('github'); }}>
            <div style={card}>
              {cHead('🐙','GitHub Integration')}
              <F label="GitHub Username">
                <input className="si" style={inp} value={s.github?.username||''} onChange={e=>setSett('github.username',e.target.value)} placeholder="yourusername" onFocus={fo} onBlur={fb} />
              </F>
              <div style={{ fontSize:13, color:'#6a6a8a', lineHeight:1.7, marginBottom:14 }}>
                Also add <code style={{color:'#60a5fa',background:'#1a1a2e',padding:'1px 5px',borderRadius:4}}>GITHUB_TOKEN=ghp_xxx</code> to <code style={{color:'#60a5fa'}}>backend/.env</code> to avoid rate limits.<br/>
                Generate at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{color:'#60a5fa'}}>github.com/settings/tokens</a>
              </div>
              {s.github?.syncedAt && <div style={{ fontSize:12, color:'#3a3a5a', marginBottom:14 }}>Last synced: {new Date(s.github.syncedAt).toLocaleString()}</div>}
              <div style={{ display:'flex', gap:10 }}>
                <SaveBtn saving={saving} label="Save Username" />
                <button type="button" onClick={fetchRepos} disabled={repoLoading}
                  style={{ padding:'10px 20px', background:'#1a1a2e', border:'1px solid #2e2a4a', borderRadius:9, color:'#a78bfa', fontSize:14, fontWeight:600, cursor:repoLoading?'not-allowed':'pointer', fontFamily:'inherit', opacity:repoLoading?0.6:1 }}>
                  {repoLoading ? 'Fetching...' : '🔄 Fetch Repos'}
                </button>
              </div>
            </div>
          </form>
          {repos.length > 0 && (
            <div style={card}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:14 }}>
                Select Repos to Import ({selectedRepos.length} selected)
              </div>
              <div style={{ maxHeight:400, overflowY:'auto', marginBottom:14 }}>
                {repos.filter(r=>!r.isPrivate).map(repo => (
                  <div key={repo.id} onClick={()=>setSelectedRepos(p=>p.includes(repo.id)?p.filter(x=>x!==repo.id):[...p,repo.id])}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:9, marginBottom:6, cursor:'pointer', background:selectedRepos.includes(repo.id)?'#1c1830':'#111120', border: selectedRepos.includes(repo.id)?'1px solid #a78bfa':'1px solid #1e1e2e', transition:'all 0.15s' }}>
                    <input type="checkbox" checked={selectedRepos.includes(repo.id)} onChange={()=>{}} style={{ width:15, height:15, accentColor:'#a78bfa', cursor:'pointer' }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13.5, fontWeight:600, color:'#c4b5fd' }}>{repo.name}</div>
                      {repo.description && <div style={{ fontSize:12, color:'#5a5a7a', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{repo.description}</div>}
                    </div>
                    <div style={{ display:'flex', gap:8, flexShrink:0, fontSize:11, color:'#4a4a6a' }}>
                      {repo.language && <span style={{ background:'#1a1a2e', padding:'2px 8px', borderRadius:4 }}>{repo.language}</span>}
                      <span>⭐ {repo.stars}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSync} disabled={syncing||!selectedRepos.length}
                style={{ padding:'10px 22px', background:selectedRepos.length?'linear-gradient(135deg,#a78bfa,#60a5fa)':'#2e2a4a', border:'none', borderRadius:9, color:'#fff', fontSize:14, fontWeight:600, cursor:syncing||!selectedRepos.length?'not-allowed':'pointer', fontFamily:'inherit' }}>
                {syncing ? 'Importing...' : `↓ Import ${selectedRepos.length} Repo${selectedRepos.length!==1?'s':''} as Draft Projects`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── DEPLOY ───────────────────────────────────────────── */}
      {activeTab === 'Deploy' && (
        <div>
          <div style={card}>
            {cHead('🚀','Deploy Frontend — Vercel (Recommended)')}
            <div style={{ fontSize:13, color:'#8a8aaa', lineHeight:1.9, marginBottom:20 }}>
              <strong style={{color:'#e8e6f0'}}>Step 1</strong> — Push your project to GitHub<br/>
              <strong style={{color:'#e8e6f0'}}>Step 2</strong> — Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{color:'#60a5fa'}}>vercel.com</a> → New Project → Import your repo<br/>
              <strong style={{color:'#e8e6f0'}}>Step 3</strong> — Set <strong>Root Directory</strong> to <code style={{color:'#60a5fa',background:'#1a1a2e',padding:'1px 5px',borderRadius:4}}>frontend</code><br/>
              <strong style={{color:'#e8e6f0'}}>Step 4</strong> — Add environment variable:
            </div>
            <div style={{ background:'#111120', borderRadius:10, padding:'14px 16px', fontFamily:'monospace', fontSize:13, color:'#60a5fa', marginBottom:20 }}>
              VITE_API_URL=https://your-backend.railway.app/api/v1
            </div>
            <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 22px', background:'#000', border:'1px solid #333', borderRadius:9, color:'#fff', fontSize:13, fontWeight:600, textDecoration:'none' }}>
              ▲ Deploy to Vercel
            </a>
          </div>
          <div style={card}>
            {cHead('🛠️','Deploy Backend — Railway (Recommended)')}
            <div style={{ fontSize:13, color:'#8a8aaa', lineHeight:1.9, marginBottom:20 }}>
              <strong style={{color:'#e8e6f0'}}>Step 1</strong> — Go to <a href="https://railway.app" target="_blank" rel="noopener noreferrer" style={{color:'#60a5fa'}}>railway.app</a> → New Project → Deploy from GitHub<br/>
              <strong style={{color:'#e8e6f0'}}>Step 2</strong> — Set <strong>Root Directory</strong> to <code style={{color:'#60a5fa',background:'#1a1a2e',padding:'1px 5px',borderRadius:4}}>backend</code><br/>
              <strong style={{color:'#e8e6f0'}}>Step 3</strong> — Add Redis plugin → Railway auto-injects <code style={{color:'#60a5fa'}}>REDIS_URL</code><br/>
              <strong style={{color:'#e8e6f0'}}>Step 4</strong> — Add all env variables from your <code style={{color:'#60a5fa'}}>backend/.env</code>
            </div>
            <div style={{ background:'#111120', borderRadius:10, padding:'14px 16px', fontFamily:'monospace', fontSize:12, color:'#60a5fa', lineHeight:2, marginBottom:20 }}>
              {`NODE_ENV=production\nMONGODB_URI=mongodb+srv://...\nJWT_SECRET=your_secret\nJWT_REFRESH_SECRET=your_refresh_secret\nCORS_ORIGIN=https://your-app.vercel.app\nCLOUDINARY_CLOUD_NAME=xxx\nCLOUDINARY_API_KEY=xxx\nCLOUDINARY_API_SECRET=xxx`}
            </div>
          </div>
        </div>
      )}

      {/* ── PASSWORD ─────────────────────────────────────────── */}
      {activeTab === 'Password' && (
        <div>
          <div style={{ ...card, maxWidth:480 }}>
            {cHead('👤','Account Info')}
            {[['Name',user?.name||'Admin'],['Email',user?.email||'admin@portfolio.com'],['Role',user?.role||'admin'],['Last Login',user?.lastLogin?new Date(user.lastLogin).toLocaleString():'N/A']].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #111120' }}>
                <span style={{ fontSize:13, color:'#5a5a7a' }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:500, color:'#c4b5fd', textTransform:'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ ...card, maxWidth:480 }}>
            {cHead('🔒','Change Password')}
            <form onSubmit={handlePassword}>
              {[['Current Password','current'],['New Password','newPw'],['Confirm New Password','confirm']].map(([lbl,key]) => (
                <div key={key} style={{ marginBottom:16 }}>
                  <Lbl t={lbl} />
                  <input className="si" type="password" style={inp} value={pw[key]} onChange={e=>setPw(p=>({...p,[key]:e.target.value}))} required onFocus={fo} onBlur={fb} />
                </div>
              ))}
              {pwMsg && <div style={{ padding:'10px 14px', background:'#0d2a1f', border:'1px solid #1a4a35', borderRadius:8, color:'#34d399', fontSize:13, marginBottom:14 }}>✓ {pwMsg}</div>}
              {pwErr && <div style={{ padding:'10px 14px', background:'#1f1520', border:'1px solid #3a1a25', borderRadius:8, color:'#f87171', fontSize:13, marginBottom:14 }}>✕ {pwErr}</div>}
              <SaveBtn saving={pwSaving} label="Update Password" />
            </form>
          </div>
          <div style={{ ...card, maxWidth:480, border:'1px solid #28244a', background:'linear-gradient(135deg,#1a1630,#0f1a2e)' }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'2px', color:'#3a3a5a', marginBottom:10 }}>⚠️ Security</div>
            <div style={{ fontSize:13, color:'#6a6a8a', lineHeight:1.7 }}>
              Default: <strong style={{color:'#a78bfa'}}>admin@portfolio.com</strong> / <strong style={{color:'#a78bfa'}}>admin123456</strong><br/>
              <span style={{color:'#f87171'}}>Change your password before deploying publicly!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
