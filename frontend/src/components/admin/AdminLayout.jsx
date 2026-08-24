// PATH: frontend/src/components/admin/AdminLayout.jsx

import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const nav = [
  { to: '/admin', label: 'Dashboard', exact: true, icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { to: '/admin/projects', label: 'Projects', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
  )},
  { to: '/admin/skills', label: 'Skills', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  )},
  { to: '/admin/experience', label: 'Experience', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
  )},
  { to: '/admin/contacts', label: 'Contacts', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  )},
  { to: '/admin/analytics', label: 'Analytics', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  )},
  { to: '/admin/blog', label: 'Blog', icon: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
  )},
  { to: '/admin/certifications', label: 'Education', icon: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
  )},
  { to: '/admin/services', label: 'Services', icon: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
  )},
  { to: '/admin/testimonials', label: 'Testimonials', icon: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>
  )},
  { to: '/admin/profile', label: 'Profile', icon: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { to: '/admin/comments', label: 'Comments', icon: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="12" y2="13"/></svg>
  )},
  { to: '/admin/media', label: 'Media Library', icon: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
  )},
  { to: '/admin/subscribers', label: 'Subscribers', icon: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  )},
  { to: '/admin/audit-log', label: 'Audit Log', icon: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  )},
  { to: '/admin/settings', label: 'Settings', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  )},
];

