import { createContext, useContext, useState } from 'react';
import api from './api';
import { MOCK_USERS } from './mockData';

const MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (MOCK) {
      // Default to admin in mock mode; RoleSwitcher will update this
      const stored = localStorage.getItem('mock_role') || 'admin';
      return MOCK_USERS[stored] || MOCK_USERS.admin;
    }
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: u } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(MOCK ? MOCK_USERS.admin : null);
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user: u } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  // Mock-only: switch role without backend
  const switchMockRole = (role) => {
    if (!MOCK) return;
    localStorage.setItem('mock_role', role);
    setUser(MOCK_USERS[role] || MOCK_USERS.admin);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, switchMockRole, MOCK }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
