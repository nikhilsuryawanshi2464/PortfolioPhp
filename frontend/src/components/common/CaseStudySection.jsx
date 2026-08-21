// frontend/src/components/common/CaseStudySection.jsx
// Feature 11 — Project Case Study Mode
// Drop inside ProjectDetail.jsx to show Problem → Solution → Results
// Data comes from project.caseStudy (add via Admin → Projects editor)

import { motion } from 'framer-motion';
import { FiTarget, FiZap, FiTrendingUp } from 'react-icons/fi';

const STEPS = [
  { key: 'problem',  label: 'The Problem',  icon: FiTarget,     color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  { key: 'solution', label: 'Our Solution', icon: FiZap,        color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
  { key: 'results',  label: 'The Results',  icon: FiTrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
];

export default function CaseStudySection({ caseStudy }) {
  if (!caseStudy) return null;
  const hasContent = STEPS.some(s => caseStudy[s.key]);
  const hasMetrics = caseStudy.metrics?.length > 0;
  if (!hasContent && !hasMetrics) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
        <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded"/>
        Case Study
      </h2>

      {/* Metrics row */}
      {hasMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {caseStudy.metrics.map((metric, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay: i*0.08 }}
              className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{metric.icon || '📈'}</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{metric.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Problem / Solution / Results */}
      <div className="space-y-5">
        {STEPS.filter(s => caseStudy[s.key]).map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div key={step.key}
              initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ delay: i*0.1 }}
              className="rounded-2xl p-6"
              style={{ background: step.bg, border: `1px solid ${step.border}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${step.color}20`, color: step.color }}>
                  <Icon size={16}/>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base" style={{ color: step.color }}>
                  {step.label}
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                {caseStudy[step.key]}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
