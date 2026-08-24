import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail, FiDownload, FiArrowRight, FiExternalLink, FiChevronLeft, FiChevronRight, FiStar, FiArrowUp } from 'react-icons/fi';
import Nav from '@components/common/Nav';
import { useProfile, useSkills, useProjects, useTestimonials, useServices } from '@hooks/useQueries';
import { useTheme } from '@contexts/ThemeContext';
import { useSettings } from '@contexts/SiteSettingsContext';
import { SectionReveal, TextReveal, CountUp, FloatingBadge, StaggerList, StaggerItem } from '@components/common/AnimationKit';
import { CodingStatus, ViewBadge } from '@components/common/LiveWidgets';
import { usePageTracking } from '@hooks/useAnalytics';
import PageLoader from '@components/common/PageLoader';
import Footer from '@components/common/Footer';
import GitHubWidget from '@components/common/GitHubWidget';
import SEO from '@components/common/SEO';
import { profileAPI } from '@services/api';

const FALLBACK_NAME = 'Nikhil Suryawanshi';
const FALLBACK_TAGLINE = 'Building scalable web applications with modern technologies. Passionate about clean architecture, great UX, and shipping fast.';

const normalizeExternalUrl = (value) => {
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('tel:')) {
    return value;
  }
  return `https://${value}`;
};

/* ─── Typewriter ─────────────────────────────────────────── */
const useTypewriter = (words, speed = 80, pause = 2000) => {
  const [display, setDisplay] = useState('');
  const [wIdx, setWIdx] = useState(0);
  const [cIdx, setCIdx] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[wIdx];
    const t = setTimeout(() => {
      if (!del) {
        setDisplay(word.slice(0, cIdx + 1));
        if (cIdx + 1 === word.length) setTimeout(() => setDel(true), pause);
        else setCIdx(c => c + 1);
      } else {
        setDisplay(word.slice(0, cIdx - 1));
        if (cIdx === 0) { setDel(false); setWIdx(i => (i + 1) % words.length); }
        else setCIdx(c => c - 1);
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [cIdx, del, wIdx, words, speed, pause]);
  return display;
};

/* ─── Particles ──────────────────────────────────────────── */
const Particle = ({ delay, x, size, color }) => (
  <motion.div className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, bottom: '-20px', width: size, height: size, background: color }}
    animate={{ y: [0, -900], opacity: [0, 0.5, 0] }}
    transition={{ duration: 8 + Math.random() * 4, repeat: Infinity, delay, ease: 'linear' }} />
);

/* ─── StatCounter ────────────────────────────────────────── */
const StatCounter = ({ value, label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(value / 40);
    const t = setInterval(() => { start += step; if (start >= value) { setCount(value); clearInterval(t); } else setCount(start); }, 30);
    return () => clearInterval(t);
  }, [visible, value]);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black text-slate-900 dark:text-white">{count}+</div>
      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</div>
    </div>
  );
};

/* ─── SkillCard ──────────────────────────────────────────── */

