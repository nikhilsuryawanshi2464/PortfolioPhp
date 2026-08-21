// frontend/src/components/common/LazyImage.jsx
// Feature 4 — Image Lazy Load + Blur Placeholder
// Uses IntersectionObserver to defer loading images until they're near viewport
// Shows a shimmer blur placeholder until image loads

import { useState, useEffect, useRef } from 'react';

export default function LazyImage({
  src,
  alt = '',
  className = '',
  style = {},
  placeholder = null, // optional custom placeholder (emoji/text)
  aspectRatio = null, // e.g. "4/3" — wraps in aspect-ratio div
  onLoad = null,
}) {
  const [loaded, setLoaded]   = useState(false);
  const [inView, setInView]   = useState(false);
  const [error, setError]     = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading 200px before visible
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const imgEl = (
    <div ref={containerRef} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {/* Shimmer placeholder shown until loaded */}
      {!loaded && !error && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(90deg, rgba(99,102,241,0.04) 0%, rgba(139,92,246,0.08) 40%, rgba(99,102,241,0.04) 80%)',
            backgroundSize: '600px 100%',
            animation: 'shimmer 1.6s infinite linear',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          {placeholder && (
            <span style={{ fontSize: 32, opacity: 0.3 }}>{placeholder}</span>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: 28, opacity: 0.4 }}>{placeholder || '🖼️'}</span>
        </div>
      )}

      {/* Actual image — only src set after IntersectionObserver fires */}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => { setLoaded(true); onLoad?.(); }}
          onError={() => setError(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease, filter 0.4s ease',
            filter: loaded ? 'blur(0)' : 'blur(8px)',
            display: 'block',
          }}
        />
      )}
      <style>{`@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
    </div>
  );

  if (aspectRatio) {
    return (
      <div style={{ aspectRatio, overflow: 'hidden' }}>
        {imgEl}
      </div>
    );
  }
  return imgEl;
}
