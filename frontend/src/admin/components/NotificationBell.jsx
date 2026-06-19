// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useEffect, useState, useCallback } from 'react';
import { api } from '../../utils/api';
import useSocket from '../../hooks/useSocket';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]                   = useState(false);

  // ── Initial fetch ────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/notifications');
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Real-time: replace polling with Socket.io ────────────
  useSocket({
    'notification:new': (notif) => {
      setNotifications((prev) => {
        // Deduplicate by _id
        if (prev.some((n) => n._id === notif._id)) return prev;
        return [{ ...notif, isRead: false }, ...prev];
      });
    },
    'notification:broadcast': (notif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notif._id)) return prev;
        return [{ ...notif, isRead: false }, ...prev];
      });
    },
  });

  // ── Mark read ────────────────────────────────────────────
  const markRead = async (id) => {
    try { await api.put(`/admin/notifications/${id}/read`); } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer',
          color: '#8fa8c0', fontSize: 16, position: 'relative', padding: '4px' }}
      >
        🔔
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: '#ff3366',
            color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9,
            fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 6px rgba(255,51,102,0.6)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 36, width: 300,
          background: '#0a1628', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          zIndex: 500, maxHeight: 360, overflowY: 'auto' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,212,255,0.1)',
            fontSize: 11, color: '#00d4ff', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
            Notifications
            {unread > 0 && (
              <span style={{ fontSize: 10, color: '#00d4ff' }}>● LIVE</span>
            )}
          </div>
          {notifications.length === 0 ? (
            <p style={{ padding: '1rem', color: '#4a6580', fontSize: 12, textAlign: 'center' }}>
              No notifications
            </p>
          ) : notifications.map((n) => (
            <div key={n._id} onClick={() => markRead(n._id)}
              style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(26,58,92,0.4)',
                cursor: 'pointer', background: n.isRead ? 'transparent' : 'rgba(0,212,255,0.04)',
                transition: 'background 0.15s' }}>
              <div style={{ fontSize: 12, fontWeight: n.isRead ? 400 : 700,
                color: n.isRead ? '#6a8aa0' : '#e2eeff' }}>{n.title}</div>
              <div style={{ fontSize: 11, color: '#4a6580', marginTop: 2 }}>{n.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
