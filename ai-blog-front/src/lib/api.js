import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

// Interceptor to add token to admin requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.url.includes('/admin')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const blogApi = {
  // Public
  getBlogs: (page = 1, category = '') => api.get(`/api/blogs?page=${page}&category=${category}`).then(res => res.data),
  getBlogBySlug: (slug) => api.get(`/api/blogs/${slug}`).then(res => res.data),
  getCategories: () => api.get('/api/blogs/categories').then(res => res.data),
  searchBlogs: (q) => api.get(`/api/blogs/search?q=${q}`).then(res => res.data),

  // Admin
  getAdminBlogs: (token) => api.get('/api/admin/blogs', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  getAdminBlogById: (id, token) => api.get(`/api/admin/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  updateBlog: (id, data, token) => api.put(`/api/admin/blogs/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  deleteBlog: (id, token) => api.delete(`/api/admin/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  togglePublish: (id, isPublished, token) => api.patch(`/api/admin/blogs/${id}/publish`, { is_published: isPublished }, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  
  getStats: (token) => api.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  getLogs: (token) => api.get('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  getBuffer: (token) => api.get('/api/admin/buffer', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  getRawNews: (token) => api.get('/api/admin/raw-news', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  
  triggerJob: (job, token) => api.post(`/api/jobs/${job}`, {}, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  
  getSettings: (token) => api.get('/api/settings', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
  updateSetting: (key, value, token) => api.put('/api/settings', { key, value }, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
};

export default api;
