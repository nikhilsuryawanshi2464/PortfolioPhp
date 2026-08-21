// GITHUB ROUTES — Real GitHub API Integration
// File: backend/src/routes/github.routes.js
const express = require('express');
const router  = express.Router();
const axios   = require('axios');

// GET /api/v1/github/repos?username=xxx
// Public — no auth needed, used on portfolio homepage
router.get('/repos', async (req, res) => {
  try {
    const username = req.query.username || process.env.GITHUB_USERNAME;
    if (!username) return res.json({ success: true, data: [], message: 'No GitHub username configured' });

    const token = process.env.GITHUB_TOKEN;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      ...(token ? { 'Authorization': `token ${token}` } : {}),
    };

    const [reposRes, userRes] = await Promise.allSettled([
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12&type=public`, { headers }),
      axios.get(`https://api.github.com/users/${username}`, { headers }),
    ]);

    const repos = (reposRes.value?.data || [])
      .filter(r => !r.fork)
      .map(r => ({
        id:          r.id,
        name:        r.name,
        fullName:    r.full_name,
        description: r.description || '',
        url:         r.html_url,
        homepage:    r.homepage || '',
        stars:       r.stargazers_count,
        forks:       r.forks_count,
        language:    r.language || '',
        topics:      r.topics || [],
        updatedAt:   r.updated_at,
        isPrivate:   r.private,
      }));

    const user = userRes.value?.data ? {
      name:        userRes.value.data.name,
      bio:         userRes.value.data.bio,
      publicRepos: userRes.value.data.public_repos,
      followers:   userRes.value.data.followers,
      following:   userRes.value.data.following,
      avatar:      userRes.value.data.avatar_url,
      url:         userRes.value.data.html_url,
    } : null;

    res.json({ success: true, data: repos, user, count: repos.length });
  } catch (err) {
    if (err.response?.status === 403) return res.status(429).json({ success: false, error: 'GitHub rate limit exceeded. Set GITHUB_TOKEN in .env' });
    if (err.response?.status === 404) return res.status(404).json({ success: false, error: 'GitHub user not found' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/github/stats?username=xxx  — contribution stats
router.get('/stats', async (req, res) => {
  try {
    const username = req.query.username || process.env.GITHUB_USERNAME;
    if (!username) return res.json({ success: true, data: null });

    const token = process.env.GITHUB_TOKEN;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      ...(token ? { 'Authorization': `token ${token}` } : {}),
    };

    // Get repos to calculate total stars / languages
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&type=public`, { headers });
    const repos = reposRes.data || [];

    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const totalForks = repos.reduce((acc, r) => acc + r.forks_count, 0);

    const langCount = {};
    repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
    const topLanguages = Object.entries(langCount).sort((a,b) => b[1]-a[1]).slice(0,5).map(([lang, count]) => ({ lang, count }));

    res.json({
      success: true,
      data: {
        totalRepos: repos.length,
        totalStars,
        totalForks,
        topLanguages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
