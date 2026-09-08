import { useState, useEffect, useRef } from 'react';
import { profileAPI } from '@services/api';
import { useAuth } from '@contexts/AuthContext';
import toast from 'react-hot-toast';

const inp = {
  width: '100%', padding: '10px 13px', background: '#111120',
  border: '1px solid #2e2a4a', borderRadius: 8, color: '#e8e6f0',
  fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};
const Lbl = ({ t }) => (
  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#4a4a6a', marginBottom: 7 }}>{t}</label>
);
const Field = ({ label, children }) => <div style={{ marginBottom: 16 }}><Lbl t={label} />{children}</div>;
const card = { background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 14, padding: '24px', marginBottom: 20 };
const cardTitle = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px', color: '#3a3a5a', marginBottom: 20 };

import TwoFactorSetup from '@components/admin/TwoFactorSetup';

export default function AdminProfile() {
  const { user: authUser, checkAuth } = useAuth();
  const avatarRef = useRef();
  const resumeRef = useRef();

  const [profile, setProfile] = useState({
    name: '', title: '', tagline: '', bio: '', location: '', phone: '',
    contactEmail: '', yearsOfExperience: 0, availableForWork: true,
    social: { github: '', linkedin: '', twitter: '', website: '', instagram: '' },
  });
  const [resume, setResume] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    profileAPI.get().then(r => {
      const d = r.data?.data;
      if (d) {
        setProfile({
          name: d.name || '',
          title: d.title || '',
          tagline: d.tagline || '',
          bio: d.bio || '',
          location: d.location || '',
          phone: d.phone || '',
          contactEmail: d.contactEmail || d.email || '',
          yearsOfExperience: d.yearsOfExperience || 0,
          availableForWork: d.availableForWork ?? true,
          social: {
            github:    d.social?.github    || '',
            linkedin:  d.social?.linkedin  || '',
            twitter:   d.social?.twitter   || '',
            website:   d.social?.website   || '',
            instagram: d.social?.instagram || '',
          },
        });
        setAvatar(d.avatar || '');
        setResume(d.resume || null);
      }
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const setSocial = (k, v) => setProfile(p => ({ ...p, social: { ...p.social, [k]: v } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await profileAPI.update(profile);
      setProfile(prev => ({ ...prev, ...r.data.data }));
      await checkAuth(); // refresh AuthContext user
      toast.success('Profile saved!');
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
    setSaving(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    const file = avatarRef.current?.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const r = await profileAPI.uploadAvatar(fd);
      setAvatar(r.data.data.avatar);
      setAvatarPreview('');
      await checkAuth();
      toast.success('Avatar updated!');
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed'); }
    setUploadingAvatar(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('PDF must be under 10MB'); return; }
    setUploadingResume(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const r = await profileAPI.uploadResume(fd);
      setResume(r.data.data.resume);
      toast.success('Resume uploaded!');
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed'); }
    setUploadingResume(false);
  };

  const handleDeleteResume = async () => {
    if (!confirm('Delete your resume?')) return;
    try {
      await profileAPI.deleteResume();
      setResume(null);
      toast.success('Resume deleted');
    } catch { toast.error('Delete failed'); }
  };

  const downloadUrl = profileAPI.getResumeDownloadUrl();

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#4a4a6a' }}>Loading profile...</div>;

  return (
    <div style={{ color: '#e8e6f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap'); .pi:focus{border-color:#a78bfa!important;outline:none}`}</style>
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#e8e6f0', letterSpacing: '-0.5px' }}>Profile & Bio</div>
        <div style={{ fontSize: 13, color: '#4a4a6a', marginTop: 4 }}>This data powers your public portfolio pages.</div>
      </div>

      <div className="adm-grid-2" style={{ gap: 20, alignItems: "start", gridTemplateColumns: "1fr 300px" }}>

        {/* LEFT — main form */}
        <form onSubmit={handleSave}>

          {/* Basic Info */}
          <div style={card}>
            <div style={cardTitle}>Basic Information</div>
            <div className="adm-grid-2">
              <Field label="Display Name *">
                <input className="pi" style={inp} value={profile.name} onChange={e => set('name', e.target.value)} placeholder="Nikhil Suryawanshi" required />
              </Field>
              <Field label="Title / Role">
                <input className="pi" style={inp} value={profile.title} onChange={e => set('title', e.target.value)} placeholder="Full-Stack Developer" />
              </Field>
              <Field label="Location">
                <input className="pi" style={inp} value={profile.location} onChange={e => set('location', e.target.value)} placeholder="Mumbai, India" />
              </Field>
              <Field label="Years of Experience">
                <input className="pi" style={inp} type="number" min="0" value={profile.yearsOfExperience} onChange={e => set('yearsOfExperience', Number(e.target.value))} />
              </Field>
              <Field label="Contact Email (shown on site)">
                <input className="pi" style={inp} value={profile.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="hello@nikhil.dev" />
              </Field>
              <Field label="Phone (optional)">
                <input className="pi" style={inp} value={profile.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </Field>
            </div>
            <Field label="Tagline (short headline under your name)">
              <input className="pi" style={inp} value={profile.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Building scalable apps with MERN stack" />
            </Field>
            <Field label="Bio (shown on About page)">
              <textarea className="pi" style={{ ...inp, minHeight: 120, resize: 'vertical', lineHeight: 1.65 }} value={profile.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell your story — who you are, what you build, what drives you..." maxLength={1000} />
              <div style={{ fontSize: 11, color: '#3a3a5a', marginTop: 4, textAlign: 'right' }}>{profile.bio.length}/1000</div>
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #1e1e2e' }}>
              <div>
                <div style={{ fontSize: 14, color: '#8a8aaa' }}>Available for Work</div>
                <div style={{ fontSize: 11, color: '#4a4a6a', marginTop: 2 }}>Shows the green "Open to Work" badge on your portfolio</div>
              </div>
              <input type="checkbox" checked={profile.availableForWork} onChange={e => set('availableForWork', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#a78bfa' }} />
            </div>
          </div>

          {/* Social Links */}
          <div style={card}>
            <div style={cardTitle}>Social Links</div>
            <div className="adm-grid-2">
              {[
                ['GitHub URL', 'github', 'https://github.com/yourusername'],
                ['LinkedIn URL', 'linkedin', 'https://linkedin.com/in/yourname'],
                ['Twitter / X URL', 'twitter', 'https://twitter.com/yourusername'],
                ['Personal Website', 'website', 'https://yoursite.com'],
                ['Instagram URL', 'instagram', 'https://instagram.com/yourusername'],
              ].map(([label, key, placeholder]) => (
                <Field key={key} label={label}>
                  <input className="pi" style={inp} value={profile.social[key]} onChange={e => setSocial(key, e.target.value)} placeholder={placeholder} />
                </Field>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            style={{ width: '100%', padding: '12px', background: saving ? '#2e2a4a' : 'linear-gradient(135deg,#a78bfa,#60a5fa)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Saving...' : '✓ Save Profile'}
          </button>
        </form>

        {/* RIGHT — avatar + resume */}
        <div>

          {/* Avatar */}
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={cardTitle}>Profile Photo</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', margin: '0 auto', border: '3px solid #2e2a4a', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(avatarPreview || avatar) ? (
                  <img src={avatarPreview || avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 36 }}>👤</span>
                )}
              </div>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} id="avatar-upload" />
            <label htmlFor="avatar-upload"
              style={{ display: 'block', padding: '8px 16px', background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, color: '#a78bfa', fontSize: 13, cursor: 'pointer', marginBottom: 10, textAlign: 'center' }}>
              Choose Photo
            </label>
            {avatarPreview && (
              <button onClick={handleAvatarUpload} disabled={uploadingAvatar}
                style={{ width: '100%', padding: '8px', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {uploadingAvatar ? 'Uploading...' : '↑ Upload Photo'}
              </button>
            )}
            <div style={{ fontSize: 11, color: '#3a3a5a', marginTop: 8 }}>JPG, PNG, WebP · Max 5MB</div>
          </div>

          {/* Resume */}
          <div style={card}>
            <div style={cardTitle}>Resume / CV</div>

            {resume?.url ? (
              <div>
                <div style={{ background: '#111120', border: '1px solid #2e2a4a', borderRadius: 10, padding: '14px', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', marginBottom: 4, wordBreak: 'break-all' }}>
                    📄 {resume.fileName || 'resume.pdf'}
                  </div>
                  <div style={{ fontSize: 11, color: '#4a4a6a' }}>
                    {resume.downloadCount || 0} download{resume.downloadCount !== 1 ? 's' : ''}
                    {resume.uploadedAt && ` · Uploaded ${new Date(resume.uploadedAt).toLocaleDateString()}`}
                  </div>
                </div>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', textAlign: 'center', padding: '8px', background: '#0d2a1f', border: '1px solid #1a4a35', borderRadius: 8, color: '#34d399', fontSize: 13, textDecoration: 'none', marginBottom: 8 }}>
                  ↓ Preview / Download
                </a>
                <div style={{ display: 'flex', gap: 8 }}>
                  <label htmlFor="resume-replace"
                    style={{ flex: 1, textAlign: 'center', padding: '7px', background: '#1a1a2e', border: '1px solid #2e2a4a', borderRadius: 8, color: '#a78bfa', fontSize: 12, cursor: 'pointer' }}>
                    Replace
                  </label>
                  <button onClick={handleDeleteResume}
                    style={{ flex: 1, padding: '7px', background: '#1f1520', border: '1px solid #3a1a25', borderRadius: 8, color: '#f87171', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Delete
                  </button>
                </div>
                <input id="resume-replace" type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
              </div>
            ) : (
              <div>
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#4a4a6a', marginBottom: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 13 }}>No resume uploaded yet</div>
                </div>
                <input id="resume-upload" type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
                <label htmlFor="resume-upload"
                  style={{ display: 'block', textAlign: 'center', padding: '10px', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {uploadingResume ? 'Uploading...' : '↑ Upload PDF Resume'}
                </label>
              </div>
            )}
            <div style={{ fontSize: 11, color: '#3a3a5a', marginTop: 10, textAlign: 'center' }}>PDF only · Max 10MB</div>
          </div>

          {/* Live preview hint */}
          <div style={{ background: 'linear-gradient(135deg,#16122a,#0f1a2e)', border: '1px solid #28244a', borderRadius: 12, padding: '14px 16px', fontSize: 12, color: '#6a6a8a', lineHeight: 1.7 }}>
            💡 <strong style={{ color: '#a78bfa' }}>Where this shows:</strong><br />
            Name, title, tagline → <strong style={{ color: '#c4b5fd' }}>Home page hero</strong><br />
            Bio, skills, experience → <strong style={{ color: '#c4b5fd' }}>About page</strong><br />
            Email, phone, location → <strong style={{ color: '#c4b5fd' }}>Contact page</strong><br />
            Social links → <strong style={{ color: '#c4b5fd' }}>All pages footer</strong><br />
            Resume → <strong style={{ color: '#c4b5fd' }}>Download button</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
