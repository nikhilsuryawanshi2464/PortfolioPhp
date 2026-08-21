const express      = require('express');
const router       = express.Router();
const axios        = require('axios');
const SiteSettings = require('../models/SiteSettings.model');
const { sendContactNotification } = require('../utils/email');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/v1/site-settings  — public (frontend needs this for nav, SEO, theme)
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    res.json({ success:true, data:settings });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// PUT /api/v1/site-settings  — admin only
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    let doc = await SiteSettings.findOne();
    if (!doc) doc = new SiteSettings({});

    const scalars = ['siteName','ownerName','tagline','bio','availableForWork','contactEmail',
      'phone','location','showHireBtn','hireBtnLabel','calendlyUrl','footerText'];
    scalars.forEach(k => { if (req.body[k] !== undefined) doc[k] = req.body[k]; });

    const nested = ['social','seo','theme','emailNotifications','github','logoText'];
    nested.forEach(k => {
      if (req.body[k] !== undefined) {
        const existing = doc[k]?.toObject?.() || doc[k] || {};
        doc[k] = { ...existing, ...req.body[k] };
      }
    });

    if (req.body.navLinks !== undefined) doc.navLinks = req.body.navLinks;

    await doc.save();
    logger.info(`Site settings updated by ${req.user?.email}`);
    res.json({ success:true, data:doc });
  } catch(e) { res.status(400).json({ success:false, error:e.message }); }
});

// POST /api/v1/site-settings/test-email
router.post('/test-email', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    const to = settings.emailNotifications?.adminEmail || process.env.ADMIN_EMAIL;
    if (!to) return res.status(400).json({ success:false, error:'No admin email configured' });
    if (!process.env.SMTP_HOST||!process.env.SMTP_USER)
      return res.status(400).json({ success:false, error:'SMTP not configured in .env' });
    await sendContactNotification({ name:'Test User', email:to, subject:'Test Email from Portfolio',
      message:'This confirms your email setup is working.', category:'general' });
    res.json({ success:true, message:`Test email sent to ${to}` });
  } catch(e) { res.status(500).json({ success:false, error:`Email failed: ${e.message}` }); }
});

// GET /api/v1/site-settings/github/repos
router.get('/github/repos', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    const username = settings.github?.username || process.env.GITHUB_USERNAME;
    if (!username) return res.status(400).json({ success:false, error:'GitHub username not set in Site Settings' });
    const token = process.env.GITHUB_TOKEN;
    const headers = token ? { Authorization:`token ${token}` } : {};
    const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, { headers });
    const repos = response.data.map(r => ({
      id:r.id, name:r.name, fullName:r.full_name, description:r.description,
      url:r.html_url, homepage:r.homepage, stars:r.stargazers_count,
      forks:r.forks_count, language:r.language, topics:r.topics,
      updatedAt:r.updated_at, isPrivate:r.private,
    }));
    res.json({ success:true, data:repos, count:repos.length });
  } catch(e) {
    if (e.response?.status===404) return res.status(404).json({ success:false, error:'GitHub user not found' });
    if (e.response?.status===403) return res.status(403).json({ success:false, error:'GitHub rate limit. Add GITHUB_TOKEN to .env' });
    res.status(500).json({ success:false, error:e.message });
  }
});

// POST /api/v1/site-settings/github/sync
router.post('/github/sync', protect, authorize('admin'), async (req, res) => {
  try {
    const { repos } = req.body;
    if (!repos?.length) return res.status(400).json({ success:false, error:'No repos provided' });
    const Project = require('../models/Project.model');
    const results = [];
    for (const repo of repos) {
      const existing = await Project.findOne({ 'links.github': repo.url });
      if (existing) { results.push({ name:repo.name, action:'skipped', reason:'already exists' }); continue; }
      const project = await Project.create({
        title: repo.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
        slug:  repo.name.toLowerCase(),
        description: repo.description || `${repo.name} — a GitHub project`,
        content: repo.description || `This project is available on GitHub: ${repo.url}`,
        technologies: repo.language ? [repo.language] : [],
        tags: repo.topics || [],
        links: { github:repo.url, live:repo.homepage||'' },
        published:false, featured:false, author:req.user.id,
      });
      results.push({ name:repo.name, action:'created', id:project._id });
    }
    await SiteSettings.findOneAndUpdate({}, { 'github.syncedAt':new Date() });
    res.json({ success:true, data:results, synced:results.filter(r=>r.action==='created').length });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;
