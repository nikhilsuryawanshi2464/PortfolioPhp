// frontend/src/components/common/ReadingProgress.jsx
// Feature 9 — Blog Reading Progress Bar
// Shows a colored progress bar at top of blog post tracking scroll through article
// Different from the global ScrollProgressBar — this one tracks only the article body

import { useEffect, useState } from 'react';

export default function ReadingProgress({ target = null }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = target?.current || document.documentElement;
      const scrollTop = window.scrollY;
      const docHeight = el.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [target]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 9999, height: 3, pointerEvents: 'none',
    }}>
      {/* Track */}
      <div style={{ width: '100%', height: '100%', background: 'rgba(99,102,241,0.1)' }}/>
      {/* Fill */}
      <div style={{
        position: 'absolute', top: 0, left: 0, height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
        transition: 'width 0.1s linear',
        boxShadow: '0 0 8px rgba(99,102,241,0.6)',
      }}/>
    </div>
  );
}
