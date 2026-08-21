// backend/src/routes/og.routes.js
// Feature 5 — Auto OG Image Generation
// Generates og:image PNG for blog posts and projects using pure Node/Canvas-like HTML
// Works on Vercel serverless — returns an SVG-based image as PNG via sharp or just SVG

const express = require('express');
const router  = express.Router();
const Blog    = require('../models/Blog.model');
const Project = require('../models/Project.model');

// Generate SVG og image — returns image/svg+xml which social crawlers accept
const buildSVG = ({ title, subtitle, type, date }) => {
  const T = encodeURIComponent(title || '').replace(/%20/g, ' ');
  const S = encodeURIComponent(subtitle || '').replace(/%20/g, ' ');
  const clean = (str) => (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const lines = wordWrap(clean(title || ''), 28);
  const titleY = lines.length > 1 ? 260 : 290;

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#060612"/>
      <stop offset="100%" stop-color="#0d0d2b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- grid overlay -->
  <g opacity="0.04" stroke="#6366f1" stroke-width="1">
    ${Array.from({length:12},(_,i)=>`<line x1="${100*i}" y1="0" x2="${100*i}" y2="630"/>`).join('')}
    ${Array.from({length:7},(_,i)=>`<line x1="0" y1="${90*i}" x2="1200" y2="${90*i}"/>`).join('')}
  </g>
  <!-- accent line -->
  <rect x="80" y="80" width="160" height="4" rx="2" fill="url(#accent)"/>
  <!-- type badge -->
  <rect x="80" y="108" width="${type === 'blog' ? 100 : 120}" height="32" rx="8" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" stroke-width="1"/>
  <text x="130" y="129" font-family="system-ui,sans-serif" font-size="14" fill="#a78bfa" text-anchor="middle" font-weight="600">${type === 'blog' ? '✍️ Blog' : '💻 Project'}</text>
  <!-- Title lines -->
  ${lines.map((line,i)=>`<text x="80" y="${titleY + i*70}" font-family="system-ui,sans-serif" font-size="56" font-weight="800" fill="white">${clean(line)}</text>`).join('')}
  <!-- Subtitle -->
  <text x="80" y="${titleY + lines.length*70 + 20}" font-family="system-ui,sans-serif" font-size="24" fill="#94a3b8">${clean((subtitle||'').slice(0,60))}${(subtitle||'').length>60?'…':''}</text>
  <!-- Footer -->
  <text x="80" y="570" font-family="system-ui,sans-serif" font-size="20" fill="#4b5563">${clean(date || '')}</text>
  <text x="1120" y="570" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="url(#accent)" text-anchor="end">portfolio</text>
</svg>`;
};

function wordWrap(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= maxChars) cur = (cur + ' ' + w).trim();
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2); // max 2 lines
}

// GET /api/v1/og/blog/:slug
router.get('/blog/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, published: true }).lean();
    if (!post) return res.status(404).send('Not found');
    const svg = buildSVG({
      title:    post.title,
      subtitle: post.excerpt || post.tags?.join(', ') || '',
      type:     'blog',
      date:     post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '',
    });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  } catch(e) { res.status(500).send(e.message); }
});

// GET /api/v1/og/project/:slug
router.get('/project/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, published: true }).lean();
    if (!project) return res.status(404).send('Not found');
    const svg = buildSVG({
      title:    project.title,
      subtitle: (project.technologies || []).slice(0,4).join(' · ') || project.description?.slice(0,60) || '',
      type:     'project',
      date:     project.year || new Date(project.createdAt).getFullYear().toString(),
    });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  } catch(e) { res.status(500).send(e.message); }
});

module.exports = router;
