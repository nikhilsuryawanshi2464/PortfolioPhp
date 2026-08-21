// PATH: frontend/src/hooks/useQueries.js
// All TanStack Query hooks for every API entity.
// Import only what you need in each page.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  profileAPI, skillsAPI, projectsAPI, experienceAPI, auditLogAPI, commentsAPI,
  testimonialsAPI, servicesAPI, blogAPI, certAPI,
  contactAPI, analyticsAPI, githubAPI, siteSettingsAPI,
} from '@services/api';

// ─── QUERY KEYS ───────────────────────────────────────────────
// Central place for all cache keys — prevents typos
export const QK = {
  profile:      ['profile'],
  skills:       ['skills'],
  experience:   ['experience'],
  projects:     (params) => params ? ['projects', params] : ['projects'],
  projectSlug:  (slug)   => ['project', slug],
  projectRelated:(id)    => ['project-related', id],
  testimonials: ['testimonials'],
  services:     ['services'],
  blog:         (params) => params ? ['blog', params] : ['blog'],
  blogPost:     (slug)   => ['blog-post', slug],
  certs:        ['certifications'],
  contacts:     (params) => params ? ['contacts', params] : ['contacts'],
  contactStats: ['contact-stats'],
  analytics:    (params) => params ? ['analytics', params] : ['analytics'],
  analyticsRT:  ['analytics-realtime'],
  github:       (username) => ['github', username],
  githubStats:  (username) => ['github-stats', username],
  siteSettings: ['site-settings'],
};

// ─────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────
export const useProfile = () =>
  useQuery({
    queryKey: QK.profile,
    queryFn:  () => profileAPI.get().then(r => r.data?.data || null),
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => profileAPI.update(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.profile }),
  });
};

// ─────────────────────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────────────────────
export const useSkills = () =>
  useQuery({
    queryKey: QK.skills,
    queryFn:  () => skillsAPI.getAll().then(r => r.data?.data || []),
  });

export const useCreateSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => skillsAPI.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.skills }),
  });
};

export const useUpdateSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => skillsAPI.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.skills }),
  });
};

export const useDeleteSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => skillsAPI.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.skills }),
  });
};

// ─────────────────────────────────────────────────────────────
// EXPERIENCE
// ─────────────────────────────────────────────────────────────
export const useExperience = () =>
  useQuery({
    queryKey: QK.experience,
    queryFn:  () => experienceAPI.getAll().then(r => r.data?.data || []),
  });

export const useCreateExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => experienceAPI.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.experience }),
  });
};

export const useUpdateExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => experienceAPI.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.experience }),
  });
};

export const useDeleteExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => experienceAPI.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.experience }),
  });
};

// ─────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────
export const useProjects = (params) =>
  useQuery({
    queryKey: QK.projects(params),
    queryFn:  () => projectsAPI.getAll(params).then(r => r.data?.data || []),
  });

export const useProjectBySlug = (slug) =>
  useQuery({
    queryKey: QK.projectSlug(slug),
    queryFn:  () => projectsAPI.getBySlug(slug).then(r => r.data?.data || null),
    enabled:  !!slug,
  });

export const useRelatedProjects = (id) =>
  useQuery({
    queryKey: QK.projectRelated(id),
    queryFn:  () => projectsAPI.getRelated(id).then(r => r.data?.data || []),
    enabled:  !!id,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectsAPI.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => projectsAPI.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectsAPI.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

// ─────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────
export const useTestimonials = () =>
  useQuery({
    queryKey: QK.testimonials,
    queryFn:  () => testimonialsAPI.getAll().then(r =>
      (r.data?.data || []).filter(x => x.visible !== false)
    ),
  });

export const useCreateTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => testimonialsAPI.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.testimonials }),
  });
};

export const useUpdateTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => testimonialsAPI.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.testimonials }),
  });
};

export const useDeleteTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => testimonialsAPI.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.testimonials }),
  });
};

// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────
export const useServices = () =>
  useQuery({
    queryKey: QK.services,
    queryFn:  () => servicesAPI.getAll().then(r =>
      (r.data?.data || []).filter(x => x.visible !== false)
    ),
  });

export const useCreateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => servicesAPI.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.services }),
  });
};

export const useUpdateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => servicesAPI.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.services }),
  });
};

