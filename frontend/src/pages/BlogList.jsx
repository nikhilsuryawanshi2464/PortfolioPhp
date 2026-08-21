// PUBLIC BLOG LISTING PAGE
// File: frontend/src/pages/BlogList.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiTag, FiArrowRight } from 'react-icons/fi';
import Nav from '@components/common/Nav';
import Footer from '@components/common/Footer';
import { useBlogPosts } from '@hooks/useQueries';
import SEO from '@components/common/SEO';
import { usePageTracking } from '@hooks/useAnalytics';

const CAT_COLORS = {
  tutorial: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  'case-study': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
  opinion: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  news: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-300 border-green-200 dark:border-green-500/30',
  project: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
  other: 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10',
};

function BlogCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm dark:shadow-none transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Cover image */}
      {post.coverImage?.url ? (
        <div className="h-44 overflow-hidden">
          <img src={post.coverImage.url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 dark:from-indigo-600/30 dark:to-violet-600/30 flex items-center justify-center">
          <span className="text-5xl select-none">✍️</span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Category + read time */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${CAT_COLORS[post.category] || CAT_COLORS.other}`}>
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400"><FiClock size={11} /> {post.readTime || 1} min read</span>
          <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
            <FiCalendar size={11} />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
          </span>
        </div>

        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-tight line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs rounded-full">
                <FiTag size={9} /> {tag}
              </span>
            ))}
          </div>
        )}

        <Link to={`/blog/${post.slug}`}
          className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mt-auto hover:gap-3 transition-all group/link">
          Read Article <FiArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.article>
  );
}


const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 animate-pulse">
    <div className="h-48 bg-slate-100 dark:bg-white/5" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2"><div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-white/5"/><div className="h-5 w-24 rounded-full bg-slate-100 dark:bg-white/5"/></div>
      <div className="h-5 w-4/5 rounded-full bg-slate-100 dark:bg-white/5"/>
      <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-white/5"/>
      <div className="h-4 w-2/3 rounded-full bg-slate-100 dark:bg-white/5"/>
    </div>
  </div>
);

export default function BlogListPage() {

  const { data: posts = [], isLoading: loading } = useBlogPosts();
  usePageTracking();
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');

  // Derive categories from fetched posts
  const categories = ['all', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filtered = posts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q) || (p.tags || []).some(t => t.includes(q));
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white transition-colors duration-300">
      <SEO page="blog" title="Blog" description="Articles and tutorials on full-stack development, React, Node.js and software engineering." />
      <Nav />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-full text-indigo-600 dark:text-indigo-300 text-sm mb-6">
            ✍️ Articles & Insights
          </div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4">
            <span className="text-slate-900 dark:text-white">The </span>
            <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Tutorials, case studies, and thoughts on software development.</p>
        </motion.div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-20 z-40 px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 bg-white/90 dark:bg-[#060612]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm transition-colors">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-400 placeholder-slate-400 transition-colors" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${category === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-indigo-400 hover:text-indigo-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-sm text-slate-400 self-center whitespace-nowrap">{filtered.length} post{filtered.length !== 1 ? 's' : ''}</span>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-10 px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-2xl h-72 bg-slate-100 dark:bg-white/5 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <div className="text-6xl">{posts.length === 0 ? '✍️' : '🔍'}</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{posts.length === 0 ? 'No articles yet' : 'Nothing found'}</p>
              {posts.length === 0
                ? <p className="text-slate-500">Go to <a href="/admin/blog" className="text-indigo-500 underline">Admin → Blog</a> to write your first article</p>
                : <button onClick={() => { setSearch(''); setCategory('all'); }} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors">Clear filters</button>}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((post, i) => <BlogCard key={post._id} post={post} index={i} />)}
              </div>
            </AnimatePresence>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
