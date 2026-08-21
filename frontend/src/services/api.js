// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const AUTH_REDIRECT_PATH = '/login';

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

const redirectToLoginIfNeeded = () => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === AUTH_REDIRECT_PATH) return;
  window.location.replace(AUTH_REDIRECT_PATH);
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => { const t = localStorage.getItem('token'); if (t) config.headers.Authorization = `Bearer ${t}`; return config; },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    const status = err.response?.status;
    const url = orig?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh');
    const refreshToken = localStorage.getItem('refreshToken');

    if (status === 401 && orig && !orig._retry && !isAuthEndpoint && refreshToken) {
      orig._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        orig.headers = orig.headers || {};
        orig.headers.Authorization = `Bearer ${data.data.token}`;
        return api(orig);
      } catch {
        clearStoredAuth();
        redirectToLoginIfNeeded();
      }
    }

    if (status === 401 && isAuthEndpoint) {
      clearStoredAuth();
    }

    return Promise.reject(err);
  }
);

export const authAPI        = { login:(c)=>api.post('/auth/login',c), logout:()=>api.post('/auth/logout'), getMe:()=>api.get('/auth/me'), updatePassword:(d)=>api.put('/auth/password',d), refreshToken:(rt)=>api.post('/auth/refresh',{refreshToken:rt}) };
export const projectsAPI    = { getAll:(p)=>api.get('/projects',{params:p}), getById:(id)=>api.get(`/projects/id/${id}`), getBySlug:(s)=>api.get(`/projects/${s}`), search:(p)=>api.get('/projects/search',{params:p}), getRelated:(id)=>api.get(`/projects/${id}/related`), create:(d)=>api.post('/projects',d), update:(id,d)=>api.put(`/projects/${id}`,d), delete:(id)=>api.delete(`/projects/${id}`) };
export const contactAPI     = { submit:(d)=>api.post('/contact',d), getAll:(p)=>api.get('/contact',{params:p}), getById:(id)=>api.get(`/contact/${id}`), updateStatus:(id,d)=>api.put(`/contact/${id}/status`,d), addNote:(id,d)=>api.post(`/contact/${id}/notes`,d), delete:(id)=>api.delete(`/contact/${id}`), getStats:()=>api.get('/contact/stats') };
export const analyticsAPI   = { trackPageView:(d)=>api.post('/analytics/pageview',d), trackProjectView:(id)=>api.post(`/analytics/project/${id}`), trackResumeDownload:(f)=>api.post('/analytics/resume',{format:f}), trackEvent:(d)=>api.post('/analytics/event',d), getDashboard:(p)=>api.get('/analytics/dashboard',{params:p}), getRealTime:()=>api.get('/analytics/realtime') };
export const skillsAPI      = { getAll:()=>api.get('/skills'), create:(d)=>api.post('/skills',d), update:(id,d)=>api.put(`/skills/${id}`,d), delete:(id)=>api.delete(`/skills/${id}`) };
export const experienceAPI  = { getAll:()=>api.get('/experience'), create:(d)=>api.post('/experience',d), update:(id,d)=>api.put(`/experience/${id}`,d), delete:(id)=>api.delete(`/experience/${id}`) };
export const githubAPI      = { getRepos:(u)=>api.get('/github/repos',{params:{username:u}}), getStats:(u)=>api.get('/github/stats',{params:{username:u}}) };
export const resumeAPI      = { download:(f='pdf')=>api.get('/resume/download',{params:{format:f},responseType:'blob'}) };
export const profileAPI     = { get:()=>api.get('/profile'), update:(d)=>api.put('/profile',d), uploadAvatar:(fd)=>api.post('/profile/avatar',fd,{headers:{'Content-Type':'multipart/form-data'}}), uploadResume:(fd)=>api.post('/profile/resume',fd,{headers:{'Content-Type':'multipart/form-data'}}), deleteResume:()=>api.delete('/profile/resume'), getResumeDownloadUrl:()=>`${API_URL}/profile/resume/download` };
export const testimonialsAPI= { getAll:()=>api.get('/testimonials'), create:(d)=>api.post('/testimonials',d), update:(id,d)=>api.put(`/testimonials/${id}`,d), delete:(id)=>api.delete(`/testimonials/${id}`), uploadAvatar:(id,fd)=>api.post(`/testimonials/${id}/avatar`,fd,{headers:{'Content-Type':'multipart/form-data'}}) };
export const blogAPI        = { getAll:(p)=>api.get('/blog',{params:p}), getBySlug:(s)=>api.get(`/blog/${s}`), create:(d)=>api.post('/blog',d), update:(id,d)=>api.put(`/blog/${id}`,d), delete:(id)=>api.delete(`/blog/${id}`), uploadCover:(id,fd)=>api.post(`/blog/${id}/cover`,fd,{headers:{'Content-Type':'multipart/form-data'}}) };
export const certAPI        = { getAll:()=>api.get('/certifications'), create:(d)=>api.post('/certifications',d), update:(id,d)=>api.put(`/certifications/${id}`,d), delete:(id)=>api.delete(`/certifications/${id}`) };
export const servicesAPI    = { getAll:()=>api.get('/services'), create:(d)=>api.post('/services',d), update:(id,d)=>api.put(`/services/${id}`,d), delete:(id)=>api.delete(`/services/${id}`) };
export const siteSettingsAPI= { get:()=>api.get('/site-settings'), update:(d)=>api.put('/site-settings',d), testEmail:()=>api.post('/site-settings/test-email'), fetchGithubRepos:()=>api.get('/site-settings/github/repos'), syncGithubRepos:(repos)=>api.post('/site-settings/github/sync',{repos}) };

export default api;

export const commentsAPI = {
  getByPost: (postSlug) => api.get('/comments', { params: { post: postSlug } }),
  create:    (data)     => api.post('/comments', data),
  getAll:    (params)   => api.get('/comments/admin', { params }),
  updateStatus: (id, status) => api.put(`/comments/${id}/status`, { status }),
  delete:    (id)       => api.delete(`/comments/${id}`),
};

export const auditLogAPI = {
  getAll: (params) => api.get('/audit-log', { params }),
};