const SkillCard = ({ skill, delay }) => {
  const { isDark } = useTheme();
  const color = skill.color || '#6366f1';

  // Use dark icon in dark mode if available, otherwise fall back to light icon
  const iconUrl = isDark
    ? (skill.iconDark?.url || skill.icon?.url || '')
    : (skill.icon?.url || skill.iconDark?.url || '');

  // Icon box background — dark bg for dark mode, light bg for light mode
  const iconBg     = isDark ? '#1e293b' : '#f1f5f9';
  const iconBorder = isDark ? '#334155' : '#e2e8f0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="group relative rounded-2xl p-5 text-center cursor-default overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at center, ${color}15, transparent 70%)` }}
      />

      {/* Icon box */}
      <div className="flex items-center justify-center mb-3" style={{ height: 56 }}>
        {iconUrl ? (
          <div style={{
            background: iconBg,
            borderRadius: '12px',
            padding: '8px',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${iconBorder}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'background 0.3s, border-color 0.3s',
          }}>
            <img
              src={iconUrl}
              alt={skill.name}
              style={{ width: 36, height: 36, objectFit: 'contain' }}
              onError={e => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        ) : (
          <div style={{
            background: iconBg,
            borderRadius: '12px',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            border: `1px solid ${iconBorder}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>⚡</div>
        )}
      </div>

      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {skill.name}
      </p>

      {skill.proficiency > 0 && (
        <div className="mt-2 h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${skill.proficiency}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
      )}

      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
        style={{ background: color }}
      />
    </motion.div>
  );
};

/* ─── GRADIENTS ──────────────────────────────────────────── */
const GRADIENTS = [
  'from-violet-600 to-indigo-600','from-cyan-600 to-blue-600','from-rose-600 to-pink-600',
  'from-emerald-600 to-teal-600','from-orange-600 to-rose-600','from-amber-500 to-orange-600',
];

/* ─── ProjectCard (with mini carousel) ──────────────────── */
const ProjectCard = ({ project, idx, delay }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const images = [
    ...(project.thumbnail?.url ? [{ url: project.thumbnail.url }] : []),
    ...(project.images || []),
  ];
  const activeImage = images[imgIdx] || {};
  const activeTitle = activeImage.title || project.title;
  const activeDescription = activeImage.description || activeImage.caption || project.description;
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setImgIdx(i => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, delay }} whileHover={{ y: -10 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
      <div className={`h-44 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} relative overflow-hidden`}>
        <AnimatePresence mode="wait">
          {images.length > 0 && (
            <motion.img key={imgIdx} src={images[imgIdx].url} alt={project.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-3">
            {project.links?.github && <a href={normalizeExternalUrl(project.links.github)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 bg-white/20 backdrop-blur rounded-lg text-white"><FiGithub /></a>}
            {project.links?.live && <a href={normalizeExternalUrl(project.links.live)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 bg-white/20 backdrop-blur rounded-lg text-white"><FiExternalLink /></a>}
          </div>
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => <div key={i} className={`rounded-full transition-all ${i === imgIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`} />)}
          </div>
        )}
      </div>
      <div className="p-5 space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{activeTitle}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed min-h-[3.5rem]">{activeDescription}</p>
        <div className="flex flex-wrap gap-2">
          {(project.technologies || []).slice(0, 3).map(t => (
            <span key={t} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-xs font-medium">{t}</span>
          ))}
        </div>
        <Link to={`/projects/${project.slug}`} className="flex items-center justify-center gap-1 w-full py-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:gap-2 transition-all">
          View Details <FiArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};

/* ─── Stars ──────────────────────────────────────────────── */
const Stars = ({ n = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <FiStar key={i} size={14} className={i < n ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
    ))}
  </div>
);

/* ─── TestimonialsCarousel ───────────────────────────────── */
const TestimonialsCarousel = ({ items }) => {
  const [idx, setIdx] = useState(0);
  const total = items.length;
  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);
  const go = (n) => setIdx((n + total) % total);

  return (
    <div className="relative max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-sm dark:shadow-none text-center">
          {items[idx].avatar && (
            <img src={items[idx].avatar} alt={items[idx].name}
              className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-2 border-indigo-200 dark:border-indigo-500/30" />
          )}
          {!items[idx].avatar && (
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-2xl font-black text-indigo-600 dark:text-indigo-300">
              {items[idx].name?.[0]?.toUpperCase()}
            </div>
          )}
          <Stars n={items[idx].rating || 5} />
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic mt-4 mb-6">
            "{items[idx].quote}"
          </p>
          <div className="font-bold text-slate-900 dark:text-white">{items[idx].name}</div>
          {(items[idx].role || items[idx].company) && (
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {items[idx].role}{items[idx].role && items[idx].company && ' · '}{items[idx].company}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {total > 1 && (
        <>
          <button onClick={() => go(idx - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:text-indigo-600 transition-all shadow-sm">
            <FiChevronLeft size={18} />
          </button>
          <button onClick={() => go(idx + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:text-indigo-600 transition-all shadow-sm">
            <FiChevronRight size={18} />
          </button>
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-indigo-600' : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-indigo-400'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ─── ServiceCard ────────────────────────────────────────── */
const ServiceCard = ({ service, delay }) => {
  const fmtPrice = () => {
    if (!service.priceType || service.priceType === 'contact') return 'Contact for Pricing';
    const sym = service.currency === 'INR' ? '₹' : service.currency === 'EUR' ? '€' : '$';
    const sfx = { hourly: '/hr', monthly: '/mo', fixed: '' }[service.priceType] || '';
    if (service.priceFrom && service.priceTo) return `${sym}${service.priceFrom}–${sym}${service.priceTo}${sfx}`;
    if (service.priceFrom) return `From ${sym}${service.priceFrom}${sfx}`;
    return 'Contact for Pricing';
  };
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, delay }} whileHover={{ y: -8 }}
      className={`relative flex flex-col bg-white dark:bg-white/[0.03] border rounded-2xl p-8 shadow-sm dark:shadow-none transition-all duration-300 ${
        service.popular
          ? 'border-indigo-400 dark:border-indigo-500/60 shadow-lg shadow-indigo-600/10'
          : 'border-slate-200 dark:border-white/10'
      }`}>
      {service.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-600/30">
          MOST POPULAR
        </div>
      )}
      <div className="text-4xl mb-4">{service.icon || '💼'}</div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{service.title}</h3>
      <div className={`text-lg font-bold mb-4 ${service.popular ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
        {fmtPrice()}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{service.description}</p>
      {service.features?.length > 0 && (
        <ul className="space-y-2.5 mb-8 flex-1">
          {service.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      )}
      <Link to={service.ctaLink || '/contact'}
        className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
          service.popular
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
            : 'bg-slate-50 dark:bg-white/5 hover:bg-indigo-600 dark:hover:bg-indigo-600 border border-slate-200 dark:border-white/10 hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:text-white'
        }`}>
        {service.cta || 'Get in Touch'}
      </Link>
    </motion.div>
  );
};

/* ─── MAIN PAGE ──────────────────────────────────────────── */
const WORDS = ['Full-Stack Developer', 'React Specialist', 'API Architect', 'UI/UX Enthusiast', 'Problem Solver'];

const particles = Array.from({ length: 15 }, (_, i) => ({
  delay: i * 0.6, x: Math.random() * 100,
  size: Math.random() * 4 + 2,
  color: ['#6366f1','#8b5cf6','#3b82f6','#06b6d4'][i % 4],
}));

const codeLines = [
  { indent: 0, parts: [{ lc: '#c792ea', t: 'const ' }, { lc: '#82aaff', t: 'developer' }, { lc: '#89ddff', t: ' = {' }] },
  { indent: 1, parts: [{ lc: '#f78c6c', t: 'name' }, { lc: '#89ddff', t: ': ' }, { lc: '#c3e88d', t: '"Nikhil Suryawanshi",' }] },
  { indent: 1, parts: [{ lc: '#f78c6c', t: 'stack' }, { lc: '#89ddff', t: ': ' }, { lc: '#c3e88d', t: '"Full-Stack Developer",' }] },
  { indent: 1, parts: [{ lc: '#f78c6c', t: 'available' }, { lc: '#89ddff', t: ': ' }, { lc: '#ff9cac', t: 'true,' }] },
  { indent: 1, parts: [{ lc: '#f78c6c', t: 'passion' }, { lc: '#89ddff', t: ': ' }, { lc: '#c3e88d', t: '"building"' }] },
  { indent: 0, parts: [{ lc: '#89ddff', t: '}' }] },
];

export default function HomePage() {
  const [allowPageRender, setAllowPageRender] = useState(false);
  const typed = useTypewriter(WORDS);
  const heroRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
    const rawX = useSpring(0, { stiffness: 80, damping: 30 });
  const rawY = useSpring(0, { stiffness: 80, damping: 30 });


  const { data: profile,          isLoading: loadingProfile   } = useProfile();
  const { data: skills = [],      isLoading: loadingSkills    } = useSkills();
  const { data: featuredProjects = [], isLoading: loadingProjects } = useProjects({ featured: true, published: true, limit: 6 });
  const { data: allProjects = [] } = useProjects({ published: true });
  const { data: testimonials = [], isLoading: loadingTestimonials } = useTestimonials();
  const { data: services = [],    isLoading: loadingServices  } = useServices();

  // Site settings for OpenToWork banner
  const { settings } = useSettings();

  // dataLoaded = all queries finished (success or error)
  const dataLoaded = !loadingSkills && !loadingProjects && !loadingProfile && !loadingTestimonials && !loadingServices;
  // Don't block the whole page on every query when the backend is waking up.
  const appReady   = allowPageRender || dataLoaded || !loadingProfile;
  const displayName = profile?.name || settings?.ownerName || FALLBACK_NAME;
  const [firstName, ...remainingNameParts] = displayName.split(' ');
  const heroFirstName = firstName || 'Nikhil';
  const heroSecondLine = remainingNameParts.join(' ') || 'Developer';

  // Track page views
  usePageTracking();

  // Back to top button
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMouse = (e) => { rawX.set(e.clientX * 0.015); rawY.set(e.clientY * 0.015); };
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, [rawX, rawY]);

  useEffect(() => {
    const timer = setTimeout(() => setAllowPageRender(true), 1200);
    return () => clearTimeout(timer);
  }, []);


  // SEO data
  const seoDescription = (profile?.bio || profile?.tagline || FALLBACK_TAGLINE).slice(0, 155);

  return (
    <>
      <PageLoader isLoading={!appReady} />

      {/* SEO */}
      <SEO
        page="home"
        title={displayName}
        description={seoDescription}
        image={profile?.avatar}
        type="profile"
      />

      {/* Open to Work banner */}
      {/* {settings?.availableForWork !== false && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9998,
          background: 'linear-gradient(90deg, #10b981, #059669)',
          color: '#fff', textAlign: 'center', fontSize: 13, fontWeight: 600,
          padding: '6px 16px', letterSpacing: '0.02em',
        }}>
          🟢 Available for new projects & opportunities —{' '}
          <a href="/contact" style={{ color: '#fff', textDecoration: 'underline' }}>Let's talk</a>
        </div>
      )} */}

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed', bottom: 28, right: 24, zIndex: 9997,
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Back to top"
          >
            <FiArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(99,102,241,0.04) 0%,
            rgba(139,92,246,0.10) 40%,
            rgba(99,102,241,0.04) 80%
          );
          background-size: 600px 100%;
          animation: shimmer 1.6s infinite linear;
        }
        .dark .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.03) 0%,
            rgba(255,255,255,0.08) 40%,
            rgba(255,255,255,0.03) 80%
          );
          background-size: 600px 100%;
          animation: shimmer 1.6s infinite linear;
        }
      `}</style>

    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* Mouse glow */}
      <motion.div className="fixed w-64 h-64 rounded-full pointer-events-none z-0 blur-3xl opacity-0 dark:opacity-10 transition-opacity"
        style={{ background: 'radial-gradient(circle,#6366f1,transparent)', x: rawX, y: rawY }} />

      <Nav active="Home" />

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-violet-200/30 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-7xl mx-auto w-full z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center pt-24">

            {/* ── LEFT — text ── */}
            <div className="space-y-8">
              {/* Available badge */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-full text-indigo-600 dark:text-indigo-300 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
                </span>
                {profile?.availableForWork !== false ? 'Available for work' : 'Not available'}
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
                <CodingStatus name={heroFirstName} />
              </motion.div>

              {/* Name / Title */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-2">
                <div className="text-slate-500 text-lg font-medium">Hi, I'm</div>
                <h1 className="text-6xl lg:text-7xl font-black leading-none tracking-tight">
                  <span className="block text-slate-900 dark:text-white">{heroFirstName}</span>
                  <span className="block bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    {heroSecondLine}
                  </span>
                </h1>
                <div className="h-12 flex items-center">
                  <span className="text-xl text-slate-500 dark:text-slate-400">
                    {typed}<span className="ml-0.5 border-r-2 border-indigo-500 animate-pulse">&nbsp;</span>
                  </span>
                </div>
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
                className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-lg">
                {profile?.tagline || FALLBACK_TAGLINE}
              </motion.p>

              {/* CTA buttons */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="flex flex-wrap gap-4">
                <Link to="/projects" className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/30">
                  View Projects <FiArrowRight />
                </Link>
                {profile?.resume?.url && (
                  <a href={profileAPI.getResumeDownloadUrl()} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold rounded-xl transition-all shadow-sm dark:shadow-none">
                    <FiDownload className="text-indigo-500 dark:text-indigo-400" /> Resume
                  </a>
                )}
              </motion.div>

              {/* Social icons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} className="flex gap-3 pt-2">
                {[
                  { icon: <FiGithub size={18} />, href: profile?.social?.github || '#', label: 'GitHub' },
                  { icon: <FiLinkedin size={18} />, href: profile?.social?.linkedin || '#', label: 'LinkedIn' },
                  { icon: <FiMail size={18} />, href: `mailto:${profile?.contactEmail || '#'}`, label: 'Email' },
                ].map(({ icon, href, label }) => (
                  <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white dark:bg-white/5 hover:bg-indigo-600 dark:hover:bg-indigo-600 border border-slate-200 dark:border-white/10 hover:border-indigo-500 rounded-xl text-slate-500 dark:text-slate-400 hover:text-white transition-all shadow-sm dark:shadow-none" title={label}>
                    {icon}
                  </motion.a>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT — Profile Photo or Code Card ── */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} className="relative flex justify-center">
              {profile?.avatar ? (
                /* REAL PHOTO — animated, floating, gradient border */
                <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="relative">
                  {/* Glow behind photo */}
                  <div className="absolute -inset-6 bg-gradient-to-br from-indigo-400/30 via-violet-400/20 to-cyan-400/20 dark:from-indigo-600/40 dark:via-violet-600/30 dark:to-cyan-600/20 rounded-full blur-2xl" />
                  {/* Spinning gradient ring */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-2 rounded-full"
                    style={{ background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)', padding: 3 }}>
                    <div className="w-full h-full rounded-full bg-slate-50 dark:bg-[#060612]" />
                  </motion.div>
                  {/* Photo */}
                  <div className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-white dark:border-[#0d0d1f] shadow-2xl">
                    <img src={profile.avatar} alt={profile.name || 'Profile'} className="w-full h-full object-cover object-top" />
                  </div>
                  {/* Floating badges */}
                  <motion.div animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }} transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute -top-4 -right-4 px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-600/40">
                    🚀 {profile?.availableForWork !== false ? 'Open to Work' : 'Busy Building'}
                  </motion.div>
                  <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.8 }}
                    className="absolute -bottom-4 -left-4 px-4 py-2 bg-white dark:bg-[#0d0d1f] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium shadow-xl text-slate-700 dark:text-white">
                    <span className="text-green-500">✓</span> {profile?.yearsOfExperience || 5}+ Years Exp
                  </motion.div>
                </motion.div>
              ) : (
                /* CODE CARD fallback if no photo */
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="relative w-full max-w-md">
                  <div className="absolute -inset-4 bg-indigo-300/20 dark:bg-indigo-600/30 rounded-3xl blur-2xl" />
                  <div className="relative bg-white dark:bg-[#0d0d1f] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                      <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="ml-3 text-xs text-slate-400 font-mono">portfolio.jsx</span>
                    </div>
                    <div className="p-6 font-mono text-sm space-y-1.5">
                      {codeLines.map((line, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.12 }} className="flex">
                          <span className="text-slate-300 dark:text-slate-600 w-6 text-right mr-4 select-none">{i + 1}</span>
                          <span style={{ paddingLeft: `${line.indent * 16}px` }}>
                            {line.parts.map((p, j) => <span key={j} style={{ color: p.lc }}>{p.t}</span>)}
                          </span>
                        </motion.div>
                      ))}
                      <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="flex">
                        <span className="text-slate-300 dark:text-slate-600 w-6 text-right mr-4">7</span>
                        <span className="border-l-2 border-indigo-500 h-5" />
                      </motion.div>
                    </div>
                  </div>
                  <motion.div animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-4 -right-4 px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-600/40">🚀 Open to Work</motion.div>
                  <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                    className="absolute -bottom-4 -left-4 px-4 py-2 bg-white dark:bg-[#0d0d1f] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium shadow-xl text-slate-700 dark:text-white">
                    <span className="text-green-500">✓</span> 5+ Years Exp
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 text-xs">
          <span>Scroll</span><div className="w-px h-8 bg-gradient-to-b from-slate-400 to-transparent" />
        </motion.div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════ */}
      <section className="py-16 border-y border-slate-200 dark:border-white/5 bg-white dark:bg-transparent transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter value={profile?.yearsOfExperience || 5} label="Years Experience" />
          <StatCounter value={allProjects.length > 0 ? allProjects.length : 10} label="Projects Shipped" />
          <StatCounter value={testimonials.length > 0 ? testimonials.length : 20} label="Happy Clients" />
          <StatCounter value={skills.length > 0 ? skills.length : 12} label="Technologies Mastered" />
        </div>
      </section>

      {/* ══ SKILLS ══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 space-y-3">
            <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase">Skills</div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white">My Tech Stack</h2>
            <p className="text-slate-500">Tools & technologies I use to build production apps</p>
          </motion.div>
           {!dataLoaded ? (
            // ── Shimmer skeleton for skills ──
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  {/* Icon placeholder */}
                  <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 rounded-xl shimmer bg-slate-100 dark:bg-white/5" />
                  </div>
                  {/* Name placeholder */}
                  <div className="h-3 w-3/4 mx-auto rounded-full shimmer bg-slate-100 dark:bg-white/5 mb-2" />
                  {/* Progress bar placeholder */}
                  <div className="h-1 w-full rounded-full shimmer bg-slate-100 dark:bg-white/5" />
                </div>
              ))}
            </div>
          ) : skills.length === 0 ? null : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {skills.map((s, i) => <SkillCard key={s._id} skill={s} delay={i * 0.05} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══ FEATURED PROJECTS ═══════════════════════════════ */}
      <section className="py-24 px-4 bg-slate-100/60 dark:bg-white/[0.02] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 space-y-3">
            <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase">Work</div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white">Featured Projects</h2>
            <p className="text-slate-500">A selection of projects I'm proud of</p>
          </motion.div>
            {!dataLoaded ? (
            // ── Shimmer skeleton for projects ──
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  {/* Image area */}
                  <div className="h-44 shimmer bg-slate-100 dark:bg-white/5" />
                  <div className="p-5 space-y-3">
                    {/* Title */}
                    <div className="h-4 w-2/3 rounded-full shimmer bg-slate-100 dark:bg-white/5" />
                    {/* Description lines */}
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded-full shimmer bg-slate-100 dark:bg-white/5" />
                      <div className="h-3 w-4/5 rounded-full shimmer bg-slate-100 dark:bg-white/5" />
                      <div className="h-3 w-3/5 rounded-full shimmer bg-slate-100 dark:bg-white/5" />
                    </div>
                    {/* Tags */}
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full shimmer bg-slate-100 dark:bg-white/5" />
                      <div className="h-6 w-20 rounded-full shimmer bg-slate-100 dark:bg-white/5" />
                      <div className="h-6 w-14 rounded-full shimmer bg-slate-100 dark:bg-white/5" />
                    </div>
                    {/* Button */}
                    <div className="h-8 w-full rounded-xl shimmer bg-slate-100 dark:bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProjects.length === 0 ? null : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {featuredProjects.map((p, i) => <ProjectCard key={p._id} project={p} idx={i} delay={i * 0.1} />)}
            </div>
          )}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <Link to="/projects" className="inline-flex items-center gap-2 px-7 py-3.5 border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-600/10 text-slate-700 dark:text-white rounded-xl transition-all font-semibold">
              All Projects <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ SERVICES ════════════════════════════════════════ */}
      {services.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 space-y-3">
              <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase">Services</div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">What I Offer</h2>
              <p className="text-slate-500">Hire me for your next project</p>
            </motion.div>
            <div className={`grid gap-8 ${services.length === 1 ? 'max-w-md mx-auto' : services.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {services.map((s, i) => <ServiceCard key={s._id} service={s} delay={i * 0.1} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ TESTIMONIALS ════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section className="py-24 px-4 bg-slate-100/60 dark:bg-white/[0.02] transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 space-y-3">
              <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase">Testimonials</div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">What Clients Say</h2>
              <p className="text-slate-500">Kind words from people I've worked with</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <TestimonialsCarousel items={testimonials} />
            </motion.div>
          </div>
        </section>
      )}

      <GitHubWidget />

      {/* ══ CTA ═════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-600/20 dark:to-violet-600/20 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-12 text-center overflow-hidden transition-colors duration-300">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-200/50 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative space-y-6">
              <div className="text-5xl">👋</div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Let's Build Something</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">Have an idea or a position in mind? I'd love to hear about it.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/30">
                  <FiMail /> Get In Touch
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}