const AdminLayout = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout, user } = useAuth ? useAuth() : { logout: () => {}, user: { name: 'Admin' } };

  // ── mobile sidebar state ──────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const isActive = (to, exact) => exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  const handleLogout = () => { if (logout) logout(); navigate('/login'); };

  const currentLabel = nav.find(n => isActive(n.to, n.exact))?.label || 'Dashboard';

  // ── Sidebar content (shared between desktop & mobile) ────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="adm-logo">
        <div className="adm-logo-text">Portfolio</div>
        <div className="adm-logo-sub">Admin Panel</div>
      </div>

      {/* Nav links */}
      <nav className="adm-nav">
        {nav.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`adm-nav-item${isActive(item.to, item.exact) ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User + logout */}
      <div className="adm-footer">
        <div className="adm-user">
          <div className="adm-avatar">{(user?.name || 'A')[0]}</div>
          <div className="adm-user-info">
            <div className="adm-user-name">{user?.name || 'Admin'}</div>
            <div className="adm-user-role">Administrator</div>
          </div>
        </div>
        <button className="adm-logout" onClick={handleLogout}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Base ── */
        .adm-root { font-family: 'DM Sans', sans-serif; display: flex; min-height: 100vh; background: #0a0a0f; color: #e8e6f0; }

        /* ── Desktop Sidebar ── */
        .adm-sidebar {
          width: 240px; min-height: 100vh;
          background: #0f0f1a; border-right: 1px solid #1e1e2e;
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
          transition: transform 0.3s ease;
        }

        /* ── Mobile Sidebar ── */
        @media (max-width: 1023px) {
          .adm-sidebar {
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0,0,0,0.5);
          }
          .adm-sidebar.open {
            transform: translateX(0);
          }
        }

        /* ── Overlay ── */
        .adm-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(2px);
          z-index: 49;
        }
        .adm-overlay.show { display: block; }

        /* ── Logo ── */
        .adm-logo { padding: 28px 24px 24px; border-bottom: 1px solid #1e1e2e; }
        .adm-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
        .adm-logo-sub { font-size: 11px; color: #4a4a6a; margin-top: 2px; text-transform: uppercase; letter-spacing: 1.5px; }

        /* ── Nav ── */
        .adm-nav { flex: 1; padding: 20px 12px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .adm-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 500; color: #6b6b8a; text-decoration: none; transition: all 0.2s; cursor: pointer; border: none; background: none; width: 100%; white-space: nowrap; }
        .adm-nav-item:hover { color: #c4b5fd; background: #1a1a2e; }
        .adm-nav-item.active { color: #a78bfa; background: #1e1a3a; }
        .adm-nav-item span { overflow: hidden; text-overflow: ellipsis; }

        /* ── Footer / User ── */
        .adm-footer { padding: 16px 12px; border-top: 1px solid #1e1e2e; flex-shrink: 0; }
        .adm-user { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; margin-bottom: 8px; min-width: 0; }
        .adm-user-info { min-width: 0; }
        .adm-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #a78bfa, #60a5fa); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: white; flex-shrink: 0; }
        .adm-user-name { font-size: 13px; font-weight: 500; color: #c4b5fd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adm-user-role { font-size: 11px; color: #4a4a6a; }
        .adm-logout { display: flex; align-items: center; gap: 10px; padding: 9px 14px; border-radius: 10px; font-size: 13px; color: #6b6b8a; cursor: pointer; border: none; background: none; width: 100%; transition: all 0.2s; font-family: inherit; }
        .adm-logout:hover { color: #f87171; background: #1f1520; }

        /* ── Main ── */
        .adm-main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; min-width: 0; }
        @media (max-width: 1023px) { .adm-main { margin-left: 0; } }

        /* ── Topbar ── */
        .adm-topbar { height: 60px; border-bottom: 1px solid #1e1e2e; display: flex; align-items: center; padding: 0 20px; background: #0a0a0f; position: sticky; top: 0; z-index: 40; gap: 12px; }
        .adm-hamburger { display: none; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; border: 1px solid #1e1e2e; background: #0f0f1a; color: #a78bfa; cursor: pointer; flex-shrink: 0; transition: all 0.2s; }
        .adm-hamburger:hover { background: #1a1a2e; border-color: #2e2a4a; }
        @media (max-width: 1023px) { .adm-hamburger { display: flex; } }

        .adm-breadcrumb { font-size: 13px; color: #4a4a6a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adm-breadcrumb span { color: #a78bfa; font-weight: 500; }

        .adm-view-site { display: flex; align-items: center; gap: 6px; margin-left: auto; padding: 7px 14px; border-radius: 8px; font-size: 13px; color: #a78bfa; border: 1px solid #2e2a4a; text-decoration: none; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
        .adm-view-site:hover { background: #1e1a3a; }
        @media (max-width: 480px) {
          .adm-view-site span { display: none; }
          .adm-view-site { padding: 7px 10px; }
        }

        /* ── Content ── */
        .adm-content { flex: 1; padding: 28px 32px; }
        @media (max-width: 768px) { .adm-content { padding: 20px 16px; } }
        @media (max-width: 480px) { .adm-content { padding: 16px 12px; } }

        /* ── Close button inside sidebar (mobile only) ── */
        .adm-close-btn {
          display: none;
          position: absolute; top: 16px; right: 16px;
          width: 30px; height: 30px; border-radius: 6px;
          border: 1px solid #2e2a4a; background: #1a1a2e;
          color: #6b6b8a; cursor: pointer; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .adm-close-btn:hover { color: #f87171; border-color: #f87171; background: #1f1520; }
        @media (max-width: 1023px) { .adm-close-btn { display: flex; } }

        /* ── Global Mobile Responsiveness for Admin Pages ── */
        @media (max-width: 768px) {
          /* Force all inline grids to be single column */
          .adm-content div[style*="display: grid"],
          .adm-content div[style*="display:grid"] {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          /* Make all tables scroll horizontally instead of squishing */
          .adm-content table {
            display: block;
            width: 100%;
            overflow-x: auto;
            white-space: nowrap;
          }
          
          /* Fix top header rows in pages that use flex space-between */
          .adm-content div[style*="justify-content: space-between"] {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
          
          /* Make sure inputs and textareas take full width */
          .adm-content input, .adm-content textarea {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="adm-root">

        {/* ── Dark overlay (mobile) ── */}
        <div
          className={`adm-overlay${sidebarOpen ? ' show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── Sidebar ── */}
        <aside className={`adm-sidebar${sidebarOpen ? ' open' : ''}`}>
          {/* Close button — mobile only */}
          <button className="adm-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <SidebarContent />
        </aside>

        {/* ── Main area ── */}
        <main className="adm-main">

          {/* Topbar */}
          <div className="adm-topbar">
            {/* Hamburger — mobile only */}
            <button
              className="adm-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </button>

            <span className="adm-breadcrumb">
              Admin / <span>{currentLabel}</span>
            </span>

            <Link to="/" className="adm-view-site">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
              <span>View Site</span>
            </Link>
          </div>

          {/* Page content */}
          <div className="adm-content">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
