import { useRef, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiGithub, FiExternalLink, FiChevronLeft, FiChevronRight, FiX, FiMaximize2 } from 'react-icons/fi';
import Nav from '@components/common/Nav';
import Footer from '@components/common/Footer';
import SEO from '@components/common/SEO';
import { useProjectBySlug, useRelatedProjects } from '@hooks/useQueries';
import SocialShareBar from '@components/common/SocialShareBar';
import CaseStudySection from '@components/common/CaseStudySection';
import { ViewBadge } from '@components/common/LiveWidgets';
import { usePageTracking, useProjectTracking } from '@hooks/useAnalytics';

const GRADIENTS = ['from-violet-600 to-indigo-600','from-cyan-600 to-blue-600','from-rose-600 to-pink-600','from-emerald-600 to-teal-600','from-orange-600 to-rose-600','from-amber-500 to-orange-600'];
const normalizeExternalUrl = (value) => {
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('tel:')) {
    return value;
  }
  return `https://${value}`;
};

/* ── Auto-sliding Carousel ─────────────────────────────────── */
function Carousel({ images = [], gradient = GRADIENTS[0], height = 'h-80 md:h-[480px]', interval = 3500, showThumbs = false }) {
  const [idx, setIdx]       = useState(0);
  const [lightbox, setLbox] = useState(null);
  const timerRef            = useRef(null);
  const total               = images.length;

  const go = useCallback((n) => setIdx((n + total) % total), [total]);

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % total), interval);
    return () => clearInterval(timerRef.current);
  }, [total, interval]);

  const bump = (n) => {
    clearInterval(timerRef.current);
    go(n);
    if (total > 1) timerRef.current = setInterval(() => setIdx(i => (i + 1) % total), interval);
  };

  if (!total) return (
    <div className={`${height} bg-gradient-to-br ${gradient} flex items-center justify-center rounded-2xl`}>
      <span className="text-white/20 text-8xl font-black select-none">&lt;/&gt;</span>
    </div>
  );

  return (
    <>
      <div className={`relative ${height} overflow-hidden rounded-2xl group bg-black`}>
        <AnimatePresence mode="wait">
          <motion.img key={idx} src={images[idx].url} alt={images[idx].caption || `Slide ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }} />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        {images[idx].caption && (
          <div className="absolute bottom-12 left-4 right-4 text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg max-w-max">
            {images[idx].caption}
          </div>
        )}
        {total > 1 && <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded-lg">{idx + 1} / {total}</div>}
        <button onClick={() => setLbox(idx)} className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><FiMaximize2 size={15} /></button>
        {total > 1 && (
          <>
            <button onClick={() => bump(idx - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all"><FiChevronLeft size={22} /></button>
            <button onClick={() => bump(idx + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all"><FiChevronRight size={22} /></button>
          </>
        )}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => <button key={i} onClick={() => bump(i)} className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />)}
          </div>
        )}
      </div>

      {showThumbs && total > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => bump(i)} className={`flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-indigo-400 scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLbox(null)}>
            <button className="absolute top-5 right-5 p-2 text-white/60 hover:text-white"><FiX size={26} /></button>
            {total > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); const n=(lightbox-1+total)%total; go(n); setLbox(n); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/25 text-white rounded-xl"><FiChevronLeft size={26} /></button>
                <button onClick={e => { e.stopPropagation(); const n=(lightbox+1)%total; go(n); setLbox(n); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/25 text-white rounded-xl"><FiChevronRight size={26} /></button>
              </>
            )}
            <motion.img key={lightbox} src={images[lightbox]?.url} alt="" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
            {images[lightbox]?.caption && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/60 px-4 py-2 rounded-lg">{images[lightbox].caption}</div>}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm">{lightbox + 1} / {total}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── MAIN ──────────────────────────────────────────────────── */
const ProjectDetailPage = () => {
  const { slug }  = useParams();
  const heroRef   = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY     = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { data: project, isLoading: loading, isError } = useProjectBySlug(slug);
  const { data: related = [] } = useRelatedProjects(project?._id);
  const notFound = isError || (!loading && !project);
  usePageTracking();
  useProjectTracking(project?._id);

  const carouselImages = project ? [
    ...(project.thumbnail?.url ? [{ url: project.thumbnail.url, caption: '' }] : []),
    ...(project.images || []),
  ] : [];

  const gradientClass = GRADIENTS[Math.abs((slug?.charCodeAt(0) || 0) + (slug?.charCodeAt(1) || 0)) % GRADIENTS.length];
  const year = project ? new Date(project.publishedAt || project.createdAt).getFullYear() : '';

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] transition-colors duration-300">
      <Nav active="Projects" />
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading project...</p>
      </div>
    </div>
  );

  if (notFound || !project) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] transition-colors duration-300">
      <Nav active="Projects" />
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-5">
        <div className="text-6xl">🔍</div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Project not found</h2>
        <p className="text-slate-500">This project doesn't exist or isn't published yet.</p>
        <Link to="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors"><FiArrowLeft /> Back to Projects</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      <Nav active="Projects" />

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[52vh] flex items-end px-4 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage:'linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)',backgroundSize:'60px 60px' }} />
        {project.thumbnail?.url && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={project.thumbnail.url} alt="" className="w-full h-full object-cover blur-md scale-110 opacity-20 dark:opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/70 to-slate-50 dark:from-[#060612]/60 dark:to-[#060612]" />
          </div>
        )}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 dark:opacity-20`} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-4xl mx-auto w-full z-10 pt-28">
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}>
            <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 group">
              <motion.span animate={{ x:[0,-4,0] }} transition={{ repeat:Infinity, duration:1.5 }}><FiArrowLeft /></motion.span> Back to Projects
            </Link>
          </motion.div>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="flex flex-wrap gap-3 mb-4">
            {(project.metrics?.views || project.views || 0) > 0 && <ViewBadge count={project.metrics?.views || project.views} className="text-white/70" />}
            {project.category && <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full uppercase tracking-widest">{project.category}</span>}
            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-full">{year}</span>
            {carouselImages.length > 0 && <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs rounded-full">📸 {carouselImages.length} image{carouselImages.length!==1?'s':''}</span>}
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2, ease:[0.16,1,0.3,1] }}
            className="text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-3 text-slate-900 dark:text-white">{project.title}</motion.h1>
          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
            className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl leading-relaxed">{project.description}</motion.p>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }} className="flex flex-wrap gap-3">
            {project.links?.github && <a href={normalizeExternalUrl(project.links.github)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:opacity-85 transition shadow-lg"><FiGithub size={16} /> View Code</a>}
            {project.links?.live && <a href={normalizeExternalUrl(project.links.live)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/25"><FiExternalLink size={16} /> Live Demo</a>}
            {project.links?.demo && <a href={normalizeExternalUrl(project.links.demo)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition shadow-lg shadow-rose-600/25"><FiExternalLink size={16} /> Demo Video</a>}
          </motion.div>
        </motion.div>
      </section>

      {/* CONTENT */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Carousel */}
          <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }}
            className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl dark:shadow-none">
            <Carousel images={carouselImages} gradient={gradientClass} height="h-72 md:h-[460px]" interval={3500} showThumbs={carouselImages.length > 1} />
          </motion.div>

          {/* Overview */}
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}
            className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-5"><div className="w-1 h-7 bg-gradient-to-b from-indigo-600 to-violet-500 rounded-full" /><h2 className="text-2xl font-black">Project Overview</h2></div>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed whitespace-pre-wrap">{project.content || project.description}</p>
          </motion.div>

          {/* Tech + Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}
              className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-6"><div className="w-1 h-7 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" /><h3 className="text-xl font-black">Technologies</h3></div>
              <div className="flex flex-wrap gap-3 mb-6">
                {(project.technologies || []).map((tech, i) => (
                  <motion.span key={tech} initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay:i*0.06 }} whileHover={{ y:-2 }}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-sm font-semibold">{tech}</motion.span>
                ))}
              </div>
              {project.tags?.length > 0 && <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-white/5">{project.tags.map(tag => <span key={tag} className="px-3 py-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-full text-xs">#{tag}</span>)}</div>}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
                {project.links?.github && <a href={normalizeExternalUrl(project.links.github)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-600/10 border border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm font-semibold"><FiGithub size={16} /> Source Code</a>}
                {project.links?.live && <a href={normalizeExternalUrl(project.links.live)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-600/10 border border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm font-semibold"><FiExternalLink size={16} /> Live Demo</a>}
                {project.links?.demo && <a href={normalizeExternalUrl(project.links.demo)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-600/10 border border-slate-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30 rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all text-sm font-semibold"><FiExternalLink size={16} /> Demo Video</a>}
              </div>
            </motion.div>
            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}
              className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-6"><div className="w-1 h-7 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" /><h3 className="text-xl font-black">Project Info</h3></div>
              <div className="space-y-0">
                {[['Category',project.category],['Status',project.status],['Year',year],['Images',carouselImages.length>0?`${carouselImages.length} screenshots`:null]].filter(([,v])=>v).map(([label,value]) => (
                  <div key={label} className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <CaseStudySection caseStudy={project?.caseStudy} />

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-5">Related Projects</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {related.slice(0,3).map((rp,i) => (
                  <Link key={rp._id} to={`/projects/${rp.slug}`} className="group bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 rounded-xl overflow-hidden transition-all hover:-translate-y-1">
                    <div className={`h-28 bg-gradient-to-br ${GRADIENTS[i%GRADIENTS.length]} overflow-hidden`}>
                      {rp.thumbnail?.url && <img src={rp.thumbnail.url} alt="" className="w-full h-full object-cover opacity-80" />}
                    </div>
                    <div className="p-4"><div className="font-bold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">{rp.title}</div><div className="text-xs text-slate-400 line-clamp-2">{rp.description}</div></div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom nav */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="flex justify-between items-center pt-4">
            <Link to="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold rounded-xl transition-all shadow-sm dark:shadow-none"><FiArrowLeft size={16} /> All Projects</Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20">Hire Me →</Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
