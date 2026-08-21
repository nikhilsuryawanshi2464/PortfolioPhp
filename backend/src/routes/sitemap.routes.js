// backend/src/routes/sitemap.routes.js
// Dynamic sitemap that includes ALL blog posts + projects
const express = require('express');
const router  = express.Router();
const Blog    = require('../models/Blog.model');
const Project = require('../models/Project.model');

const SITE_URL = process.env.SITE_URL || 'https://yourportfolio.com';

const urlTag = (loc, freq='monthly', priority='0.7', lastmod=null) => `
  <url>
    <loc>${SITE_URL}${loc}</loc>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`;

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [posts, projects] = await Promise.all([
      Blog.find({ published: true }, 'slug updatedAt').lean(),
      Project.find({ published: true }, 'slug updatedAt').lean(),
    ]);

    const staticRoutes = [
      urlTag('/', 'weekly', '1.0'),
      urlTag('/about', 'monthly', '0.8'),
      urlTag('/projects', 'weekly', '0.9'),
      urlTag('/blog', 'daily', '0.9'),
      urlTag('/services', 'monthly', '0.7'),
      urlTag('/experience', 'monthly', '0.7'),
      urlTag('/contact', 'yearly', '0.6'),
      urlTag('/resume', 'monthly', '0.7'),
    ];

    const postRoutes    = posts.map(p => urlTag(`/blog/${p.slug}`, 'weekly', '0.8', p.updatedAt));
    const projectRoutes = projects.map(p => urlTag(`/projects/${p.slug}`, 'monthly', '0.8', p.updatedAt));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...staticRoutes, ...postRoutes, ...projectRoutes].join('')}
</urlset>`.trim();

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1hr
    res.send(xml);
  } catch(e) {
    res.status(500).send('<?xml version="1.0"?><error>'+e.message+'</error>');
  }
});

router.get('/robots.txt', (req, res) => {
  const siteUrl = process.env.SITE_URL || 'https://yourportfolio.com';
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /login

Sitemap: ${siteUrl}/sitemap.xml`);
});

module.exports = router;