export const useDeleteService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => servicesAPI.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.services }),
  });
};

// ─────────────────────────────────────────────────────────────
// BLOG
// ─────────────────────────────────────────────────────────────
export const useBlogPosts = (params) =>
  useQuery({
    queryKey: QK.blog(params),
    queryFn:  () => blogAPI.getAll(params).then(r => r.data?.data || []),
  });

export const useBlogPost = (slug) =>
  useQuery({
    queryKey: QK.blogPost(slug),
    queryFn:  () => blogAPI.getBySlug(slug).then(r => r.data?.data || null),
    enabled:  !!slug,
    retry:    (count, err) => err?.response?.status !== 404 && count < 1,
  });

export const useCreateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => blogAPI.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['blog'] }),
  });
};

export const useUpdateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => blogAPI.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['blog'] }),
  });
};

export const useDeleteBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => blogAPI.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['blog'] }),
  });
};

// ─────────────────────────────────────────────────────────────
// CERTIFICATIONS
// ─────────────────────────────────────────────────────────────
export const useCertifications = () =>
  useQuery({
    queryKey: QK.certs,
    queryFn:  () => certAPI.getAll().then(r => r.data?.data || []),
  });

export const useCreateCert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => certAPI.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.certs }),
  });
};

export const useUpdateCert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => certAPI.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.certs }),
  });
};

export const useDeleteCert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => certAPI.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.certs }),
  });
};

// ─────────────────────────────────────────────────────────────
// CONTACTS
// ─────────────────────────────────────────────────────────────
export const useContacts = (params) =>
  useQuery({
    queryKey: QK.contacts(params),
    queryFn:  () => contactAPI.getAll(params).then(r => r.data?.data || []),
  });

export const useContactStats = () =>
  useQuery({
    queryKey: QK.contactStats,
    queryFn:  () => contactAPI.getStats().then(r => r.data?.data || null),
  });

export const useUpdateContactStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => contactAPI.updateStatus(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
};

export const useDeleteContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => contactAPI.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
};

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────
export const useAnalyticsDashboard = (params) =>
  useQuery({
    queryKey: QK.analytics(params),
    queryFn:  () => analyticsAPI.getDashboard(params).then(r => r.data?.data || null),
    staleTime: 2 * 60 * 1000, // 2 min for analytics (changes more often)
  });

export const useAnalyticsRealtime = () =>
  useQuery({
    queryKey: QK.analyticsRT,
    queryFn:  () => analyticsAPI.getRealTime().then(r => r.data?.data || null),
    staleTime: 30 * 1000,      // 30 sec for realtime
    refetchInterval: 30 * 1000, // auto-refresh every 30 sec
  });

// ─────────────────────────────────────────────────────────────
// GITHUB
// ─────────────────────────────────────────────────────────────
export const useGithubRepos = (username) =>
  useQuery({
    queryKey: QK.github(username),
    queryFn:  () => githubAPI.getRepos(username).then(r => r.data?.data || []),
    enabled:  !!username,
    staleTime: 10 * 60 * 1000, // 10 min for GitHub (external API)
  });

export const useGithubStats = (username) =>
  useQuery({
    queryKey: QK.githubStats(username),
    queryFn:  () => githubAPI.getStats(username).then(r => r.data?.data || null),
    enabled:  !!username,
    staleTime: 10 * 60 * 1000,
  });

// ─────────────────────────────────────────────────────────────
// SITE SETTINGS
// ─────────────────────────────────────────────────────────────
export const useSiteSettings = () =>
  useQuery({
    queryKey: QK.siteSettings,
    queryFn:  () => siteSettingsAPI.get().then(r => r.data?.data || null),
  });

export const useUpdateSiteSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => siteSettingsAPI.update(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.siteSettings }),
  });
};

// ─────────────────────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────────────────────
export const useAuditLog = (params) =>
  useQuery({
    queryKey: ['audit-log', params],
    queryFn:  () => auditLogAPI.getAll(params).then(r => r.data || {}),
    staleTime: 60 * 1000,
  });

// ─────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────
export const useComments = (params) =>
  useQuery({
    queryKey: ['comments', params],
    queryFn:  () => commentsAPI.getAll(params).then(r => r.data || {}),
    staleTime: 60 * 1000,
  });
