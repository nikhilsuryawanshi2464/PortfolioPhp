import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { useTheme } from '@contexts/ThemeContext';
import { useSettings } from '@contexts/SiteSettingsContext';

const Nav = () => {
  const { isDark, toggle } = useTheme();
  const { settings, navLinks } = useSettings();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logo = settings.logoText || { prefix: 'dev', suffix: '.portfolio' };
  const showHire = settings.showHireBtn !== false;
  const hireLabel = settings.hireBtnLabel || 'Hire Me';

  return (
    <>
      <motion.nav initial={{ y:-80, opacity:0 }} animate={{ y:0, opacity:1 }}
        transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
        className="fixed top-0 w-full z-50 px-4 md:px-6">
        <div className="max-w-7xl mx-auto mt-4">
          <div className={`flex justify-between items-center h-14 px-6 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none transition-all duration-300 ${scrolled?'shadow-md dark:shadow-none':''}`}>
            <motion.div whileHover={{ scale:1.05 }} className="font-black text-xl tracking-tight flex-shrink-0">
              <Link to="/">
                <span className="text-slate-800 dark:text-white">{logo.prefix}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{logo.suffix}</span>
              </Link>
            </motion.div>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(item => (
                <Link key={item.path} to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors group ${isActive(item.path)?'text-indigo-600 dark:text-white':'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                  {item.label}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-indigo-500 transition-all duration-300 ${isActive(item.path)?'w-4/5':'w-0 group-hover:w-4/5'}`} />
                </Link>
              ))}
              <Link to="/search"
                className="ml-2 p-2 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all" title="Search">
                <FiSearch size={16} />
              </Link>
              <motion.button onClick={toggle} whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                className="ml-2 p-2 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all relative overflow-hidden" title="Toggle theme">
                <motion.div
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: -180, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 180, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                  {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                </motion.div>
              </motion.button>
              {showHire && (
                <Link to="/contact" className="ml-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
                  {hireLabel}
                </Link>
              )}
            </div>
            <div className="flex md:hidden items-center gap-2">
              <motion.button onClick={toggle} whileTap={{ scale:0.9 }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all">
                {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
              </motion.button>
              <motion.button onClick={() => setMenuOpen(!menuOpen)} whileTap={{ scale:0.9 }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all">
                {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {menuOpen && (
          <motion.div key="mobile-menu" initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
            transition={{ duration:0.25 }}
            className="fixed top-24 left-4 right-4 z-40 bg-white dark:bg-[#0d0d1f] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col py-3">
              {navLinks.map(item => (
                <Link key={item.path} to={item.path}
                  className={`px-6 py-3.5 text-sm font-semibold transition-colors ${isActive(item.path)?'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10':'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                  {item.label}
                </Link>
              ))}
              {showHire && (
                <div className="px-4 py-3 border-t border-slate-100 dark:border-white/5 mt-1">
                  <Link to="/contact" className="block text-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">{hireLabel}</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {menuOpen && (
          <motion.div key="backdrop" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/20 dark:bg-black/40 md:hidden" />
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
