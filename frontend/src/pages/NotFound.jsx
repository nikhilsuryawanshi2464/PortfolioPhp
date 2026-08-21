// frontend/src/pages/NotFound.jsx
// Feature 19 — Better 404 Page with animated illustration + search
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft, FiSearch, FiArrowRight } from 'react-icons/fi';
import { useSettings } from '@contexts/SiteSettingsContext';

const MESSAGES = [
  "Hmm, this page took a vacation 🏖️",
  "404: Page not found (git blame someone else)",
  "Even the best developers encounter this... 😅",
  "This URL doesn't spark joy. Let's Marie Kondo it.",
  "You've reached the edge of the internet. Impressive.",
];

const QUICK_LINKS = [
  { label:'Projects', path:'/projects', emoji:'💻' },
  { label:'Blog',     path:'/blog',     emoji:'✍️' },
  { label:'About',    path:'/about',    emoji:'👋' },
  { label:'Contact',  path:'/contact',  emoji:'📬' },
  { label:'Resume',   path:'/resume',   emoji:'📄' },
];

export default function NotFound() {
  const [query, setQuery] = useState('');
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white flex flex-col items-center justify-center px-4 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        style={{ backgroundImage:"linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)", backgroundSize:"60px 60px" }}/>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-violet-200/30 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none"/>

      <div className="relative z-10 text-center max-w-2xl mx-auto w-full space-y-8">
        <motion.div initial={{ opacity:0, scale:0.7, y:-30 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}>
          <div className="relative inline-block">
            <span className="text-[8rem] sm:text-[10rem] leading-none font-black select-none"
              style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 40px rgba(99,102,241,0.4))" }}>
              404
            </span>
            <motion.span className="absolute -top-4 -right-6 text-3xl"
              animate={{ rotate:[0,15,-10,15,0], y:[0,-8,0,-4,0] }}
              transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}>🔍</motion.span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="space-y-3">
          <h1 className="text-2xl font-black">Page not found</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">{msg}</p>
        </motion.div>

        <motion.form onSubmit={handleSearch} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="relative max-w-sm mx-auto">
          <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects, blog posts…"
            className="w-full pl-11 pr-12 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-400 rounded-2xl outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors shadow-sm"/>
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"><FiArrowRight size={14}/></button>
        </motion.form>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg text-sm"><FiHome size={15}/> Go Home</Link>
          <button onClick={()=>window.history.back()} className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold rounded-xl transition-all text-sm"><FiArrowLeft size={15}/> Go Back</button>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }} className="pt-4 border-t border-slate-200 dark:border-white/10">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-4 font-semibold">Quick links</p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_LINKS.map(({ label, path, emoji }) => (
              <Link key={path} to={path} className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 text-sm font-medium rounded-xl transition-all">
                {emoji} {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
