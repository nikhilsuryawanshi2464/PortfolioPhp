// PUBLIC BLOG POST PAGE  
// File: frontend/src/pages/BlogPost.jsx
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiTag, FiShare2, FiCheck } from 'react-icons/fi';
import Nav from '@components/common/Nav';
import Footer from '@components/common/Footer';
import { useBlogPost } from '@hooks/useQueries';
import { ReactionBar, ViewBadge } from '@components/common/LiveWidgets';
import ReadingProgress from '@components/common/ReadingProgress';
import BlogComments from '@components/common/BlogComments';
import NewsletterWidget from '@components/common/NewsletterWidget';
import SocialShareBar from '@components/common/SocialShareBar';
import TableOfContents from '@components/common/TableOfContents';
import { SectionReveal, TextReveal } from '@components/common/AnimationKit';
import SEO from '@components/common/SEO';
import { usePageTracking } from '@hooks/useAnalytics';

// Simple markdown-to-HTML renderer
function renderMarkdown(md = '') {
  return md
    .replace(/^#{6} (.+)$/gm, '<h6 style="font-size:13px;font-weight:700;color:#e8e6f0;margin:16px 0 8px">$1</h6>')
    .replace(/^#{5} (.+)$/gm, '<h5 style="font-size:14px;font-weight:700;color:#e8e6f0;margin:16px 0 8px">$1</h5>')
    .replace(/^#{4} (.+)$/gm, '<h4 style="font-size:16px;font-weight:800;color:#e8e6f0;margin:20px 0 10px">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:20px;font-weight:800;color:#c4b5fd;margin:24px 0 12px">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:24px;font-weight:900;color:#e8e6f0;margin:32px 0 14px">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:30px;font-weight:900;color:#e8e6f0;margin:36px 0 16px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e8e6f0;font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em style="color:#a5b4fc">$1</em>')
    .replace(/`{3}([\w]*)\n([\s\S]*?)`{3}/gm, (_, lang, code) => {
      const escapedCode = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<div class="code-block" style="position:relative;margin:20px 0">
        <button class="copy-btn" onclick="(function(btn){const code=btn.parentNode.querySelector('code');navigator.clipboard.writeText(code.innerText||code.textContent||'').then(()=>{btn.textContent='✓ Copied!';btn.style.color='#10b981';setTimeout(()=>{btn.textContent='Copy';btn.style.color='#6b7280';},2000)}).catch(()=>{})})(this)" style="position:absolute;top:10px;right:12px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);color:#6b7280;padding:3px 10px;border-radius:6px;font-size:11px;cursor:pointer;z-index:10;font-family:inherit;transition:all 0.2s">Copy</button>
        ${lang ? `<div style="position:absolute;top:10px;left:14px;font-size:10px;color:#4b5563;font-family:monospace;text-transform:uppercase;letter-spacing:1px">${lang}</div>` : ''}
        <pre style="background:#0d0d1f;border:1px solid #2e2a4a;border-radius:12px;padding:${lang ? '36px' : '20px'} 20px 20px;overflow-x:auto"><code style="font-family:monospace;font-size:13px;color:#a5b4fc;line-height:1.7">${escapedCode}</code></pre>
      </div>`;
    })
    .replace(/`([^`]+)`/g, '<code style="background:#1a1a2e;padding:2px 7px;border-radius:5px;color:#60a5fa;font-size:13px;font-family:monospace">$1</code>')
    .replace(/^\s*[-*+] (.+)$/gm, '<li style="margin:6px 0;color:#94a3b8;padding-left:4px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, m => `<ul style="margin:16px 0;padding-left:24px;list-style:disc">${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:6px 0;color:#94a3b8">$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #6366f1;padding:12px 16px;margin:20px 0;background:#1a1a2e;border-radius:0 8px 8px 0;color:#94a3b8;font-style:italic">$1</blockquote>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#6366f1;text-decoration:underline;text-underline-offset:3px">$1</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:12px;margin:20px 0;border:1px solid #2e2a4a" />')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #2e2a4a;margin:32px 0" />')
    .replace(/\n\n/g, '</p><p style="margin:16px 0;color:#94a3b8;line-height:1.85;font-size:17px">')
    .replace(/^(?!<[h|u|o|l|p|b|c|p|i|a|s])(.+)$/gm, (m) => m.trim() ? m : '')
    .replace(/^(.{1})/, (m) => m.startsWith('<') ? m : `<p style="margin:16px 0;color:#94a3b8;line-height:1.85;font-size:17px">${m}`);
}

export default function BlogPostPage() {
  const { slug }    = useParams();
  const [copied, setCopied] = useState(false);
  const { data: post, isLoading: loading, isError } = useBlogPost(slug);
  usePageTracking();
  const notFound = isError || (!loading && !post);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) return (
    <div className="min-h-screen bg-[#060612]"><Nav />
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading article...</p>
      </div>
    </div>
  );

  if (notFound || !post) return (
    <div className="min-h-screen bg-[#060612]"><Nav />
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-5">
        <div className="text-6xl">🔍</div>
        <h2 className="text-3xl font-black text-white">Article not found</h2>
        <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors"><FiArrowLeft /> Back to Blog</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060612] text-slate-900 dark:text-white transition-colors duration-300">
      <SEO
        page="blog"
        title={post?.title}
        description={(post?.excerpt || post?.content || '').replace(/<[^>]*>/g,'').slice(0, 155)}
        image={post?.coverImage?.url}
        type="article"
        article={{ publishedAt: post?.createdAt, author: post?.author, tags: post?.tags }}
      />
      <ReadingProgress />
      <Nav />

      {/* Cover image as blurred hero */}
      {post.coverImage?.url && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={post.coverImage.url} alt={post.title} className="w-full h-full object-cover blur-sm scale-105 opacity-40 dark:opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 to-slate-50 dark:from-[#060612]/60 dark:to-[#060612]" />
        </div>
      )}

      <article className={`max-w-3xl mx-auto px-4 pb-24 ${post.coverImage?.url ? '-mt-16 relative z-10' : 'pt-28'}`}>

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 group">
            <FiArrowLeft /> Back to Blog
          </Link>
        </motion.div>

        {/* Cover image */}
        {post.coverImage?.url && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
            <img src={post.coverImage.url} alt={post.title} className="w-full object-cover max-h-80" />
          </motion.div>
        )}

        {/* Meta */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3 mb-6 items-center">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full capitalize">{post.category}</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-400"><FiCalendar size={13} />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-400"><FiClock size={13} />{post.readTime || 1} min read</span>
          {(post.views || 0) > 0 && <ViewBadge count={post.views} />}
          <button onClick={handleShare} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {copied ? <><FiCheck size={13} className="text-green-500" /> Copied!</> : <><FiShare2 size={13} /> Share</>}
          </button>
        </motion.div>

        {/* Title */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease: [0.16,1,0.3,1] }}
          className="text-3xl md:text-4xl font-black leading-tight text-slate-900 dark:text-white mb-4">
          {post.title}
        </motion.h1>

        {/* Excerpt */}
        {post.excerpt && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-8 pb-8 border-b border-slate-200 dark:border-white/10 italic">
            {post.excerpt}
          </motion.p>
        )}

        {/* Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="lg:flex lg:gap-10">
          <div className="prose-custom flex-1 blog-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}/>
          <aside className="hidden lg:block w-56 flex-shrink-0"><div style={{position:"sticky",top:100}}><TableOfContents content={post.content}/></div></aside>
        </motion.div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-200 dark:border-white/10">
            <FiTag size={14} className="text-slate-400 mt-1" />
            {post.tags.map(tag => (
              <Link key={tag} to={`/blog?tag=${tag}`} className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/30 rounded-full text-sm transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author */}
        <div className="mt-10 p-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-4">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.name} className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-500/30" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-300">
              {post.author?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
          <div>
            <div className="font-bold text-slate-900 dark:text-white">{post.author?.name || 'Author'}</div>
            {post.author?.bio && <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{post.author.bio}</div>}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex justify-between mt-10">
          <Link to="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-white/10 transition-all text-sm">
            <FiArrowLeft /> All Articles
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm">
            Let's Talk →
          </Link>
        </div>
      </article>

      {/* Reaction Bar */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="pt-8 border-t border-slate-200 dark:border-white/10">
          <SocialShareBar title={post?.title} url={window.location.href} />
          <p className="text-sm text-slate-400 mb-4 font-medium">Found this helpful?</p>
          <ReactionBar slug={post?.slug || slug} />
          <div className="mt-8"><NewsletterWidget source="blog" /></div>
        </div>
      </div>
    </div>
  );
}
