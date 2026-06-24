// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../utils/api';
import { v4 as uuidv4 } from 'uuid'; // For unique client IDs

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
      reconnectionAttempts: Infinity, // Retry indefinitely
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'], // Try websocket first, fall back to polling
      forceNew: true, // Create a new connection each time to prevent reuse issues
      upgrade: true,
      rememberUpgrade: true,
      auth: {
        clientVersion: '1.0.0', // Track client version for server-side compatibility
        clientId: uuidv4() // Unique client ID for tracking across devices
      }
    };

    // Only send auth token if present (admin client)
    if (authToken) {
      socketOptions.auth = {
        ...(socketOptions.auth || {}),
        token: authToken
      };
      
      // Add device information to auth for better tracking
      socketOptions.auth.deviceInfo = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timestamp: new Date().toISOString()
      };
    }

    const socket = io(SOCKET_URL, socketOptions);
    socketRef.current = socket;

    // ── Core connection events ────────────────────────────────────
    socket.on('connect', () => {
      console.log('[CHAT] Connected:', socket.id);
      setConnected(true);
      // Request admin status immediately upon connection to ensure freshness
      // This ensures the status is up-to-date even on new device connections
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
      const { message, guestId, conversationId } = data;
      
      console.log('[CHAT] Received new message:', data);
      
      // Add to conversations list if not already there
      setConversations(prev => {
        if (!prev.some(conv => conv.conversationId === conversationId)) {
          return [...prev, { 
            conversationId: conversationId, 
            guestId, 
            lastMessage: message.message?.substring(0, 50) + '...', 
            timestamp: message.createdAt || new Date().toISOString(),
            unread: true
          }];
        }
        return prev;
      });

      // Add message to our messages state
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(m => m._id === message._id || (m.timestamp === message.timestamp && m.message === message.message));
        if (exists) return prev;
        
        // Create a normalized message object
        const normalizedMessage = {
          ...message,
          direction: message.direction || (authToken ? 'incoming' : 'incoming'), // For customers, all messages except their own are incoming
          conversationId: conversationId || message.conversationId,
          senderType: message.senderType || (authToken ? 'admin' : 'customer')
        };
        
        return [...prev, normalizedMessage];
      });
      
      // Set current conversation if we're not already in it
      if (!currentConversation || currentConversation !== conversationId) {
        setCurrentConversation(conversationId);
      }
    });

    // ── Message sent confirmation ─────────────────────────────────
    socket.on('message-sent', (data) => {
      console.log('[CHAT] Message sent confirmation:', data);
      
      // Update messages with the confirmation
      if (data.message) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m._id === data.message._id);
          if (exists) return prev;
          
          return [...prev, {
            ...data.message,
            conversationId: data.conversationId || currentConversation
          }];
        });
      }
    });

    socket.on('chat-error', (data) => {
      console.error('[CHAT] Error:', data.error);
      // Optionally show user-friendly error message
    });

    // ── New callback request notification ────────────────────────
    socket.on('new-callback-request', (data) => {
      console.log('[CHAT] New callback request:', data);
    });

    // ── Admin now available notification ──────────────────────────
    socket.on('admin:now-available', (data) => {
      setAdminAvailableAlert(true);
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
    if (!socketRef.current?.connected) {
      console.log('[CHAT] Cannot send message - socket not connected');
      return;
    }
    
    console.log('[CHAT] Sending message to customer:', { conversationId, message, guestId });
    
    socketRef.current.emit('admin-send-message', { 
      conversationId, 
      message, 
      guestId 
    }, (ack) => {
      console.log('[CHAT] Message acknowledgment:', ack);
      if (ack?.success) {
        // Add the message to the local state
        setMessages(prev => [...prev, {
          message, 
          timestamp: new Date().toISOString(), 
          direction: 'outgoing',
          conversationId,
          senderType: 'admin',
          _id: `temp-${Date.now()}` // Temporary ID until server confirms
        }]);
      }
    });
  }, []);

  // ── Functions for customers to send messages ─────────────────────
  const sendCustomerMessage = useCallback((message, guestId, conversationId = null) => {
    if (!socketRef.current?.connected) {
      console.log('[CHAT] Cannot send message - socket not connected');
      return;
    }
    
    console.log('[CHAT] Sending customer message:', { message, guestId, conversationId });
    
    // If no conversation ID provided, create one based on guest ID
    const effectiveConversationId = conversationId || `conversation-guest-${guestId}`;
    
    // Always include the guestId so socket.js can route the message
    socketRef.current.emit('chat-message', { 
      message,
      guestId
    }, (ack) => {
      console.log('[CHAT] Customer message acknowledgment:', ack);
      if (ack?.success) {
        // Add the message to the local state
        setMessages(prev => [...prev, {
          message, 
          timestamp: new Date().toISOString(), 
          direction: 'outgoing',
          conversationId: effectiveConversationId,
          senderType: 'customer',
          _id: `temp-${Date.now()}` // Temporary ID until server confirms
        }]);
      } else {
        // If there's an error, we might want to show it to the user
        console.error('Failed to send message:', ack);
      }
    });
    
    // Return the conversation ID for potential storage
    return { conversationId: effectiveConversationId };
  }, []);

  const getMessagesForConversation = useCallback(async (conversationId) => {
    // First get from local state
    const localMessages = messages.filter(msg => msg.conversationId === conversationId);
    
    // Then fetch from server to ensure we have the latest
    try {
      // Normalize conversation ID for API call
      const apiConversationId = conversationId.replace('conversation-guest-', '');
      const response = await fetch(`${SOCKET_URL.replace('http://', 'http://').replace('https://', 'https://')}/api/chat/conversations/${apiConversationId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Update local state with latest messages
          setMessages(prev => {
            // Remove messages from this conversation and add the fresh ones
            const otherMessages = prev.filter(msg => msg.conversationId !== conversationId);
            return [...otherMessages, ...result.data.map(msg => ({
              ...msg,
              conversationId: msg.conversationId || `conversation-guest-${msg.senderId}`,
              direction: msg.direction || (authToken ? (msg.senderType === 'admin' ? 'outgoing' : 'incoming') : (msg.senderType === 'admin' ? 'incoming' : 'outgoing'))
            }))];
          });
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

  const requestCallback = useCallback((clientName, message, phone, guestId) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('chat:request-callback', { 
      clientName, 
      message, 
      phone,
      guestId // Include guestId for proper tracking
    }, (ack) => {
      if (ack?.success) setCallbackSubmitted(true);
    });
  }, []);

  // ── Function to request admin status update ───────────────────────
  const requestAdminStatusUpdate = useCallback(async () => {
    if (authToken) {
      try {
        const response = await api.get('/chat/admin/status');
        if (response.data.success) {
          // The socket will automatically update adminOnline when it receives 'admin:status'
          // from the server after the availability is checked
          console.log('[CHAT] Admin status updated from server');
        }
      } catch (error) {
        console.error('[CHAT] Error requesting admin status update:', error);
      }
    }
  }, [authToken]);
  
  // ── Admin status management ──────────────────────────────────────
  return {
    socket: socketRef.current,
    connected,
    adminOnline,
    messages,
    setMessages,
    conversations,
    currentConversation,
    setCurrentConversation,
    joinConversation,
    sendMessageToCustomer,
    callbackSubmitted,
    setCallbackSubmitted,
    adminAvailableAlert,
    setAdminAvailableAlert,
    guestUsers,
    setGuestUsers,
    requestAdminStatusUpdate
  };
}