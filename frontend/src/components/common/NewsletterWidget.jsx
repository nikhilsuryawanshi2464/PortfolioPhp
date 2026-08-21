// frontend/src/components/common/NewsletterWidget.jsx
// Feature 15 — Newsletter Subscribe Widget
// Drop anywhere: <NewsletterWidget /> or <NewsletterWidget variant="inline" />
// Variants: "card" (default) | "inline" (compact, for footer)

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiSend, FiCheck } from 'react-icons/fi';
import api from '@services/api';
import toast from 'react-hot-toast';

export default function NewsletterWidget({ variant = 'card', source = 'website' }) {
  const [email, setEmail]   = useState('');
  const [name, setName]     = useState('');
  const [loading, setLoad]  = useState(false);
  const [done, setDone]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoad(true);
    try {
      await api.post('/subscribers', { email: email.trim(), name: name.trim(), source });
      setDone(true);
      toast.success('Subscribed! 🎉');
    } catch (err) {
      const msg = err.response?.data?.error || 'Subscription failed';
      if (msg.toLowerCase().includes('already')) {
        toast.success('You\'re already subscribed! 😊');
        setDone(true);
      } else {
        toast.error(msg);
      }
    }
    setLoad(false);
  };

  if (variant === 'inline') {
    // Compact version for footer
    return (
      <div>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="flex items-center gap-2 text-sm text-emerald-400">
              <FiCheck size={14}/> Subscribed! Thanks for joining.
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="flex gap-2">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-3 py-2 bg-white/5 border border-white/10 focus:border-indigo-400 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors"/>
              <button type="submit" disabled={loading}
                className="flex-shrink-0 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors">
                <FiSend size={14}/>
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Card variant — for blog sidebar or homepage section
  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <FiMail size={18}/>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Stay Updated</h3>
          <p className="text-xs text-slate-400">New posts & projects in your inbox</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            className="text-center py-4">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">You're subscribed!</p>
            <p className="text-xs text-slate-400 mt-1">I'll send you updates on new posts.</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="space-y-3">
            <input type="text" value={name} onChange={e=>setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-400 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"/>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-400 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"/>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              <FiSend size={13}/>
              {loading ? 'Subscribing…' : 'Subscribe'}
            </button>
            <p className="text-xs text-slate-400 text-center">No spam. Unsubscribe anytime.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
