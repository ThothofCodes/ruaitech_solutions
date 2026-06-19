// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
//
// FIX (Continuity Audit, Part One, Exhibit B): this page used to call only
// `api.post('/chat/admin/status', ...)` — a REST call that flips a server-side
// availability *preference* flag without ever opening a Socket.IO connection.
// `presenceManager.isAnyAdminOnline()` requires BOTH a live socket AND that
// flag, so the green "ONLINE" badge here was lying: customers had no way to
// reach you unless you *also* happened to have ChatMonitor or MessagesPage
// open in another tab holding the real connection.
//
// This page now opens its own real connection via useChat() — the same
// hook ChatMonitor.js and MessagesPage.js already use correctly — so the
// toggle has something genuine to attach to, and "ONLINE" only ever shows
// when it's actually true.
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useChat } from '../hooks/useChat';

const AdminChatControl = () => {
  const authToken = localStorage.getItem('token');
  const { connected } = useChat({ authToken }); // holds the real socket this page was missing

  const [available, setAvailable] = useState(null); // the server-side preference flag
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await api.get('/chat/admin/status');
        setAvailable(response.data.status);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching admin status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const toggleStatus = async () => {
    try {
      setLoading(true);
      const response = await api.post('/chat/admin/status', {
        status: !available
      });
      setAvailable(response.data.status);
    } catch (err) {
      setError(err.message);
      console.error('Error updating admin status:', err);
    } finally {
      setLoading(false);
    }
  };

  // True presence is the AND of both conditions — this is the line that
  // makes the badge below honest instead of optimistic.
  const trulyOnline = connected && !!available;

  if (loading && available === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-void)',
        color: 'var(--text-primary)'
      }}>
        Loading...
      </div>
    );
  }

  if (error && available === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-void)',
        color: 'var(--color-accent)'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      background: 'var(--bg-void)',
      minHeight: '100vh',
      color: 'var(--text-primary)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'var(--bg-surface)',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid rgba(122, 90, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          margin: 0,
          color: 'var(--text-primary)',
          fontWeight: 600,
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Admin Chat Control
        </h1>

        {/* Connection sub-status — this is the part that used to be invisible.
            If this reads "Connecting..." and never settles, that's the signal
            something upstream (network, auth) is wrong — rather than a badge
            that just claims ONLINE regardless. */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: connected ? 'var(--color-primary)' : 'var(--color-accent)',
          marginBottom: '2rem'
        }}>
          {connected ? '● Realtime connection active' : '○ Connecting to realtime server…'}
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(0, 212, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            width: '100%'
          }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              margin: 0,
              marginBottom: '1rem',
              color: 'var(--color-primary)'
            }}>
              Current Status
            </h2>
            <div style={{
              fontSize: '2rem',
              fontWeight: 600,
              margin: '1rem 0',
              color: trulyOnline ? 'var(--color-primary)' : 'var(--color-accent)'
            }}>
              {trulyOnline ? 'ONLINE' : connected ? 'AVAILABILITY OFF' : 'DISCONNECTED'}
            </div>
            <p style={{
              color: 'var(--text-muted)',
              margin: 0
            }}>
              {trulyOnline
                ? 'You are connected and available to receive customer chats'
                : connected
                  ? 'Connected, but marked unavailable — toggle below to start receiving chats'
                  : 'Not connected yet — the toggle below will not take effect until the realtime connection is active'}
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            background: 'rgba(255, 20, 147, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 20, 147, 0.15)',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              margin: 0,
              marginBottom: '1rem',
              color: 'var(--color-accent)'
            }}>
              Effect on Customers
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.6
            }}>
              {trulyOnline
                ? 'Customers will see that support is available and can initiate live chat sessions with you.'
                : 'Customers will be prompted to leave callback requests instead of initiating live chat sessions.'}
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            background: 'rgba(122, 90, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(122, 90, 255, 0.15)',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              margin: 0,
              marginBottom: '1rem',
              color: 'var(--color-secondary)'
            }}>
              Active Chats
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.6
            }}>
              You can manage ongoing conversations regardless of your availability status, as long as this page (or another with the chat connection open) stays open.
            </p>
          </div>

          <button
            onClick={toggleStatus}
            disabled={loading || !connected}
            title={!connected ? 'Waiting for realtime connection before this can take effect' : undefined}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: available
                ? 'linear-gradient(135deg, var(--color-accent), #ff0066)'
                : 'linear-gradient(135deg, var(--color-primary), #00b4ff)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !connected) ? 'not-allowed' : 'pointer',
              opacity: (loading || !connected) ? 0.5 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
              minWidth: '200px'
            }}
            onMouseOver={(e) => {
              if (connected && !loading) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {loading ? 'Processing...' : available ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChatControl;