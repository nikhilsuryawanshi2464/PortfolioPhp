// frontend/src/components/common/SocialShareBar.jsx
// Feature 22 — Social Share Bar
// Floating sticky share buttons on blog posts and project pages
// Shares current page URL + title to Twitter, LinkedIn, WhatsApp, Copy Link

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShare2, FiTwitter, FiLinkedin, FiLink, FiCheck, FiX } from 'react-icons/fi';

const WA_ICON = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function SocialShareBar({ title = '', url = '' }) {
  const [open, setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl   = url || window.location.href;
  const shareTitle = title || document.title;
  const encoded    = encodeURIComponent(shareUrl);
  const encTitle   = encodeURIComponent(shareTitle);

  const links = [
    {
      label: 'Twitter / X',
      icon: <FiTwitter size={15}/>,
      color: '#1DA1F2',
      href: `https://twitter.com/intent/tweet?text=${encTitle}&url=${encoded}`,
    },
    {
      label: 'LinkedIn',
      icon: <FiLinkedin size={15}/>,
      color: '#0A66C2',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    },
    {
      label: 'WhatsApp',
      icon: <WA_ICON/>,
      color: '#25D366',
      href: `https://wa.me/?text=${encTitle}%20${encoded}`,
    },
  ];

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch { }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)',
      zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }} className="hidden lg:flex">

      {/* Toggle */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        title="Share"
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: open ? '#6366f1' : '#0f0f1a',
          border: '1px solid rgba(99,102,241,0.4)',
          color: open ? '#fff' : '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
        {open ? <FiX size={16}/> : <FiShare2 size={16}/>}
      </motion.button>

      {/* Share buttons */}
      <AnimatePresence>
        {open && (
          <>
            {links.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={item.label}
                initial={{ opacity: 0, scale: 0.5, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -10 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.15 }}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#0f0f1a', border: `1px solid ${item.color}40`,
                  color: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 12px ${item.color}20`,
                }}>
                {item.icon}
              </motion.a>
            ))}

            {/* Copy link */}
            <motion.button
              onClick={copyLink}
              title="Copy link"
              initial={{ opacity: 0, scale: 0.5, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.15 }}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: copied ? '#10b981' : '#0f0f1a',
                border: `1px solid ${copied ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                color: copied ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
              {copied ? <FiCheck size={15}/> : <FiLink size={15}/>}
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
