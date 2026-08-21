// PATH: frontend/src/components/common/LiveWidgets.jsx
// Three user-attraction widgets:
// 1. <LiveVisitorDot />  — "X people viewing" floating dot
// 2. <ReactionBar slug="..." />  — emoji reaction bar for blog posts / projects

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── 1. LIVE VISITOR DOT ─────────────────────────────────────
// Public pages should not call admin-only analytics endpoints.
export function LiveVisitorDot() {
  return null;
}

// ─── 2. REACTION BAR ─────────────────────────────────────────
// Emoji reactions stored in localStorage (no backend needed)
const EMOJIS = ['❤️', '🔥', '👏', '🤩', '💡', '🚀'];

export function ReactionBar({ slug, className = '' }) {
  const key = `reactions_${slug}`;
  const [counts, setCounts]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  });
  const [myPick, setMyPick] = useState(() => localStorage.getItem(`${key}_mine`) || null);
  const [burst,  setBurst]  = useState(null);

  const react = (emoji) => {
    if (myPick === emoji) return; // already reacted with this one

    const prev = myPick;
    const next = { ...counts };

    // Remove old reaction
    if (prev) { next[prev] = Math.max(0, (next[prev] || 0) - 1); }

    // Add new reaction
    next[emoji] = (next[emoji] || 0) + 1;

    setCounts(next);
    setMyPick(emoji);
    setBurst(emoji);
    setTimeout(() => setBurst(null), 700);

    try {
      localStorage.setItem(key, JSON.stringify(next));
      localStorage.setItem(`${key}_mine`, emoji);
    } catch {}
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        React
      </span>
      {EMOJIS.map(emoji => (
        <motion.button
          key={emoji}
          onClick={() => react(emoji)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.85 }}
          animate={burst === emoji ? { scale: [1, 1.5, 1], rotate: [0, -10, 10, 0] } : {}}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 100,
            border: myPick === emoji ? '1.5px solid #6366f1' : '1px solid rgba(99,102,241,0.2)',
            background: myPick === emoji ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
            cursor: 'pointer', fontSize: 16,
            transition: 'border-color 0.2s, background 0.2s',
          }}
          title={`React with ${emoji}`}
        >
          <span>{emoji}</span>
          {counts[emoji] > 0 && (
            <AnimatePresence mode="wait">
              <motion.span
                key={counts[emoji]}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                style={{ fontSize: 11, fontWeight: 700, color: myPick === emoji ? '#a78bfa' : '#6b7280', minWidth: 14, textAlign: 'center' }}
              >
                {counts[emoji]}
              </motion.span>
            </AnimatePresence>
          )}
        </motion.button>
      ))}
    </div>
  );
}


// ─── 4. VIEW COUNTER BADGE ───────────────────────────────────
// Shows view count on blog posts / project cards
export function ViewBadge({ count, className = '' }) {
  if (!count) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-slate-400 ${className}`}>
      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
      {count >= 1000 ? `${(count/1000).toFixed(1)}k` : count} views
    </span>
  );
}

// ─── 5. TYPING INDICATOR ─────────────────────────────────────
// Shows "Nikhil is coding right now..." status
export function CodingStatus({ name = 'Developer' }) {
  const [isActive, setIsActive] = useState(true);

  // Simulate active/inactive with random intervals
  useEffect(() => {
    const toggle = () => setIsActive(v => {
      // 70% chance to be active during work hours
      const h = new Date().getHours();
      return h >= 9 && h <= 23 ? Math.random() > 0.3 : Math.random() > 0.8;
    });
    const t = setInterval(toggle, 60000 * 5); // check every 5 min
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
        border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
        color: isActive ? '#10b981' : '#6b7280',
      }}
    >
      <span style={{ position: 'relative', width: 7, height: 7 }}>
        {isActive && (
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: '#10b981', animation: 'ping 1.5s infinite',
          }} />
        )}
        <span style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: isActive ? '#10b981' : '#6b7280' }} />
      </span>
      {isActive ? `${name} is coding right now` : `${name} is away`}
    </motion.div>
  );
}
