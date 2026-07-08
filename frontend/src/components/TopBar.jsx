import { useState, useEffect, useRef } from 'react';
import { Bell, User, X, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { getProfileUrl } from '../utils';

const panelLabel = {
  guest: 'Guest Panel',
  host: 'Host Panel',
  admin: 'Admin Panel',
  verifier: 'Verifier Panel',
  accountant: 'Accountant Panel',
};

export default function TopBar() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef();

  // Poll unread count every 30s
  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      api.get('/notifications/unread-count').then(r => setUnread(r.data?.unread_count || 0)).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const openPanel = async () => {
    setShowPanel(v => !v);
    if (!showPanel) {
      try {
        const r = await api.get('/notifications?limit=15');
        setNotifications(r.data?.notifications || r.data || []);
        if (r.data?.unread_count !== undefined) setUnread(r.data.unread_count);
      } catch {}
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setUnread(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.notification_id !== id));
    } catch {}
  };

  // Close panel on outside click
  useEffect(() => {
    const handler = e => { if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, height: 64,
      background: 'white', borderBottom: '1px solid var(--border)', zIndex: 99,
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16
    }}>
      <div style={{ flex: 1 }}></div>

      {/* Notification Bell */}
      <div ref={panelRef} style={{ position: 'relative' }}>
        <button onClick={openPanel} style={{ background: '#f5f6fa', border: '1px solid var(--border)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
          <Bell size={16} color={unread > 0 ? 'var(--primary)' : 'var(--text-muted)'} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, background: '#ef4444',
              borderRadius: 9999, border: '1.5px solid white', fontSize: 9, fontWeight: 800, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px'
            }}>{unread > 99 ? '99+' : unread}</span>
          )}
        </button>

        {showPanel && (
          <div style={{
            position: 'absolute', top: 44, right: 0, width: 360, background: 'white',
            border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 200, overflow: 'hidden'
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications {unread > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>({unread} new)</span>}</span>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                  <Bell size={28} style={{ marginBottom: 8, opacity: 0.3 }} /><br />No notifications yet
                </div>
              ) : notifications.map(n => (
                <div key={n.notification_id} onClick={() => !n.is_read && markRead(n.notification_id)}
                  style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border)',
                    background: n.is_read ? 'white' : '#eff6ff',
                    cursor: n.is_read ? 'default' : 'pointer',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    transition: 'background 0.15s',
                  }}>
                  <div style={{ flex: 1 }}>
                    {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginBottom: 4 }} />}
                    <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600 }}>{n.message || n.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{n.created_at?.substring(0, 10)}</div>
                  </div>
                  <button onClick={e => deleteNotif(n.notification_id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.profile_picture ? (
            <img
              src={user.profile_picture.startsWith('http') ? user.profile_picture : getProfileUrl(user.profile_picture)}
              alt={user?.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }}
            />
          ) : (
            <User size={16} color="white" />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{panelLabel[user?.role] || ''}</div>
        </div>
      </div>
    </header>
  );
}
