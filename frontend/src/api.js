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
