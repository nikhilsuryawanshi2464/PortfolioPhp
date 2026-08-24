import { useRef ,useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiAward, FiBriefcase, FiCode, FiHeart, FiDownload, FiMail } from 'react-icons/fi';
import Nav from '@components/common/Nav';
import Footer from '@components/common/Footer';
import SEO from '@components/common/SEO';
import { useProfile, useSkills, useExperience, useCertifications, useTestimonials, useProjects } from '@hooks/useQueries';
import { usePageTracking } from '@hooks/useAnalytics';
import { profileAPI } from '@services/api';

const StatCounter = ({ value, label, icon: Icon }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const timer = setInterval(() => {
      start += Math.ceil(value / 40);
      if (start >= value) { setCount(value); clearInterval(timer); } else setCount(start);
    }, 40);
    return () => clearInterval(timer);
  }, [visible, value]);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -4 }}
      className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center group shadow-sm dark:shadow-none transition-colors duration-300">
      <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
        <Icon className="text-indigo-600 dark:text-indigo-400" size={24} />
      </div>
      <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{count}+</div>
      <div className="text-slate-500 text-sm">{label}</div>
    </motion.div>
  );
};

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/* ── Testimonials Carousel ───────────────────────────────── */
const TestimonialsCarousel = ({ items }) => {
  const [idx, setIdx] = useState(0);
  const total = items.length;
  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  return (
    <div className="relative">
      <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center shadow-sm dark:shadow-none">
        {items[idx]?.avatar
          ? <img src={items[idx].avatar} alt={items[idx].name} className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-2 border-indigo-200 dark:border-indigo-500/30" />
          : <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-2xl font-black text-indigo-600 dark:text-indigo-300">{items[idx]?.name?.[0]}</div>
        }
        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic mb-6">"{items[idx]?.quote}"</p>
        <div className="font-bold text-slate-900 dark:text-white">{items[idx]?.name}</div>
        {(items[idx]?.role || items[idx]?.company) && (
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {items[idx].role}{items[idx].role && items[idx].company && ' · '}{items[idx].company}
          </div>
        )}
      </div>
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {items.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-indigo-600' : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-indigo-400'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

const AboutPage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

   const { data: profile,             isLoading: loadingProfile    } = useProfile();
  const { data: skills = [],         isLoading: loadingSkills     } = useSkills();
  const { data: experience = [],     isLoading: loadingExperience } = useExperience();

  const dataLoaded = !loadingProfile && !loadingSkills && !loadingExperience;
  const { data: certifications = [] } = useCertifications();
  const { data: testimonials = [] }   = useTestimonials();
  const { data: projects = [] }       = useProjects();
  usePageTracking();

  // Group skills by category
  const skillCategories = ['frontend', 'backend', 'database', 'devops', 'tools', 'other'];
  const groupedSkills = skillCategories.reduce((acc, cat) => {
    const inCat = skills.filter(s => s.category === cat);
    if (inCat.length > 0) acc[cat] = inCat;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      <SEO page="about" title="About Me" description="Learn about my background, skills, work experience and what drives me as a full-stack developer." />
      <Nav active="About" />

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[55vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-indigo-200/40 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-violet-200/30 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center pt-24 pb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-full text-indigo-600 dark:text-indigo-300 text-sm mb-6">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" /></span>
            {experience.length > 0 ? `${experience.length}+ Roles` : 'Developer & Builder'}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl lg:text-7xl font-black leading-none tracking-tight mb-4">
            <span className="block text-slate-900 dark:text-white">About</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">Me</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="text-slate-500 text-xl max-w-xl mx-auto">Passionate developer. Clean code advocate. Problem solver.</motion.p>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-16 px-4 border-y border-slate-200 dark:border-white/5 bg-white dark:bg-transparent transition-colors duration-300">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCounter value={projects.length > 0 ? projects.length : 10} label="Projects Completed" icon={FiCode} />
          <StatCounter value={profile?.yearsOfExperience || 5} label="Years Experience" icon={FiBriefcase} />
          <StatCounter value={skills.length > 0 ? skills.length : 12} label="Technologies" icon={FiAward} />
          <StatCounter value={testimonials.length > 0 ? testimonials.length : 30} label="Happy Clients" icon={FiHeart} />
        </div>
      </section>

      {/* BIO + SKILLS from API */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="space-y-6">
            <div>
              <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">Who I Am</div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">Building the web, one line at a time</h2>
            </div>
            {(profile?.bio
              ? profile.bio.split('\n\n').filter(Boolean)
              : ["Hi! I'm a passionate Full-Stack Developer with experience building web applications that solve real-world problems. I specialize in the MERN stack and have a strong foundation in modern web technologies.",
                 "My journey started when I built my first website. Since then I've been continuously learning and improving, working on diverse projects from e-commerce platforms to real-time applications.",
                 "I believe in writing clean, maintainable code and following best practices. I'm passionate about sharing knowledge and delivering great user experiences."]
            ).map((para, i) => (
              <motion.p key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-slate-500 dark:text-slate-400 leading-relaxed">{para}</motion.p>
            ))}
            <div className="flex gap-3 pt-4">
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
                <FiMail size={16} /> Contact Me
              </Link>
              {profile?.resume?.url && (
                <a href={profileAPI.getResumeDownloadUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold rounded-xl transition-all shadow-sm dark:shadow-none">
                  <FiDownload size={16} className="text-indigo-500 dark:text-indigo-400" /> Download Resume
                </a>
              )}
            </div>
          </motion.div>

          {/* SKILL BARS from API */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="space-y-5">
            <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-6">Skill Levels</div>
            {!dataLoaded ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />)
            ) : skills.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <p>No skills added yet.</p>
                <a href="/admin/skills" className="text-indigo-500 underline text-sm">Add skills in Admin →</a>
              </div>
            ) : (
              skills.slice(0, 10).map((skill, i) => (
                <div key={skill._id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{skill.name}</span>
                    <span className="font-bold" style={{ color: skill.color || '#6366f1' }}>{skill.proficiency}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.proficiency}%` }} viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full" style={{ background: skill.color || 'linear-gradient(to right, #6366f1, #8b5cf6)' }} />
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* ALL SKILLS GRID by category */}
      {dataLoaded && skills.length > 0 && (
        <section className="py-16 px-4 bg-white dark:bg-transparent transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">Tech Stack</div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">All Skills</h2>
            </motion.div>
            {Object.entries(groupedSkills).map(([cat, catSkills]) => (
              <div key={cat} className="mb-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{cat}</h3>
                <div className="flex flex-wrap gap-3">
                  {catSkills.map(skill => (
                    <motion.div key={skill._id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                      whileHover={{ y: -3 }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: skill.color || '#6366f1' }} />
                      {skill.name}
                      <span className="text-xs text-slate-400">{skill.proficiency}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EXPERIENCE TIMELINE from API */}
      <section className="py-24 px-4 bg-slate-100/60 dark:bg-white/[0.02] transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 space-y-3">
            <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase">Experience</div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white">Work History</h2>
          </motion.div>
          {!dataLoaded ? (
            <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}</div>
          ) : experience.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-4">🏢</div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">No experience added yet</p>
              <p className="text-sm mt-2">Go to <a href="/admin/experience" className="text-indigo-500 underline">Admin → Experience</a> to add your work history</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-violet-500 to-transparent" />
              <div className="space-y-8">
                {experience.map((exp, i) => (
                  <motion.div key={exp._id} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 }} className="relative pl-16">
                    <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.2 }}
                      className="absolute left-3.5 top-1.5 w-5 h-5 rounded-full border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    </motion.div>
                    <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors shadow-sm dark:shadow-none">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{exp.position}</h3>
                          <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{exp.company}{exp.location && ` · ${exp.location}`}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {fmtDate(exp.startDate)} — {exp.current ? 'Present' : fmtDate(exp.endDate)}
                          </span>
                          <div><span className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-full capitalize">{exp.employmentType || 'full-time'}</span></div>
                        </div>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-3">{exp.description}</p>
                      {exp.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map(t => (
                            <span key={t} className="px-2 py-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-600/20 dark:to-violet-600/20 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-12 text-center overflow-hidden transition-colors duration-300">
            <div className="relative space-y-6">
              <div className="text-5xl">🤝</div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Let's Work Together</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">Looking for a developer who cares about quality and ships fast?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/30">
                  <FiMail /> Get In Touch
                </Link>
                <Link to="/projects" className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-white/10">
                  View My Work
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ───────────────────────────────── */}
      {certifications.length > 0 && (
        <section className="py-16 px-4 bg-white dark:bg-transparent transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">Credentials</div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Certifications & Education</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {certifications.map((cert, i) => (
                <a key={cert._id} href={cert.credentialUrl || '#'} target={cert.credentialUrl ? '_blank' : undefined} rel="noopener noreferrer"
                  className="group flex flex-col gap-3 p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-lg">
                      🏆
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{cert.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cert.issuer}</div>
                    </div>
                  </div>
                  {cert.issueDate && (
                    <div className="text-xs text-slate-400 mt-auto">
                      {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {cert.expiryDate && ` – ${new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-16 px-4 bg-slate-100/60 dark:bg-white/[0.02] transition-colors duration-300">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">Kind Words</div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">What People Say</h2>
            </div>
            <TestimonialsCarousel items={testimonials} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default AboutPage;
