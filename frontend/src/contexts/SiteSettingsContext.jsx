import { createContext, useContext, useEffect, useState } from 'react';
import { siteSettingsAPI } from '@services/api';

const SiteSettingsContext = createContext(null);

const DEFAULTS = {
  siteName: 'Nikhil Portfolio', ownerName: 'Nikhil Suryawanshi', tagline: 'Full-Stack Developer',
  bio: '', availableForWork: true, contactEmail: '', phone: '', location: '',
  logoText: { prefix: 'Nikhil', suffix: '.Suryawanshi' },
  showHireBtn: true, hireBtnLabel: 'Hire Me', calendlyUrl: '',
  footerText: '© {year} · Built with React & ❤️',
  navLinks: [
    { label: 'Home',       path: '/',           visible: true, order: 0 },
    { label: 'Projects',   path: '/projects',   visible: true, order: 1 },
    { label: 'Blog',       path: '/blog',       visible: true, order: 2 },
    { label: 'Experience', path: '/experience', visible: true, order: 3 },
    { label: 'About',      path: '/about',      visible: true, order: 4 },
    { label: 'Contact',    path: '/contact',    visible: true, order: 5 },
  ],
  social: { github: '', linkedin: '', twitter: '', website: '', instagram: '', youtube: '' },
  seo: {},
  theme: { accentColor: '#6366f1', accentColorEnd: '#8b5cf6', darkModeDefault: true },
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    siteSettingsAPI.get()
      .then(r => { const d = r.data?.data; if (d) setSettings({ ...DEFAULTS, ...d }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const navLinks = (settings.navLinks || [])
    .filter(l => l.visible !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const footerText = (settings.footerText || '').replace('{year}', new Date().getFullYear());

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, navLinks, footerText }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SiteSettingsProvider');
  return ctx;
};

export default SiteSettingsContext;
