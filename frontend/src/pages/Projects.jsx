import { useState, useRef, useCallback, useEffect  } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FiSearch, FiGithub, FiExternalLink, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Nav from '@components/common/Nav';
import Footer from '@components/common/Footer';
import SEO from '@components/common/SEO';
import { useProjects } from '@hooks/useQueries';
import { usePageTracking } from '@hooks/useAnalytics';

const GRADIENTS = [
  'from-violet-600 to-indigo-600','from-cyan-600 to-blue-600','from-rose-600 to-pink-600',
  'from-emerald-600 to-teal-600','from-orange-600 to-rose-600','from-amber-500 to-orange-600',
];
const normalizeExternalUrl = (value) => {
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('tel:')) {
    return value;
  }
  return `https://${value}`;
};

/* ─────────────────────────────────────────────────────────────
   CARD CAROUSEL — auto-slides, pauses on hover
───────────────────────────────────────────────────────────── */
function CardCarousel({ images, gradient, hovered, idx, setIdx }) {
  const timerRef        = useRef(null);
  const total           = images.length;

  const go = useCallback((n) => setIdx((n + total) % total), [setIdx, total]);

  useEffect(() => {
    if (total <= 1) return;
    // Always auto-play — pause only on hover (hovered prop stops the interval)
    if (hovered) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % total), 2800);
    return () => clearInterval(timerRef.current);
  }, [total, hovered]);

  // Reset to first image when card is no longer hovered
  useEffect(() => {
    if (!hovered) setIdx(0);
  }, [hovered]);

  if (!total) return (
    <div className={`h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <span className="text-white/20 text-6xl font-black select-none">&lt;/&gt;</span>
    </div>
  );

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={images[idx].url}
          alt={images[idx].caption || `Screenshot ${idx + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      {/* Dot indicators — only show when multiple images */}
      {total > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <div key={i}
              className={`rounded-full transition-all duration-300 ${i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`} />
          ))}
        </div>
      )}

      {/* Arrow buttons on hover */}
      {total > 1 && hovered && (
        <>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); go(idx - 1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-lg z-10 hover:bg-black/80 transition-colors">
            <FiChevronLeft size={16} />
          </button>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); go(idx + 1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-lg z-10 hover:bg-black/80 transition-colors">
            <FiChevronRight size={16} />
          </button>
        </>
      )}

      {/* Image counter badge */}
      {total > 1 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs font-bold rounded-md z-10">
          {idx + 1}/{total}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROJECT CARD
───────────────────────────────────────────────────────────── */
const ProjectCard = ({ project, index }) => {
  const [hovered, setHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Build image list: thumbnail first, then gallery images
  const images = [
    ...(project.thumbnail?.url ? [{ url: project.thumbnail.url, caption: project.title }] : []),
    ...(project.images || []),
  ];

  const gradient = GRADIENTS[index % GRADIENTS.length];
  const activeImage = images[activeImageIndex] || {};
  const activeTitle = activeImage.title || project.title;
  const activeDescription = activeImage.description || activeImage.caption || project.description;

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm dark:shadow-none transition-colors duration-300">

      {/* ── Image / Carousel area ── */}
      <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <CardCarousel
          images={images}
          gradient={gradient}
          hovered={hovered}
          idx={activeImageIndex}
          setIdx={setActiveImageIndex}
        />

        {/* Overlay on hover — show GitHub/Live links */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          {project.links?.github && (
            <motion.a href={normalizeExternalUrl(project.links.github)} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="p-3 bg-black/50 backdrop-blur border border-white/20 rounded-xl text-white hover:bg-black/70 transition-colors">
              <FiGithub size={18} />
            </motion.a>
          )}
          {project.links?.live && (
            <motion.a href={normalizeExternalUrl(project.links.live)} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="p-3 bg-black/50 backdrop-blur border border-white/20 rounded-xl text-white hover:bg-black/70 transition-colors">
              <FiExternalLink size={18} />
            </motion.a>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm bg-black/40 border border-white/20 text-white">
            {(project.category || 'web').toUpperCase()}
          </span>
        </div>

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-3 right-3 z-20">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-600/80 backdrop-blur text-white">⭐ Featured</span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-tight">
          {activeTitle}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed min-h-[3.5rem]">
          {activeDescription}
        </p>
        <div className="flex flex-wrap gap-2">
          {(project.technologies || []).slice(0, 4).map(tag => (
            <span key={tag} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
          {(project.technologies || []).length > 4 && (
            <span className="px-3 py-1 bg-slate-50 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 rounded-full text-xs">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
        {project.links?.demo && (
          <a
            href={normalizeExternalUrl(project.links.demo)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-300 hover:text-rose-500 dark:hover:text-rose-200 transition-colors"
          >
            Watch Demo Video <FiArrowRight size={14} />
          </a>
        )}
        <Link to={`/projects/${project.slug}`}
          className="block w-full text-center py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-indigo-600 dark:hover:bg-indigo-600 border border-slate-200 dark:border-white/10 hover:border-indigo-500 text-slate-600 dark:text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition-all">
          View Details →
        </Link>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   PROJECTS PAGE
───────────────────────────────────────────────────────────── */
const ProjectsPage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFocused, setSearchFocused]   = useState(false);
 
  const { data: projects = [], isLoading: loading } = useProjects({ published: true, limit: 100 });
  usePageTracking();

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  const filtered = projects.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (p.technologies || []).some(t => t.toLowerCase().includes(q));
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      <Nav active="Projects" />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[50vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-200/40 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-200/30 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center pt-24 pb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-full text-indigo-600 dark:text-indigo-300 text-sm mb-6">
            🚀 {loading ? '...' : `${projects.length} Projects & Counting`}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16,1,0.3,1] }}
            className="text-6xl lg:text-7xl font-black leading-none tracking-tight mb-4">
            <span className="block text-slate-900 dark:text-white">My</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">Projects</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="text-slate-500 text-xl max-w-lg mx-auto">
            Real projects, built and shipped.
          </motion.p>
        </motion.div>
      </section>

      {/* ══ FILTER BAR ════════════════════════════════════════ */}
      <div className="sticky top-20 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex flex-col md:flex-row gap-4 items-center bg-white/90 dark:bg-[#060612]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm transition-colors duration-300">
            <div className={`relative flex-1 max-w-sm w-full transition-all ${searchFocused ? 'max-w-md' : ''}`}>
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search projects, tech, tags..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm outline-none transition-all
                  ${searchFocused ? 'bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-400' : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10'}`} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <motion.button key={cat} onClick={() => setSelectedCategory(cat)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'}`}>
                  {cat === 'ai-ml' ? 'AI/ML' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.button>
              ))}
            </div>
            <div className="text-slate-400 text-sm whitespace-nowrap">
              <span className="text-slate-900 dark:text-white font-bold">{filtered.length}</span> project{filtered.length !== 1 ? 's' : ''}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══ GRID ══════════════════════════════════════════════ */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <div className="h-48 bg-slate-100 dark:bg-white/5 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-slate-100 dark:bg-white/5 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                    <div className="h-4 bg-slate-100 dark:bg-white/5 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-24 space-y-4">
                  <div className="text-6xl">{projects.length === 0 ? '◈' : '🔍'}</div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {projects.length === 0 ? 'No projects yet' : 'No projects found'}
                  </p>
                  {projects.length === 0
                    ? <p className="text-slate-500">Go to <a href="/admin/projects/new" className="text-indigo-500 underline">Admin → Add Project</a> to create your first project</p>
                    : <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">Clear Filters</button>
                  }
                </motion.div>
              ) : (
                <motion.div key="grid" layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((project, i) => <ProjectCard key={project._id} project={project} index={i} />)}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-600/20 dark:to-violet-600/20 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-12 text-center overflow-hidden transition-colors duration-300">
            <div className="relative space-y-5">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Have a project idea?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">I'm always looking for exciting projects. Let's build something great together.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
                Start a Project <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <Footer />
    </div>
  );
};

export default ProjectsPage;
