import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiGithub, FiLinkedin, FiTwitter, FiCheckCircle } from 'react-icons/fi';
import Nav from '@components/common/Nav';
import Footer from '@components/common/Footer';
import SEO from '@components/common/SEO';
import { contactAPI } from '@services/api';
import { useProfile } from '@hooks/useQueries';
import { useSettings } from '@contexts/SiteSettingsContext';
import { usePageTracking } from '@hooks/useAnalytics';

const InfoCard = ({ icon: Icon, label, value, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }} whileHover={{ y: -4 }}
    className="flex items-center gap-4 p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm dark:shadow-none transition-colors group">
    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
      <Icon className="text-indigo-600 dark:text-indigo-400" size={20} />
    </div>
    <div>
      <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-0.5">{label}</div>
      <div className="text-slate-800 dark:text-white font-medium">{value}</div>
    </div>
  </motion.div>
);

const ContactPage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);
 
  const { data: profile } = useProfile();
  const { settings } = useSettings();
  usePageTracking();
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = async () => {
    const email = profile?.contactEmail || settings?.contactEmail || '';
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit(formData);
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const inputClass = (name) =>
    `w-full px-4 py-3.5 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm outline-none transition-all
    ${focused === name
      ? 'bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-400 shadow-lg shadow-indigo-500/10'
      : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      <SEO page="contact" title="Contact" description="Get in touch for freelance projects, collaborations, or job opportunities." />
      <Nav active="Contact" />

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[50vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-200/40 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-200/30 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center pt-24 pb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-full text-green-600 dark:text-green-300 text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            Open to new opportunities
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl lg:text-7xl font-black leading-none tracking-tight mb-4">
            <span className="block text-slate-900 dark:text-white">Get In</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">Touch</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="text-slate-500 text-xl max-w-lg mx-auto">Have a project in mind or just want to chat? I'd love to hear from you.</motion.p>
        </motion.div>
      </section>

      {/* MAIN */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">Contact Info</div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Let's talk about everything!</h2>
              <p className="text-slate-500 leading-relaxed mb-8">Don't hesitate to reach out. I typically reply within 24 hours.</p>
            </motion.div>
            <InfoCard icon={FiMail} label="Email" value={profile?.contactEmail || 'nikhilsuryawanshi2464@gmail.com'} delay={0.1} />
            {profile?.phone && <InfoCard icon={FiPhone} label="Phone" value={profile.phone} delay={0.2} />}
            {profile?.location && <InfoCard icon={FiMapPin} label="Location" value={profile.location} delay={0.3} />}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="pt-2">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Find me on</div>
              <div className="flex gap-3 flex-wrap">
                {[
                  settings?.social?.github   && { icon: FiGithub,   href: `https://github.com/${settings.social.github}`,       label: 'GitHub' },
                  settings?.social?.linkedin && { icon: FiLinkedin,  href: `https://linkedin.com/in/${settings.social.linkedin}`, label: 'LinkedIn' },
                  settings?.social?.twitter  && { icon: FiTwitter,   href: `https://twitter.com/${settings.social.twitter}`,     label: 'Twitter' },
                ].filter(Boolean).map(({ icon: Icon, href, label }) => (
                  <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    className="p-3.5 bg-white dark:bg-white/5 hover:bg-indigo-600 dark:hover:bg-indigo-600 border border-slate-200 dark:border-white/10 hover:border-indigo-500 rounded-xl text-slate-500 dark:text-slate-400 hover:text-white transition-all shadow-sm dark:shadow-none" title={label}>
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>

              {/* Calendly schedule button */}
              {settings?.calendlyUrl && (
                <motion.a
                  href={settings.calendlyUrl} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 flex items-center gap-3 px-5 py-3 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-indigo-600 dark:text-indigo-300 font-semibold text-sm transition-all"
                >
                  <span>📅</span> Schedule a Call
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="ml-auto"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                </motion.a>
              )}

              {/* Copy email button */}
              {(profile?.contactEmail || settings?.contactEmail) && (
                <motion.button
                  onClick={copyEmail}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.55 }}
                  className="mt-2 flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-sm transition-all w-full text-left"
                >
                  <FiMail size={16} className="text-indigo-500 flex-shrink-0" />
                  <span className="flex-1 truncate">{profile?.contactEmail || settings?.contactEmail}</span>
                  {emailCopied
                    ? <span className="text-green-500 text-xs font-semibold flex-shrink-0">✓ Copied!</span>
                    : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 text-slate-400"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  }
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* RIGHT - Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="lg:col-span-3">
            <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-none transition-colors duration-300">
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}>
                    <FiCheckCircle size={64} className="text-green-500 mx-auto" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Message Sent!</h3>
                  <p className="text-slate-500">Thanks for reaching out. I'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                    className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">Send Another</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name"
                        className={inputClass('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com"
                        className={inputClass('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Subject</label>
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="How can I help?"
                      className={inputClass('subject')} onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Message</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} placeholder="Tell me about your project..."
                      className={`${inputClass('message')} resize-none`} onFocus={() => setFocused('message')} onBlur={() => setFocused(null)} />
                  </div>
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                    {loading ? (
                      <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> Sending...</>
                    ) : (<>Send Message <FiSend size={16} /></>)}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default ContactPage;
