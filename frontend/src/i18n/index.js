// frontend/src/i18n/index.js
// Feature 24 — Multi-language support (EN + Hindi)
// Install: npm install react-i18next i18next i18next-browser-languagedetector

// ── Fallback when library not installed ──────────────────────────────────────
let i18nReady = false;
try {
  const i18n             = require('i18next');
  const { initReactI18next } = require('react-i18next');
  const LanguageDetector = require('i18next-browser-languagedetector');

  const en = require('./locales/en.json');
  const hi = require('./locales/hi.json');

  i18n
    .use(LanguageDetector.default || LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        hi: { translation: hi },
      },
      fallbackLng: 'en',
      debug: false,
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });
  i18nReady = true;
  module.exports = i18n;
} catch(e) {
  // react-i18next not installed — run: npm install react-i18next i18next i18next-browser-languagedetector
  console.warn('i18n not installed. Run: npm install react-i18next i18next i18next-browser-languagedetector');
  module.exports = { t: (key) => key, language: 'en', changeLanguage: () => {} };
}
