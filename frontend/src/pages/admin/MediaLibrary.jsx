// frontend/src/pages/admin/MediaLibrary.jsx
// Feature 18 — Admin Media Library
// Browse, search and reuse all Cloudinary uploads in one panel
// Fetches images from your backend /api/v1/media endpoint

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@services/api';
import toast from 'react-hot-toast';

// Resource type tabs
const TYPES = ['image', 'video', 'raw'];
const FOLDERS = ['All', 'blog', 'projects', 'skills', 'profile', 'gallery'];

export default function MediaLibrary({ onSelect = null, selectable = false }) {
  const [assets, setAssets]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [folder, setFolder]       = useState('All');
  const [selected, setSelected]   = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [nextCursor, setNext]     = useState(null);
  const [hasMore, setHasMore]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = async (reset = true) => {
    setLoading(true);
    try {
      const params = { max_results: 30, resource_type: 'image' };
      if (folder !== 'All') params.folder = folder;
      if (!reset && nextCursor) params.next_cursor = nextCursor;

      const r = await api.get('/media', { params });
      const d = r.data?.data || {};
      const resources = d.resources || [];

      setAssets(prev => reset ? resources : [...prev, ...resources]);
      setNext(d.next_cursor || null);
      setHasMore(!!d.next_cursor);
    } catch(e) {
      // If /media endpoint not set up yet, show placeholder
      toast.error('Media endpoint not configured. See backend README to add Cloudinary browser route.');
      setAssets([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(true); }, [folder]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder !== 'All' ? folder : 'general');
      await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Uploaded!');
      load(true);
    } catch { toast.error('Upload failed'); }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (publicId) => {
    if (!window.confirm('Delete this file from Cloudinary?')) return;
    setDeleting(publicId);
    try {
      await api.delete(`/media/${encodeURIComponent(publicId)}`);
      toast.success('Deleted!');
      setAssets(prev => prev.filter(a => a.public_id !== publicId));
      if (selected?.public_id === publicId) setSelected(null);
    } catch { toast.error('Delete failed'); }
    setDeleting(null);
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => toast.success('URL copied!'));
  };

  const filtered = assets.filter(a => {
    if (!search) return true;
    return a.public_id?.toLowerCase().includes(search.toLowerCase()) ||
           a.tags?.some(t => t.includes(search.toLowerCase()));
  });

  const inp = {
    background: '#111120', border: '1px solid #2e2a4a', borderRadius: 8,
    padding: '8px 12px', color: '#e8e6f0', fontSize: 13, outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ color: '#e8e6f0', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Media Library</div>
          <div style={{ fontSize: 13, color: '#4a4a6a', marginTop: 2 }}>All Cloudinary uploads in one place</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleUpload}/>
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
            {uploading ? 'Uploading…' : '+ Upload File'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
          style={{ ...inp, flex: 1, minWidth: 180, maxWidth: 280 }}
          onFocus={e => e.target.style.borderColor='#a78bfa'}
          onBlur={e => e.target.style.borderColor='#2e2a4a'}/>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {FOLDERS.map(f => (
            <button key={f} onClick={() => setFolder(f)}
              style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                border: folder === f ? 'none' : '1px solid #2e2a4a',
                background: folder === f ? 'linear-gradient(135deg,#a78bfa,#60a5fa)' : '#0f0f1a',
                color: folder === f ? '#fff' : '#6b6b8a' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading && assets.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', background: '#111120', borderRadius: 10, animation: 'pulse 1.5s infinite' }}/>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#4a4a6a' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
              <div style={{ color: '#6a6a8a', fontSize: 14 }}>
                {assets.length === 0
                  ? 'No media found. Make sure /api/v1/media endpoint is set up in your backend.'
                  : 'No files match your search.'}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
                {filtered.map(asset => (
                  <motion.div key={asset.public_id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelected(asset)}
                    style={{
                      position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                      border: `2px solid ${selected?.public_id === asset.public_id ? '#a78bfa' : '#1e1e2e'}`,
                      cursor: 'pointer', background: '#0f0f1a',
                    }}>
                    <img src={asset.secure_url} alt={asset.public_id}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"/>
                    {selected?.public_id === asset.public_id && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>✓</div>
                    )}
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button onClick={() => load(false)} disabled={loading}
                    style={{ padding: '8px 20px', borderRadius: 9, border: '1px solid #2e2a4a', background: '#0f0f1a', color: '#a78bfa', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                    {loading ? 'Loading…' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ width: 240, flexShrink: 0, background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 14, padding: 16, alignSelf: 'flex-start', position: 'sticky', top: 80 }}>
              <img src={selected.secure_url} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}/>

              <div style={{ fontSize: 11, color: '#4a4a6a', marginBottom: 12, wordBreak: 'break-all' }}>
                {selected.public_id}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: '#6b6b8a', marginBottom: 14 }}>
                {selected.width  && <div>W: {selected.width}px</div>}
                {selected.height && <div>H: {selected.height}px</div>}
                {selected.bytes  && <div>Size: {(selected.bytes/1024).toFixed(0)}KB</div>}
                {selected.format && <div>Format: {selected.format}</div>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => copyUrl(selected.secure_url)}
                  style={{ padding: '8px', borderRadius: 8, border: 'none', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600 }}>
                  📋 Copy URL
                </button>

                {onSelect && selectable && (
                  <button onClick={() => { onSelect(selected); setSelected(null); }}
                    style={{ padding: '8px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', color: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 700 }}>
                    ✓ Use This Image
                  </button>
                )}

                <button onClick={() => handleDelete(selected.public_id)} disabled={deleting === selected.public_id}
                  style={{ padding: '8px', borderRadius: 8, border: 'none', background: 'rgba(248,113,113,0.1)', color: '#f87171', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                  {deleting === selected.public_id ? 'Deleting…' : '🗑 Delete'}
                </button>

                <button onClick={() => setSelected(null)}
                  style={{ padding: '6px', borderRadius: 8, border: '1px solid #2e2a4a', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
