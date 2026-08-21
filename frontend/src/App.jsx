// PATH: frontend/src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }  from '@contexts/AuthContext';
import { SocketProvider } from '@contexts/SocketContext';
import { SiteSettingsProvider } from '@contexts/SiteSettingsContext';
import { ThemeProvider }  from '@contexts/ThemeContext';
import { queryClient }   from '@lib/queryClient'; // ← use central config

// ── Admin pages ─────────────────────────────────────────────
import AdminSkills        from '@pages/admin/Skills';
import AdminExperience    from '@pages/admin/Experience';
import AdminLayout        from '@components/admin/AdminLayout';
import AdminDashboard     from '@pages/admin/Dashboard';
import AdminProjects      from '@pages/admin/Projects';
import AdminProjectEditor from '@pages/admin/ProjectEditor';
import AdminContacts      from '@pages/admin/Contacts';
import AdminAnalytics     from '@pages/admin/Analytics';
import AdminSettings      from '@pages/admin/Settings';
import AdminProfile       from '@pages/admin/Profile';
import AdminTestimonials  from '@pages/admin/Testimonials';
import AdminBlog          from '@pages/admin/Blog';
import AdminCertifications from '@pages/admin/Certifications';
import AdminServices      from '@pages/admin/Services';
import AdminSubscribers   from '@pages/admin/Subscribers';
import AdminMediaLibrary  from '@pages/admin/MediaLibrary';

// ── Public pages ─────────────────────────────────────────────
import HomePage           from '@pages/Home';
import ProjectsPage       from '@pages/Projects';
import ProjectDetailPage  from '@pages/ProjectDetail';
import ExperiencePage     from '@pages/Experience';
import AboutPage          from '@pages/About';
import ContactPage        from '@pages/Contact';
import LoginPage          from '@pages/Login';
import BlogListPage       from '@pages/BlogList';
import BlogPostPage       from '@pages/BlogPost';
import NotFound           from '@pages/NotFound';

import ResumePage    from '@pages/Resume';
import ServicesPage  from '@pages/Services';
import SearchPage    from '@pages/Search';
import AdminComments from '@pages/admin/Comments';
import AdminAuditLog from '@pages/admin/AuditLog';
import ProtectedRoute  from '@components/common/ProtectedRoute';
import { CursorGlow, ScrollProgressBar } from '@components/common/AnimationKit';
import { LiveVisitorDot } from '@components/common/LiveWidgets';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
   window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function App() {
  // ── DB Keepalive: silently wake up backend + MongoDB on app load ──────────
  // Works as Strategy B for Vercel: every page load triggers keepalive middleware
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';
    // Ping health — triggers keepalive.middleware() → pings MongoDB if needed
    fetch(`${apiBase}/health`, { method: 'GET' })
      .then(r => r.json())
      .then(d => {
        if (d?.keepalive?.minutesSinceDbPing > 8) {
          // DB was nearly sleeping — trigger explicit keepalive
          fetch(`${apiBase}/api/v1/keepalive`).catch(() => {});
        }
      })
      .catch(() => {}); // silently ignore — never breaks the app
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SocketProvider>
              <SiteSettingsProvider>
                <Router>
                  <ScrollToTop />
                  <Routes>
                    {/* ── PUBLIC ───────────────────────────────── */}
                    <Route path="/"                element={<HomePage />} />
                    <Route path="/projects"        element={<ProjectsPage />} />
                    <Route path="/projects/:slug"  element={<ProjectDetailPage />} />
                    <Route path="/experience"      element={<ExperiencePage />} />
                    <Route path="/about"           element={<AboutPage />} />
                    <Route path="/contact"         element={<ContactPage />} />
                    <Route path="/blog"            element={<BlogListPage />} />
                    <Route path="/blog/:slug"      element={<BlogPostPage />} />
                    <Route path="/login"           element={<LoginPage />} />
                    <Route path="/resume"          element={<ResumePage />} />
                    <Route path="/services"        element={<ServicesPage />} />
                    <Route path="/search"          element={<SearchPage />} />

                    {/* ── ADMIN ────────────────────────────────── */}
                    <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                      <Route index                      element={<AdminDashboard />} />
                      <Route path="projects"            element={<AdminProjects />} />
                      <Route path="projects/new"        element={<AdminProjectEditor />} />
                      <Route path="projects/:id/edit"   element={<AdminProjectEditor />} />
                      <Route path="contacts"            element={<AdminContacts />} />
                      <Route path="analytics"           element={<AdminAnalytics />} />
                      <Route path="settings"            element={<AdminSettings />} />
                      <Route path="profile"             element={<AdminProfile />} />
                      <Route path="testimonials"        element={<AdminTestimonials />} />
                      <Route path="blog"                element={<AdminBlog />} />
                      <Route path="certifications"      element={<AdminCertifications />} />
                      <Route path="services"            element={<AdminServices />} />
                      <Route path="skills"              element={<AdminSkills />} />
                      <Route path="subscribers"         element={<AdminSubscribers />} />
                      <Route path="media"               element={<AdminMediaLibrary />} />
                      <Route path="experience"          element={<AdminExperience />} />
                      <Route path="comments"            element={<AdminComments />} />
                      <Route path="audit-log"           element={<AdminAuditLog />} />
                    </Route>

                    {/* ── 404 ──────────────────────────────────── */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Router>
                <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
              <CursorGlow />
              <ScrollProgressBar />
              <LiveVisitorDot />
              </SiteSettingsProvider>
            </SocketProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;

