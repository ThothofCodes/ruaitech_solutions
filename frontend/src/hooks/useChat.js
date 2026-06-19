// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../utils/api';

// For socket connections, we need to connect directly to the backend
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_SOCKET_URL || process.env.VITE_API_URL || 'http://localhost:5001')
  : 'http://localhost:5001';

export function useChat({ authToken = null } = {}) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]); // Track all conversations
  const [currentConversation, setCurrentConversation] = useState(null); // Current active conversation
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [adminAvailableAlert, setAdminAvailableAlert] = useState(false);
  const [guestUsers, setGuestUsers] = useState({}); // Track guest user info

  useEffect(() => {
    // Build socket options
    const socketOptions = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'], // Try websocket first, fall back to polling
    };

    // Only send auth token if present (admin client)
    if (authToken) {
      socketOptions.auth = { token: authToken };
    }

    const socket = io(SOCKET_URL, socketOptions);
    socketRef.current = socket;

    // ── Core connection events ────────────────────────────────────
    socket.on('connect', () => {
      console.log('[CHAT] Connected:', socket.id);
      setConnected(true);
      // NOTE: Server sends admin status automatically on connection, no need to request
    });

    socket.on('disconnect', (reason) => {
      console.log('[CHAT] Disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[CHAT] Connection Error:', err);
    });

    socket.on('reconnect', () => {
      console.log('[CHAT] Reconnected — re-fetching admin status');
      // Server will push admin:status automatically on new connection
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[CHAT] Reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_failed', () => {
      console.log('[CHAT] Reconnection failed');
      setConnected(false);
    });

    // ── Admin status updates ────────────────────────────────────────
    socket.on('admin:status', (data) => {
      setAdminOnline(data.online);
    });

    // ── Incoming chat message from customer ───────────────────────
    socket.on('new-chat-message', (data) => {
      const { message, guestId } = data;
      
      // Add to conversations list if not already there
      setConversations(prev => {
        if (!prev.some(conv => conv.conversationId === message.conversationId)) {
          return [...prev, { 
            conversationId: message.conversationId, 
            guestId, 
            lastMessage: message.message.substring(0, 50) + '...', 
            timestamp: message.createdAt,
            unread: true
          }];
        }
        return prev;
      });

      // Add message to our messages state
      setMessages(prev => [...prev, { 
        ...message, 
        direction: 'incoming',
        conversationId: message.conversationId 
      }]);
      
      // Set current conversation if we're not already in it
      if (!currentConversation || currentConversation !== message.conversationId) {
        setCurrentConversation(message.conversationId);
      }
    });

    // ── Message sent confirmation ─────────────────────────────────
    socket.on('message-sent', (data) => {
      console.log('[CHAT] Message sent confirmation:', data);
    });

    socket.on('chat-error', (data) => {
      console.error('[CHAT] Error:', data.error);
      // Optionally show user-friendly error message
    });

    // ── New callback request notification ────────────────────────
    socket.on('new-callback-request', (data) => {
      console.log('[CHAT] New callback request:', data);
    });

    // On reconnect, fetch latest messages for current conversation
    socket.on('reconnect', async () => {
      console.log('[CHAT] Reconnected — fetching latest messages');
      setConnected(true);
      
      // Fetch conversation history if we have a current conversation
      if (currentConversation) {
        try {
          const response = await fetch(`${SOCKET_URL.replace('http://', 'http://').replace('https://', 'https://')}/api/chat/conversations/${currentConversation.replace('conversation-', '')}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setMessages(result.data);
            }
          }
        } catch (error) {
          console.error('Error fetching conversation history on reconnect:', error);
        }
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authToken, currentConversation]);

  // ── Functions for admin to interact with customers ───────────────
  
  const joinConversation = useCallback((conversationId) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('admin-join-conversation', conversationId);
    setCurrentConversation(conversationId);
  }, []);

  const sendMessageToCustomer = useCallback((conversationId, message, guestId) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('admin-send-message', { 
      conversationId, 
      message, 
      guestId 
    }, (ack) => {
      if (ack?.success) {
        setMessages(prev => [...prev, {
          message, 
          timestamp: new Date().toISOString(), 
          direction: 'outgoing',
          conversationId,
          senderType: 'admin'
        }]);
      }
    });
  }, []);

  // ── Functions for customers to send messages ─────────────────────
  const sendCustomerMessage = useCallback((message, guestId) => {
    if (!socketRef.current?.connected) return;
    
    // Always include the guestId so socket.js can route the message
    socketRef.current.emit('chat-message', { 
      message,
      guestId
    }, (ack) => {
      if (ack?.success) {
        // Find and update the temporary message with the server-confirmed message
        setMessages(prev => {
          // Remove temporary message if it exists and add the confirmed one
          const filtered = prev.filter(msg => !(msg._id && msg._id.startsWith('temp-')));
          return [...filtered, {
            message, 
            timestamp: new Date().toISOString(), 
            direction: 'outgoing',
            senderType: 'customer',
            conversationId: `conversation-guest-${guestId}`
          }];
        });
      } else {
        // If there's an error, we might want to show it to the user
        console.error('Failed to send message:', ack);
      }
    });
  }, []);

  const getMessagesForConversation = useCallback(async (conversationId) => {
    // First get from local state
    const localMessages = messages.filter(msg => msg.conversationId === conversationId);
    
    // Then fetch from server to ensure we have the latest
    try {
      const response = await fetch(`${SOCKET_URL.replace('http://', 'http://').replace('https://', 'https://')}/api/chat/conversations/${conversationId.replace('conversation-', '')}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Update local state with latest messages
          setMessages(result.data);
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error fetching messages for conversation:', error);
      // Fall back to local messages if API fails
    }
    
    return localMessages;
  }, [messages, authToken]);

  const getActiveConversations = useCallback(() => {
    // Return sorted conversations with most recent first
    return conversations.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [conversations]);

  const requestCallback = useCallback((clientName, message, phone) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('chat:request-callback', { clientName, message, phone }, (ack) => {
      if (ack?.success) setCallbackSubmitted(true);
    });
  }, []);

  // ── Admin status management ──────────────────────────────────────
  return {
    connected,
    // Phase 9 market research, Tier 1 #4 (RuaiPulseBoard.js) needs direct
    // access to emit/on additional events without a second socket connection.
    // Additive only — every existing consumer that doesn't destructure this
    // is unaffected.
    socket: socketRef.current,
    adminOnline,
    messages,
    conversations,
    currentConversation,
    callbackSubmitted,
    adminAvailableAlert,
    sendMessage: sendMessageToCustomer, // For admin to send to customer
    sendCustomerMessage, // For customers to send messages
    joinConversation,
    getMessagesForConversation,
    getActiveConversations,
    requestCallback, // Still available for non-admin use
    dismissAdminAlert: () => setAdminAvailableAlert(false),
    setCurrentConversation,
  };
}
