// frontend/src/components/common/HireMeWidget.jsx
// Feature 2 — Hire Me Slide-in Widget
// Slides in from right after 60s OR when user scrolls to bottom of page
// Shows only once per session, only on non-admin pages

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiArrowRight, FiBriefcase } from 'react-icons/fi';
import { useSettings } from '@contexts/SiteSettingsContext';

export default function HireMeWidget() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { settings } = useSettings();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const shown = sessionStorage.getItem('hireme_shown');

  useEffect(() => {
    if (isAdmin || shown || dismissed) return;

    // Trigger 1: after 60 seconds
    const timer = setTimeout(() => show(), 60000);

    // Trigger 2: near bottom of page
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled >= total - 200) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [isAdmin, dismissed]);

  const show = () => {
    if (sessionStorage.getItem('hireme_shown')) return;
    sessionStorage.setItem('hireme_shown', '1');
    setVisible(true);
  };

  const dismiss = () => { setVisible(false); setDismissed(true); };

  if (isAdmin) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9980,
            width: 300, pointerEvents: 'auto',
          }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: 20,
            padding: '20px 20px 18px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
          }}>
            {/* Close */}
            <button onClick={dismiss} style={{
              position:'absolute', top:12, right:12, width:28, height:28,
              borderRadius:'50%', background:'rgba(255,255,255,0.06)',
              border:'none', color:'#6b7280', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><FiX size={14}/></button>

            {/* Available badge */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ position:'relative', width:10, height:10 }}>
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#10b981', animation:'ping 1.5s infinite' }}/>
                <span style={{ position:'relative', display:'block', width:10, height:10, borderRadius:'50%', background:'#10b981' }}/>
              </div>
              <span style={{ fontSize:11, color:'#10b981', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>
                Available for Work
              </span>
            </div>

            {/* Icon + Heading */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <FiBriefcase size={18} style={{ color:'#a78bfa' }}/>
              </div>
              <div>
                <div style={{ fontWeight:800, color:'#f1f5f9', fontSize:14, lineHeight:1.2 }}>
                  {settings?.ownerName?.split(' ')[0] || 'I\'m'} available!
                </div>
                <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>Open to new projects</div>
              </div>
            </div>

            <p style={{ fontSize:12, color:'#94a3b8', lineHeight:1.7, marginBottom:14 }}>
              Looking for a skilled developer? Let's build something amazing together.
            </p>

            <div style={{ display:'flex', gap:8 }}>
              <Link to="/contact" onClick={dismiss}
                style={{
                  flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  padding:'9px 12px', borderRadius:10, fontSize:12, fontWeight:700,
                  background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color:'#fff', textDecoration:'none',
                  boxShadow:'0 4px 12px rgba(99,102,241,0.35)',
                }}>
                <FiMail size={13}/> Send a Brief
              </Link>
              <Link to="/resume" onClick={dismiss}
                style={{
                  flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  padding:'9px 12px', borderRadius:10, fontSize:12, fontWeight:600,
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                  color:'#94a3b8', textDecoration:'none',
                }}>
                View CV <FiArrowRight size={12}/>
              </Link>
            </div>

            <p style={{ fontSize:10, color:'#3a3a5a', textAlign:'center', marginTop:10 }}>
              💬 Typically responds within 24 hours
            </p>
          </div>
          <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
