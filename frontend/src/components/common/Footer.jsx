import { useSettings } from '@contexts/SiteSettingsContext';

const Footer = () => {
  const { settings, footerText } = useSettings();
  const logo   = settings.logoText || { prefix: 'Nikhil', suffix: '.Suryawanshi' };
  const social = settings.social || {};

  const links = [
    social.github   && { label: 'GitHub',   href: social.github.startsWith('http')   ? social.github   : `https://github.com/${social.github}` },
    social.linkedin && { label: 'LinkedIn', href: social.linkedin.startsWith('http') ? social.linkedin : `https://linkedin.com/in/${social.linkedin}` },
    settings.contactEmail && { label: 'Email', href: `mailto:${settings.contactEmail}` },
  ].filter(Boolean);

  return (
    <footer className="border-t border-slate-200 dark:border-white/5 py-10 px-4 bg-white dark:bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-black text-lg">
          <span className="text-slate-800 dark:text-white">{logo.prefix}</span>
          <span className="text-indigo-600 dark:text-indigo-400">{logo.suffix}</span>
        </div>
        <p className="text-slate-400 text-sm">{footerText}</p>
        <div className="flex gap-4">
          {links.map(({ label, href }) => (
            <a key={label} href={href} target={href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
