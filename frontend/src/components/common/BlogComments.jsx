// frontend/src/components/common/BlogComments.jsx
// Feature 16 — Blog Comment System (Public UI)
// Backend Comment model + routes already exist
// This adds the public display + submit form to BlogPost.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiSend, FiUser, FiMail, FiThumbsUp } from 'react-icons/fi';
import { commentsAPI } from '@services/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  } catch { return ''; }
};

function CommentCard({ comment, index }) {
  const initials = comment.name?.slice(0,2).toUpperCase() || '??';
  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.4, delay: index * 0.07 }}
      style={{
        display:'flex', gap:14, padding:'16px 0',
        borderBottom:'1px solid rgba(99,102,241,0.08)',
      }}>
      {/* Avatar */}
      <div style={{
        width:40, height:40, borderRadius:'50%', flexShrink:0,
        background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:700, fontSize:13, color:'#fff',
      }}>{initials}</div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
          <span style={{ fontWeight:700, color:'#e2e8f0', fontSize:14 }}>{comment.name}</span>
          <span style={{ fontSize:11, color:'#4b5563' }}>{fmtDate(comment.createdAt)}</span>
        </div>
        <p style={{ fontSize:14, color:'#94a3b8', lineHeight:1.7, margin:0 }}>{comment.message}</p>
      </div>
    </motion.div>
  );
}

export default function BlogComments({ postSlug }) {
  const [form, setForm]     = useState({ name:'', email:'', message:'' });
  const [submitting, setSub]= useState(false);
  const [submitted, setSub2]= useState(false);

  const { data: comments = [], refetch } = useQuery({
    queryKey: ['comments', postSlug],
    queryFn: () => commentsAPI.getByPost(postSlug).then(r => r.data?.data || []),
    enabled: !!postSlug,
    staleTime: 60000,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSub(true);
    try {
      await commentsAPI.create({ ...form, post: postSlug });
      setSub2(true);
      setForm({ name:'', email:'', message:'' });
      toast.success('Comment submitted! It will appear after approval.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit comment');
    }
    setSub(false);
  };

  const inp = {
    width:'100%', padding:'10px 14px', borderRadius:10,
    background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.15)',
    color:'#e2e8f0', fontSize:13, outline:'none', fontFamily:'inherit',
    boxSizing:'border-box',
  };

  return (
    <div style={{ marginTop:48 }}>
      {/* Section header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, paddingBottom:12, borderBottom:'1px solid rgba(99,102,241,0.12)' }}>
        <FiMessageSquare size={18} style={{ color:'#6366f1' }}/>
        <h3 style={{ fontSize:18, fontWeight:800, color:'#e2e8f0', margin:0 }}>
          Comments {comments.length > 0 && <span style={{ fontSize:13, color:'#6b7280', fontWeight:400 }}>({comments.length})</span>}
        </h3>
      </div>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div style={{ marginBottom:32 }}>
          {comments.map((c, i) => <CommentCard key={c._id} comment={c} index={i}/>)}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'20px 0 32px', color:'#4b5563' }}>
          <FiMessageSquare size={32} style={{ opacity:0.3, marginBottom:8, display:'block', margin:'0 auto 8px' }}/>
          <p style={{ fontSize:13 }}>No comments yet — be the first!</p>
        </div>
      )}

      {/* Submit form */}
      <div style={{ background:'rgba(99,102,241,0.04)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:16, padding:'20px 20px 18px' }}>
        <h4 style={{ fontSize:15, fontWeight:700, color:'#e2e8f0', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
          <FiUser size={14} style={{ color:'#6366f1' }}/> Leave a Comment
        </h4>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="thanks" initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🎉</div>
              <p style={{ color:'#10b981', fontWeight:700, marginBottom:4 }}>Comment submitted!</p>
              <p style={{ color:'#6b7280', fontSize:13 }}>It will appear after moderation review.</p>
              <button onClick={() => setSub2(false)} style={{ marginTop:12, padding:'6px 16px', borderRadius:8, border:'1px solid rgba(99,102,241,0.3)', background:'transparent', color:'#6366f1', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
                Write another
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Name *</label>
                  <input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="Your name"
                    onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'}
                    onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.15)'}/>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Email * <span style={{ fontSize:10, color:'#4b5563', textTransform:'none', letterSpacing:0 }}>(not published)</span></label>
                  <input type="email" style={inp} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required placeholder="your@email.com"
                    onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'}
                    onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.15)'}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Message *</label>
                <textarea rows={4} style={{...inp, resize:'vertical', minHeight:90, lineHeight:1.6}} value={form.message}
                  onChange={e=>setForm(f=>({...f,message:e.target.value}))} required placeholder="Share your thoughts..."
                  onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'}
                  onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.15)'}/>
              </div>
              <button type="submit" disabled={submitting}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  padding:'11px 20px', borderRadius:10, fontSize:13, fontWeight:700,
                  background: submitting ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border:'none', color:'#fff', cursor:submitting?'not-allowed':'pointer', fontFamily:'inherit',
                  boxShadow:'0 4px 12px rgba(99,102,241,0.3)',
                }}>
                <FiSend size={14}/>{submitting ? 'Submitting...' : 'Post Comment'}
              </button>
              <p style={{ fontSize:11, color:'#4b5563', margin:0 }}>
                ℹ️ Comments are reviewed before appearing publicly.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
