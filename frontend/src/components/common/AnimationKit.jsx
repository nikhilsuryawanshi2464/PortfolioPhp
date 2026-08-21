// PATH: frontend/src/components/common/AnimationKit.jsx
// Drop <AnimationKit /> once in App.jsx — it handles all global animation features:
// 1. Custom cursor glow (desktop only)
// 2. Reading progress bar (top of page)
// 3. Page transition wrapper (import PageTransition separately)
// 4. Stagger reveal helper (import useStagger)

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// ─── 1. CURSOR GLOW ──────────────────────────────────────────
// Soft indigo orb that follows the cursor on desktop
export function CursorGlow() {
  const pos = useRef({ x: -200, y: -200 });
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const raf = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only on non-touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    let dot  = { x: -200, y: -200 };
    let ring = { x: -200, y: -200 };

    const loop = () => {
      // Dot snaps fast, ring lags behind
      dot.x  += (pos.current.x - dot.x)  * 0.35;
      dot.y  += (pos.current.y - dot.y)  * 0.35;
      ring.x += (pos.current.x - ring.x) * 0.12;
      ring.y += (pos.current.y - ring.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform  = `translate(${dot.x - 4}px, ${dot.y - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x - 20}px, ${ring.y - 20}px)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9990] hidden lg:block" aria-hidden>
      {/* Dot */}
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 8, height: 8, borderRadius: '50%',
        background: '#6366f1',
        opacity: visible ? 0.9 : 0,
        transition: 'opacity 0.3s',
        willChange: 'transform',
        mixBlendMode: 'difference',
      }} />
      {/* Ring */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 40, height: 40, borderRadius: '50%',
        border: '1.5px solid rgba(99,102,241,0.5)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        willChange: 'transform',
      }} />
    </div>
  );
}

// ─── 2. SCROLL PROGRESS BAR ──────────────────────────────────
// Thin indigo line at the very top showing read progress
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 3, zIndex: 9999,
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
        transformOrigin: '0%',
      }}
    />
  );
}

// ─── 3. PAGE TRANSITION WRAPPER ──────────────────────────────
// Wrap each page's root div to get smooth route transitions
export function PageTransition({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── 4. STAGGER CHILDREN REVEAL ──────────────────────────────
// Usage: wrap a list in <StaggerList> to get cascading fade-ins
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function StaggerList({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

// ─── 5. MAGNETIC BUTTON ──────────────────────────────────────
// Subtle pull-toward-cursor effect on hover
export function MagneticButton({ children, className = '', strength = 0.3, ...props }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    setPos({ x: (e.clientX - cx) * strength, y: (e.clientY - cy) * strength });
  };

  const onLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      className={className}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 0.5 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ─── 6. TEXT REVEAL (split by word) ──────────────────────────
// Usage: <TextReveal text="Hello World" className="text-4xl font-black" />
export function TextReveal({ text = '', className = '', delay = 0 }) {
  const words = text.split(' ');
  return (
    <span className={className} style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.3em' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// ─── 7. COUNT-UP NUMBER ──────────────────────────────────────
// Usage: <CountUp to={50} suffix="+" className="text-4xl font-black" />
export function CountUp({ to, suffix = '', prefix = '', duration = 1.5, className = '' }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(to / (duration * 60));
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(t); }
      else setCount(start);
    }, 1000 / 60);
    return () => clearInterval(t);
  }, [started, to, duration]);

  return <span ref={ref} className={className}>{prefix}{count}{suffix}</span>;
}

// ─── 8. FLOATING BADGE ───────────────────────────────────────
// Gentle floating animation for hero badges
export function FloatingBadge({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── 9. GRADIENT TEXT ────────────────────────────────────────
// Animated gradient text that shifts hue
export function GradientText({ children, className = '', animate = false }) {
  return (
    <motion.span
      className={`bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 ${className}`}
      animate={animate ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : {}}
      transition={animate ? { duration: 4, repeat: Infinity, ease: 'linear' } : {}}
      style={animate ? { backgroundSize: '200% 200%' } : {}}
    >
      {children}
    </motion.span>
  );
}

// ─── 10. SECTION REVEAL ──────────────────────────────────────
// Reusable scroll-triggered section entrance
export function SectionReveal({ children, className = '', direction = 'up', delay = 0 }) {
  const variants = {
    up:    { hidden: { opacity: 0, y: 40  }, show: { opacity: 1, y: 0  } },
    down:  { hidden: { opacity: 0, y: -40 }, show: { opacity: 1, y: 0  } },
    left:  { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0  } },
    right: { hidden: { opacity: 0, x: 40  }, show: { opacity: 1, x: 0  } },
    scale: { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } },
  };
  const v = variants[direction] || variants.up;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: v.hidden, show: { ...v.show, transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] } } }}
    >
      {children}
    </motion.div>
  );
}
