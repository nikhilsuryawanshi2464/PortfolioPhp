import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, contactAPI, skillsAPI, experienceAPI, analyticsAPI } from '@services/api';
import { useAuth } from '@contexts/AuthContext';

const StatCard = ({ label, value, sub, icon, color, to, loading }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 16, padding: '20px 22px',
      cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#4a4a6a', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: loading ? '#2a2a3a' : color, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{loading ? '—' : value}</div>
        {sub && <div style={{ fontSize: 11, color: '#4a4a6a', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  </Link>
);

const QuickAction = ({ to, emoji, label, desc }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.background = '#16122a'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.background = '#0f0f1a'; }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#c4b5fd' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#4a4a6a', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  </Link>
);

const ActivityRow = ({ icon, text, time, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #0f0f18' }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, color: '#8a8aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
    </div>
    <div style={{ fontSize: 11, color: '#3a3a5a', flexShrink: 0 }}>{time}</div>
  </div>
);

const fmtTime = (d) => {
  if (!d) return '';
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [skillsByCategory, setSkillsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    Promise.allSettled([
      projectsAPI.getAll({ limit: 100 }),
      contactAPI.getAll({ limit: 5 }),
      skillsAPI.getAll(),
      experienceAPI.getAll(),
      analyticsAPI.getDashboard({ period: '7d' }),
    ]).then(([p, c, s, e, a]) => {
      const projects = p.value?.data?.data || [];
      const contacts = c.value?.data?.data || [];
      const skills = s.value?.data?.data || [];
      const analytics = a.value?.data?.data;
      const grouped = skills.reduce((acc, sk) => { acc[sk.category] = (acc[sk.category] || 0) + 1; return acc; }, {});
      setStats({
        projects: p.value?.data?.pagination?.total || projects.length,
        contacts: c.value?.data?.pagination?.total || contacts.length,
        skills: skills.length,
        experience: (e.value?.data?.data || []).length,
        views: analytics?.overview?.pageViews || 0,
        visitors: analytics?.overview?.uniqueVisitors || 0,
        published: projects.filter(x => x.published).length,
        drafts: projects.filter(x => !x.published).length,
        newMessages: contacts.filter(m => !m.status || m.status === 'new').length,
      });
      setRecentContacts(contacts.slice(0, 4));
      setRecentProjects(projects.slice(0, 4));
      setSkillsByCategory(grouped);
      setLoading(false);
    });
  }, []);

  const card = { background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 14, padding: '20px 22px' };
  const cardTitle = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px', color: '#3a3a5a', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' };

  return (
    <div style={{ color: '#e8e6f0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#e8e6f0', letterSpacing: '-0.5px' }}>
          {greeting}, {user?.name || 'Admin'} 👋
        </div>
        <div style={{ fontSize: 14, color: '#4a4a6a', marginTop: 4 }}>Here's what's happening with your portfolio today.</div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Projects" value={stats.projects} sub={`${stats.published || 0} live · ${stats.drafts || 0} draft`} icon="◈" color="#a78bfa" to="/admin/projects" loading={loading} />
        <StatCard label="Messages" value={stats.contacts} sub={stats.newMessages > 0 ? `${stats.newMessages} unread` : 'All read'} icon="✉️" color="#60a5fa" to="/admin/contacts" loading={loading} />
        <StatCard label="Skills" value={stats.skills} sub={`${Object.keys(skillsByCategory).length} categories`} icon="⚡" color="#34d399" to="/admin/skills" loading={loading} />
        <StatCard label="Experience" value={stats.experience} sub="Work history entries" icon="🏢" color="#f472b6" to="/admin/experience" loading={loading} />
      </div>

      {/* Analytics if available */}
      {(stats.views > 0 || stats.visitors > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          <StatCard label="Page Views (7d)" value={stats.views?.toLocaleString()} sub="Total page views" icon="👁️" color="#fb923c" to="/admin/analytics" loading={loading} />
          <StatCard label="Unique Visitors (7d)" value={stats.visitors?.toLocaleString()} sub="Distinct visitors" icon="🌍" color="#22d3ee" to="/admin/analytics" loading={loading} />
        </div>
      )}

      {/* Main 2-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Recent Messages */}
        <div style={card}>
          <div style={cardTitle}>
            <span>Recent Messages</span>
            <Link to="/admin/contacts" style={{ fontSize: 11, color: '#a78bfa', textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 44, background: '#1a1a2e', borderRadius: 8, marginBottom: 8 }} />
          )) : recentContacts.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#3a3a5a', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✉️</div>No messages yet
            </div>
          ) : recentContacts.map(c => (
            <ActivityRow key={c._id}
              icon={c.status === 'replied' ? '✅' : c.status === 'read' ? '👁️' : '🔵'}
              text={`${c.name} — ${c.subject || c.message?.slice(0, 35) + '...'}`}
              time={fmtTime(c.createdAt)} color="#60a5fa" />
          ))}
        </div>

        {/* Recent Projects */}
        <div style={card}>
          <div style={cardTitle}>
            <span>Recent Projects</span>
            <Link to="/admin/projects" style={{ fontSize: 11, color: '#a78bfa', textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 44, background: '#1a1a2e', borderRadius: 8, marginBottom: 8 }} />
          )) : recentProjects.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#3a3a5a', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>◈</div>
              <Link to="/admin/projects/new" style={{ color: '#a78bfa' }}>Add your first project →</Link>
            </div>
          ) : recentProjects.map(p => (
            <ActivityRow key={p._id}
              icon={p.published ? '🟢' : '⚪'}
              text={`${p.title} · ${p.category || 'web'}`}
              time={p.published ? 'Live' : 'Draft'} color={p.published ? '#34d399' : '#4a4a6a'} />
          ))}
        </div>

        {/* Skills breakdown */}
        <div style={card}>
          <div style={cardTitle}>
            <span>Skills by Category</span>
            <Link to="/admin/skills" style={{ fontSize: 11, color: '#a78bfa', textDecoration: 'none' }}>Manage →</Link>
          </div>
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 30, background: '#1a1a2e', borderRadius: 6, marginBottom: 6 }} />
          )) : Object.keys(skillsByCategory).length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#3a3a5a', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
              <Link to="/admin/skills" style={{ color: '#a78bfa' }}>Add your skills →</Link>
            </div>
          ) : Object.entries(skillsByCategory).map(([cat, count]) => (
            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #0f0f18' }}>
              <span style={{ fontSize: 13, color: '#6a6a8a', textTransform: 'capitalize' }}>{cat}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>{count} skill{count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={card}>
          <div style={cardTitle}><span>Quick Actions</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <QuickAction to="/admin/projects/new" emoji="➕" label="Add New Project" desc="Create & publish a project" />
            <QuickAction to="/admin/skills" emoji="⚡" label="Update Skills" desc="Add or edit your tech stack" />
            <QuickAction to="/admin/contacts" emoji="✉️" label="Check Messages" desc={stats.newMessages > 0 ? `${stats.newMessages} unread message${stats.newMessages !== 1 ? 's' : ''}` : 'View contact inbox'} />
            <QuickAction to="/admin/experience" emoji="🏢" label="Edit Experience" desc="Manage your work history" />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ background: 'linear-gradient(135deg,#16122a,#0f1a2e)', border: '1px solid #28244a', borderRadius: 14, padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
          <span style={{ fontSize: 13, color: '#6a6a8a' }}>Portfolio is <strong style={{ color: '#34d399' }}>live</strong> at</span>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none', fontFamily: 'monospace', background: '#1e1a3a', padding: '2px 10px', borderRadius: 6 }}>localhost:3000</a>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#4a4a6a' }}>
          <span>🟢 {stats.published || 0} published</span>
          <span>⚪ {stats.drafts || 0} drafts</span>
          <span>⚡ {stats.skills || 0} skills</span>
        </div>
        <Link to="/" target="_blank" style={{ fontSize: 12, color: '#a78bfa', textDecoration: 'none', padding: '6px 14px', border: '1px solid #2e2a4a', borderRadius: 8 }}>
          View Public Site ↗
        </Link>
      </div>
    </div>
  );
}
