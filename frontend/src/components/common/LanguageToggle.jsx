// frontend/src/components/common/LanguageToggle.jsx
// Feature 24 — Language Toggle (EN / HI)
// Drop inside Nav.jsx: <LanguageToggle />
// Requires: npm install react-i18next i18next i18next-browser-languagedetector
// Import i18n/index.js once in main.jsx: import './i18n';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'hi', label: 'हि', flag: '🇮🇳' },
];

export default function LanguageToggle() {
  const [current, setCurrent] = useState('en');
  const [i18nLoaded, setLoaded] = useState(false);
  const [i18nLib, setLib] = useState(null);

  useEffect(() => {
    // Lazy-load i18next
    try {
      const i18n = require('i18next');
      setLib(i18n.default || i18n);
      setCurrent((i18n.default || i18n).language?.slice(0,2) || 'en');
      setLoaded(true);
    } catch {
      // Not installed — show placeholder
      setLoaded(false);
    }
  }, []);

  const switchLang = (code) => {
    if (!i18nLib) return;
    i18nLib.changeLanguage(code);
    setCurrent(code);
  };

  if (!i18nLoaded) {
    // Graceful fallback — just show EN button, no crash
    return (
      <button
        title="Multi-language (install react-i18next to enable)"
        className="ml-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-bold transition-all opacity-50 cursor-not-allowed"
      >
        EN
      </button>
    );
  }

  return (
    <div className="ml-2 flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
      {LANGS.map(lang => (
        <motion.button
          key={lang.code}
          onClick={() => switchLang(lang.code)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            current === lang.code
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
          title={`Switch to ${lang.code === 'en' ? 'English' : 'Hindi'}`}
        >
          {lang.label}
        </motion.button>
      ))}
    </div>
  );
}
