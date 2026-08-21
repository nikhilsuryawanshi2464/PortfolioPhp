import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiBriefcase, FiCalendar, FiMapPin, FiExternalLink, FiAward } from 'react-icons/fi';
import Nav    from '@components/common/Nav';
import Footer from '@components/common/Footer';
import SEO    from '@components/common/SEO';
import { experienceAPI, certAPI } from '@services/api';

const fmtDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US',{month:'short',year:'numeric'}); }
  catch { return d; }
};

const getDuration = (start, end, current) => {
  if (!start) return '';
  const s = new Date(start);
  const e = current ? new Date() : (end ? new Date(end) : new Date());
  const months = (e.getFullYear()-s.getFullYear())*12 + (e.getMonth()-s.getMonth());
  if (months < 1) return '< 1 mo';
  if (months < 12) return `${months} mo`;
  const yrs = Math.floor(months/12);
  const mo  = months%12;
  return mo > 0 ? `${yrs} yr ${mo} mo` : `${yrs} yr${yrs>1?'s':''}`;
};

const TimelineItem = ({ exp, side, index }) => {
  const isLeft = side === 'left';
  return (
    <div className={`relative flex ${isLeft?'md:justify-end':'md:justify-start'} justify-start mb-12`}>
      <div className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 z-10">
        <motion.div initial={{ scale:0 }} whileInView={{ scale:1 }} viewport={{ once:true }}
          transition={{ type:'spring', stiffness:300, damping:20, delay:index*0.1 }}
          className={`w-4 h-4 rounded-full border-2 border-white dark:border-[#060612] shadow-lg ${exp.current?'bg-indigo-600 shadow-indigo-600/40':'bg-slate-300 dark:bg-slate-600'}`} />
      </div>
      <motion.div initial={{ opacity:0, x:isLeft?30:-30 }} whileInView={{ opacity:1, x:0 }}
        viewport={{ once:true }} transition={{ duration:0.6, delay:index*0.08, ease:[0.16,1,0.3,1] }}
        className={`ml-12 md:ml-0 w-full md:w-5/12 ${isLeft?'md:mr-8':'md:ml-8'}`}>
        <div className="group bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors duration-300">
          {exp.current && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
                </span>
                Current Role
              </span>
            </div>
          )}
          <div className="flex items-start gap-4">
            {exp.companyLogo?.url ? (
              <img src={exp.companyLogo.url} alt={exp.company} className="w-12 h-12 rounded-xl object-contain border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <FiBriefcase className="text-indigo-500" size={20} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">{exp.role||exp.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">{exp.company}</span>
                {exp.companyUrl && (
                  <a href={exp.companyUrl.startsWith('http')?exp.companyUrl:`https://${exp.companyUrl}`}
                    target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500 transition-colors">
                    <FiExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><FiCalendar size={12} />{fmtDate(exp.startDate)} – {exp.current?'Present':fmtDate(exp.endDate)}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span>{getDuration(exp.startDate, exp.endDate, exp.current)}</span>
            {exp.location && <><span className="text-slate-300 dark:text-slate-600">·</span><span className="flex items-center gap-1"><FiMapPin size={12} />{exp.location}</span></>}
            {exp.type && <><span className="text-slate-300 dark:text-slate-600">·</span><span className="capitalize">{exp.type.replace('-',' ')}</span></>}
          </div>
          {exp.description && <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mt-4">{exp.description}</p>}
          {(exp.achievements||[]).length > 0 && (
            <ul className="mt-4 space-y-2">
              {exp.achievements.map((a,i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />{a}
                </li>
              ))}
            </ul>
          )}
          {(exp.technologies||exp.skills||[]).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(exp.technologies||exp.skills).slice(0,6).map(t => (
                <span key={t} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-xs font-medium">{t}</span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const CertCard = ({ cert, delay }) => (
  <motion.a href={cert.credentialUrl||'#'} target="_blank" rel="noopener noreferrer"
    initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
    transition={{ duration:0.5, delay }} whileHover={{ y:-4 }}
    className="flex items-center gap-4 p-5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm dark:shadow-none transition-colors duration-300 group">
    {cert.logo?.url ? (
      <img src={cert.logo.url} alt={cert.issuer} className="w-12 h-12 object-contain rounded-lg border border-slate-100 dark:border-white/10" />
    ) : (
      <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center flex-shrink-0">
        <FiAward className="text-amber-500" size={22} />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-snug">{cert.name||cert.title}</div>
      <div className="text-slate-400 text-xs mt-0.5">{cert.issuer}</div>
      {cert.issueDate && <div className="text-slate-300 dark:text-slate-600 text-xs mt-0.5">{fmtDate(cert.issueDate)}</div>}
    </div>
    {cert.credentialUrl && <FiExternalLink size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />}
  </motion.a>
);

export default function ExperiencePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target:heroRef, offset:['start start','end start'] });
  const heroY       = useTransform(scrollYProgress, [0,1], ['0%','25%']);
  const heroOpacity = useTransform(scrollYProgress, [0,0.7], [1,0]);

  const [experiences, setExperiences] = useState([]);
  const [certs, setCerts]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.allSettled([experienceAPI.getAll(), certAPI.getAll()])
      .then(([exp, cert]) => {
        const expData = exp.value?.data?.data || [];
        expData.sort((a,b) => {
          if (a.current && !b.current) return -1;
          if (!a.current && b.current) return 1;
          return new Date(b.startDate||0) - new Date(a.startDate||0);
        });
        setExperiences(expData);
        setCerts(cert.value?.data?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      <SEO page="experience" />
      <Nav />
      <section ref={heroRef} className="relative min-h-[50vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{ backgroundImage:'linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)',backgroundSize:'60px 60px' }} />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-200/40 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <motion.div style={{ y:heroY, opacity:heroOpacity }} className="relative z-10 text-center pt-24 pb-12">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.6, delay:0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-full text-indigo-600 dark:text-indigo-300 text-sm mb-6">
            <FiBriefcase size={14} />
            {loading ? '…' : `${experiences.length} Role${experiences.length!==1?'s':''}`}
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8, delay:0.3, ease:[0.16,1,0.3,1] }}
            className="text-6xl lg:text-7xl font-black leading-none tracking-tight mb-4">
            <span className="block text-slate-900 dark:text-white">Career</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">Journey</span>
          </motion.h1>
          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.5 }}
            className="text-slate-500 text-xl max-w-lg mx-auto">Professional timeline — where I've worked and what I've built.</motion.p>
        </motion.div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="space-y-6">{Array.from({length:3}).map((_,i) => <div key={i} className="h-44 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 animate-pulse" />)}</div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <FiBriefcase size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">No experience added yet</p>
              <p className="text-sm mt-2">Go to <a href="/admin/experience" className="text-indigo-500 underline">Admin → Experience</a> to add your career history.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10" />
              <div className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10" />
              {experiences.map((exp,i) => <TimelineItem key={exp._id||i} exp={exp} side={i%2===0?'left':'right'} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {certs.length > 0 && (
        <section className="py-24 px-4 bg-slate-100/60 dark:bg-white/[0.02] transition-colors duration-300">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16 space-y-3">
              <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase">Credentials</div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Certifications</h2>
              <p className="text-slate-500">Verified skills and accomplishments</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certs.map((cert,i) => <CertCard key={cert._id||i} cert={cert} delay={i*0.07} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="relative bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-600/20 dark:to-violet-600/20 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-12 text-center overflow-hidden transition-colors duration-300">
            <div className="relative space-y-5">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Want to work together?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">I'm open to full-time roles and freelance projects.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/30">
                Get In Touch →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
