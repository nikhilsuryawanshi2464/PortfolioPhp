// PATH: frontend/src/pages/Resume.jsx
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiMail, FiPhone, FiMapPin, FiGlobe, FiGithub, FiLinkedin } from 'react-icons/fi';
import Nav    from '@components/common/Nav';
import Footer from '@components/common/Footer';
import SEO    from '@components/common/SEO';
import { useProfile, useSkills, useExperience, useCertifications } from '@hooks/useQueries';
import { usePageTracking } from '@hooks/useAnalytics';
import { profileAPI } from '@services/api';

const FALLBACK_NAME = 'Nikhil Suryawanshi';

const fmtDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }
  catch { return ''; }
};

export default function ResumePage() {
  const cvRef = useRef(null);
  const { data: profile }        = useProfile();
  const { data: skills = [] }    = useSkills();
  const { data: experience = [] }= useExperience();
  const { data: certs = [] }     = useCertifications();
  usePageTracking();

  const handlePrint = () => window.print();

  // Group skills by category
  const skillGroups = skills.reduce((acc, s) => {
    const cat = s.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white transition-colors duration-300">
      <SEO page="resume" title="Resume / CV" description={`${profile?.name || FALLBACK_NAME} — ${profile?.tagline || 'Full-Stack Developer'} resume and CV.`} />
      <Nav />

      {/* Action bar */}
      <div className="sticky top-20 z-30 flex justify-center gap-3 py-4 px-4 print:hidden">
        <motion.a
          href={profileAPI.getResumeDownloadUrl()}
          target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 text-sm transition-colors"
        >
          <FiDownload size={15} /> Download PDF
        </motion.a>
        <motion.button
          onClick={handlePrint}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
        >
          <FiPrinter size={15} /> Print
        </motion.button>
      </div>

      {/* CV body */}
      <div ref={cvRef} className="max-w-4xl mx-auto px-4 pb-24 pt-4 print:pt-0 print:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-none print:shadow-none print:border-none print:rounded-none"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-600 p-10 text-white print:bg-none print:text-slate-900">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {profile?.avatar && (
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl font-black tracking-tight mb-1">{profile?.name || FALLBACK_NAME}</h1>
                <p className="text-white/80 text-lg font-medium mb-4">{profile?.tagline || 'Full-Stack Developer'}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-white/70">
                  {profile?.contactEmail && <span className="flex items-center gap-1.5"><FiMail size={13}/>{profile.contactEmail}</span>}
                  {profile?.phone        && <span className="flex items-center gap-1.5"><FiPhone size={13}/>{profile.phone}</span>}
                  {profile?.location     && <span className="flex items-center gap-1.5"><FiMapPin size={13}/>{profile.location}</span>}
                  {profile?.social?.github   && <span className="flex items-center gap-1.5"><FiGithub size={13}/>github.com/{profile.social.github}</span>}
                  {profile?.social?.linkedin && <span className="flex items-center gap-1.5"><FiLinkedin size={13}/>linkedin.com/in/{profile.social.linkedin}</span>}
                  {profile?.website          && <span className="flex items-center gap-1.5"><FiGlobe size={13}/>{profile.website}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            {/* Summary */}
            {profile?.bio && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-3">
                  <span>Professional Summary</span><span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
              </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-3">
                  <span>Work Experience</span><span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                </h2>
                <div className="space-y-7">
                  {experience.map(exp => (
                    <div key={exp._id} className="flex gap-4">
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <div className="w-px flex-1 bg-slate-200 dark:bg-white/10 mt-1" />
                      </div>
                      <div className="pb-6 flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{exp.position}</span>
                            {exp.company && <span className="text-indigo-600 dark:text-indigo-400 font-semibold"> · {exp.company}</span>}
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {fmtDate(exp.startDate)} – {exp.current ? 'Present' : fmtDate(exp.endDate)}
                          </span>
                        </div>
                        {exp.location && <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><FiMapPin size={11}/>{exp.location}</p>}
                        {exp.description && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{exp.description}</p>}
                        {exp.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {exp.skills.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 rounded-md text-xs">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {Object.keys(skillGroups).length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-3">
                  <span>Technical Skills</span><span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(skillGroups).map(([cat, catSkills]) => (
                    <div key={cat}>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 capitalize">{cat}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {catSkills.map(s => (
                          <span key={s._id} className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certs.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-3">
                  <span>Certifications & Education</span><span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {certs.map(cert => (
                    <div key={cert._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <span className="text-xl flex-shrink-0">🏆</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{cert.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{cert.issuer}{cert.issueDate && ` · ${fmtDate(cert.issueDate)}`}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </motion.div>
      </div>

      <div className="print:hidden"><Footer /></div>

      <style>{`
        @media print {
          nav, .print\\:hidden, .no-print { display: none !important; }
          body { background: white !important; color: #111 !important; font-size: 11pt !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 0.5in; size: A4; }
          .print\\:bg-none { background: #4f46e5 !important; color: white !important; }
          .rounded-3xl, .rounded-2xl { border-radius: 4px !important; }
          .shadow-sm, .shadow { box-shadow: none !important; }
          h1 { font-size: 22pt !important; }
          h2 { font-size: 13pt !important; margin-bottom: 4pt !important; }
          p, li { font-size: 10pt !important; line-height: 1.5 !important; }
          .p-8, .p-10 { padding: 12pt !important; }
        }
      `}</style>
    </div>
  );
}
