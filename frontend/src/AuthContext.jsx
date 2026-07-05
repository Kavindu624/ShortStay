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

  const loginWithToken = async (token) => {
    localStorage.setItem('token', token);
    try {
      const res = await api.get('/profile');
      const u = res.data;
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return u;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(MOCK ? MOCK_USERS.admin : null);
  };

  /** Merge partial updates into the current user object (context + localStorage). */
  const updateUser = (patch) => {
    setUser(prev => {
      const merged = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  /**
   * Register a new user (guest or host).
   * The backend sends a verification email and returns { message }.
   * It does NOT log the user in automatically — they must verify first.
   * Returns { pendingVerification: true, email } so the caller can
   * display a "check your email" screen.
   */
  const register = async (data) => {
    if (MOCK) {
      // Mock mode: simulate immediate login as before
      const res = await api.post('/auth/register', data);
      const { token, user: u } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return { pendingVerification: false, user: u };
    }
    await api.post('/auth/register', data);
    return { pendingVerification: true, email: data.email };
  };

  // Mock-only: switch role without backend
  const switchMockRole = (role) => {
    if (!MOCK) return;
    localStorage.setItem('mock_role', role);
    setUser(MOCK_USERS[role] || MOCK_USERS.admin);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithToken, logout, register, updateUser, loading, switchMockRole, MOCK }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
