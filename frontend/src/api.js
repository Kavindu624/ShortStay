import axios from 'axios';
import { mockRequest } from './mockApi';

const MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

const API_PORT = 5000;
const baseURL = window.location.hostname === 'localhost' 
  ? `http://localhost:${API_PORT}/api`
  : `http://${window.location.hostname}:${API_PORT}/api`;

const api = axios.create({ baseURL });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

function showPopup(msg) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.bottom = '24px';
  div.style.right = '24px';
  div.style.background = '#dc2626';
  div.style.color = 'white';
  div.style.padding = '16px 24px';
  div.style.borderRadius = '12px';
  div.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  div.style.zIndex = '9999';
  div.style.fontFamily = 'Inter, system-ui, sans-serif';
  div.style.fontSize = '14px';
  div.style.fontWeight = '600';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.gap = '8px';
  div.style.transition = 'all 0.3s ease-in-out';
  div.style.transform = 'translateY(20px)';
  div.style.opacity = '0';
  div.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> <span>${msg}</span>`;
  document.body.appendChild(div);
  
  // Animate in
  setTimeout(() => {
    div.style.transform = 'translateY(0)';
    div.style.opacity = '1';
  }, 10);

  // Animate out
  setTimeout(() => {
    div.style.opacity = '0';
    div.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (document.body.contains(div)) document.body.removeChild(div);
    }, 300);
  }, 4000);
}

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicPrefixes = ['/login', '/register', '/forgot-password', '/verify-email', '/auth', '/browse', '/property', '/about', '/contact'];
      const isPublic = currentPath === '/' || publicPrefixes.some(p => currentPath === p || currentPath.startsWith(p + '/') || currentPath.startsWith(p));
      // Don't redirect if we're already on a public page (avoid redirect loop)
      if (!isPublic) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Global handler for restricted actions (403 Forbidden)
    if (err.response?.status === 403) {
      showPopup(err.response?.data?.message || 'Access Denied: You do not have permission to perform this action.');
    }
    
    return Promise.reject(err);
  }
);

// Override get/post/put/patch/delete when mock mode is on
if (MOCK) {
  const wrap = (method) => (url, bodyOrConfig, config) => {
    const body = method === 'get' ? null : bodyOrConfig;
    return mockRequest(method, url, body);
  };
  api.get    = wrap('get');
  api.post   = wrap('post');
  api.put    = wrap('put');
  api.patch  = wrap('patch');
  api.delete = wrap('delete');
}

export default api;
