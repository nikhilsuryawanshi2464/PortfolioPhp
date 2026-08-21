// PATH: frontend/src/pages/Search.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowRight, FiFileText, FiCode, FiX } from 'react-icons/fi';
import Nav    from '@components/common/Nav';
import Footer from '@components/common/Footer';
import SEO    from '@components/common/SEO';
import { projectsAPI, blogAPI } from '@services/api';
import { usePageTracking } from '@hooks/useAnalytics';

const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const ResultCard = ({ item, type }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
    <Link
      to={type === 'project' ? `/projects/${item.slug}` : `/blog/${item.slug}`}
      className="flex items-start gap-4 p-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all group"
    >
      {/* Thumbnail / icon */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
        {(item.thumbnail?.url || item.coverImage?.url) ? (
          <img src={item.thumbnail?.url || item.coverImage?.url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          type === 'project'
            ? <FiCode size={22} className="text-indigo-400" />
            : <FiFileText size={22} className="text-violet-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            type === 'project'
              ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
              : 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300'
          }`}>
            {type === 'project' ? '⚡ Project' : '✍️ Blog'}
          </span>
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
          {item.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
          {item.description || item.excerpt || item.content?.replace(/<[^>]*>/g,'').slice(0,120)}
        </p>
        {(item.technologies || item.tags) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(item.technologies || item.tags || []).slice(0,4).map(t => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">{t}</span>
            ))}
          </div>
        )}
      </div>
      <FiArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-colors" />
    </Link>
  </motion.div>
);

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]     = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ projects: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 350);
  usePageTracking();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ projects: [], posts: [] });
      setSearchParams({}, { replace: true });
      return;
    }
    setSearchParams({ q: debouncedQuery }, { replace: true });
    setLoading(true);

    Promise.allSettled([
      projectsAPI.search({ q: debouncedQuery, limit: 6, published: true }),
      blogAPI.getAll({ search: debouncedQuery, limit: 6 }),
    ]).then(([proj, blog]) => {
      setResults({
        projects: proj.value?.data?.data || [],
        posts:    blog.value?.data?.data || [],
      });
    }).finally(() => setLoading(false));
  }, [debouncedQuery]);

  const total = results.projects.length + results.posts.length;
  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white transition-colors duration-300">
      <SEO title="Search" description="Search across projects and blog posts." noIndex />
      <Nav />

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-24">
        {/* Search input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8 text-center">
            Search Everything
          </h1>
          <div className="relative mb-8">
            <FiSearch size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search projects, blog posts…"
              className="w-full pl-13 pr-12 py-4 text-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-400 dark:focus:border-indigo-500/60 rounded-2xl outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-colors shadow-sm dark:shadow-none"
              style={{ paddingLeft: '3.25rem' }}
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <FiX size={18} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse" />
              ))}
            </motion.div>
          ) : hasQuery && total === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">No results for "{debouncedQuery}"</p>
              <p className="text-sm text-slate-400 mt-2">Try different keywords or browse below</p>
              <div className="flex justify-center gap-4 mt-6">
                <Link to="/projects" className="text-indigo-500 hover:underline text-sm font-medium">Browse Projects</Link>
                <Link to="/blog"     className="text-indigo-500 hover:underline text-sm font-medium">Browse Blog</Link>
              </div>
            </motion.div>
          ) : hasQuery ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <p className="text-sm text-slate-400">{total} result{total !== 1 ? 's' : ''} for <strong className="text-slate-700 dark:text-slate-200">"{debouncedQuery}"</strong></p>

              {results.projects.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                    <FiCode size={13} /> Projects ({results.projects.length})
                  </h2>
                  <div className="space-y-2">
                    {results.projects.map(p => <ResultCard key={p._id} item={p} type="project" />)}
                  </div>
                </div>
              )}

              {results.posts.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-3 flex items-center gap-2">
                    <FiFileText size={13} /> Blog Posts ({results.posts.length})
                  </h2>
                  <div className="space-y-2">
                    {results.posts.map(p => <ResultCard key={p._id} item={p} type="blog" />)}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20 text-slate-400">
              <FiSearch size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-base">Start typing to search across all content</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
