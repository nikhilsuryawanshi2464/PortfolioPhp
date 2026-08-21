// PATH: frontend/src/pages/Services.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiMail } from 'react-icons/fi';
import Nav    from '@components/common/Nav';
import Footer from '@components/common/Footer';
import SEO    from '@components/common/SEO';
import { useServices } from '@hooks/useQueries';
import { usePageTracking } from '@hooks/useAnalytics';

const fmtPrice = (service) => {
  if (!service.priceType || service.priceType === 'contact') return 'Contact for Pricing';
  const sym = service.currency === 'INR' ? '₹' : service.currency === 'EUR' ? '€' : '$';
  const sfx = { hourly: '/hr', monthly: '/mo', fixed: '' }[service.priceType] || '';
  if (service.priceFrom && service.priceTo) return `${sym}${service.priceFrom}–${sym}${service.priceTo}${sfx}`;
  if (service.priceFrom) return `From ${sym}${service.priceFrom}${sfx}`;
  return 'Contact for Pricing';
};

// Skeleton card
const SkeletonCard = () => (
  <div className="rounded-2xl p-8 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5" />
    <div className="h-5 w-2/3 rounded-full bg-slate-100 dark:bg-white/5" />
    <div className="h-4 w-1/3 rounded-full bg-slate-100 dark:bg-white/5" />
    <div className="space-y-2">
      {[1,2,3].map(i => <div key={i} className="h-3 w-full rounded-full bg-slate-100 dark:bg-white/5" />)}
    </div>
    <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-white/5" />
  </div>
);

export default function ServicesPage() {
  const { data: services = [], isLoading } = useServices();
  usePageTracking();

  const visibleServices = services.filter(s => s.visible !== false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      <SEO page="services" title="Services & Pricing" description="Hire me for full-stack web development, API design, React apps and more. Transparent pricing with clear deliverables." />
      <Nav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-200/40 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-full text-indigo-600 dark:text-indigo-300 text-sm mb-6">
            💼 What I Offer
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4">
            <span className="text-slate-900 dark:text-white">Services &</span>{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">Pricing</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            Transparent pricing, clear deliverables, and quality you can count on.
          </motion.p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : visibleServices.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <div className="text-5xl mb-4">💼</div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">No services listed yet.</p>
              <Link to="/contact" className="mt-4 inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-600 font-medium">
                Contact me directly <FiArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className={`grid gap-8 ${
              visibleServices.length === 1 ? 'max-w-md mx-auto' :
              visibleServices.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
              'md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {visibleServices.map((service, i) => (
                <motion.div key={service._id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }} whileHover={{ y: -8 }}
                  className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                    service.popular
                      ? 'bg-white dark:bg-white/[0.05] border-2 border-indigo-400 dark:border-indigo-500/60 shadow-xl shadow-indigo-600/10'
                      : 'bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none'
                  }`}>
                  {service.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-600/30 uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div className="text-4xl mb-4">{service.icon || '💼'}</div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{service.title}</h3>
                  <div className={`text-xl font-bold mb-4 ${service.popular ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {fmtPrice(service)}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{service.description}</p>
                  {service.features?.length > 0 && (
                    <ul className="space-y-3 mb-8 flex-1">
                      {service.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                          <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                            <FiCheck size={10} className="text-emerald-500" />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link to={service.ctaLink || '/contact'}
                    className={`mt-auto block text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      service.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-50 dark:bg-white/5 hover:bg-indigo-600 dark:hover:bg-indigo-600 border border-slate-200 dark:border-white/10 hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:text-white'
                    }`}>
                    {service.cta || 'Get in Touch'}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-600/20 dark:to-violet-600/20 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-10 transition-colors duration-300">
            <div className="text-4xl mb-4">🤝</div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Need something custom?</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Every project is unique. Let's discuss your specific requirements.</p>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/25">
              <FiMail size={16} /> Get a Custom Quote
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
