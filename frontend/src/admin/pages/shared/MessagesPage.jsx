// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../hooks/useChat';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { user, logout } = useAuth();
  const authToken = localStorage.getItem('token');
  
  // Verify that the token is still valid before initializing chat
  const [tokenValid, setTokenValid] = useState(true);
  
  useEffect(() => {
    // Simple validation of token format
    if (!authToken || typeof authToken !== 'string' || !authToken.includes('.')) {
      setTokenValid(false);
      return;
    }
    
    // Check if token is expired by decoding payload (without verification)
    try {
      const parts = authToken.split('.');
      if (parts.length !== 3) {
        setTokenValid(false);
        return;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        setTokenValid(false);
        logout(); // Token expired, log out user
        return;
      }
      
      setTokenValid(true);
    } catch (e) {
      console.error('Error validating token:', e);
      setTokenValid(false);
      return;
    }
  }, [authToken, logout]);

  const { 
    connected, 
    adminOnline, 
    messages, 
    conversations,
    currentConversation,
    joinConversation,
    getMessagesForConversation,
    sendMessage,
    setCurrentConversation,
    getActiveConversations
  } = useChat({ authToken: tokenValid ? authToken : null });
  
  const [newMessage, setNewMessage] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      // Silent fail if element not available
    }
  }, [messages, currentConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation) return;
    
    const guestIdFromConv = currentConversation.replace('guest-', '');
    sendMessage(currentConversation, newMessage, guestIdFromConv);
    setNewMessage('');
  };

  const handleSelectConversation = (conversationId) => {
    joinConversation(conversationId);
    setSelectedConversation(conversationId);
    setCurrentConversation(conversationId);
  };

  // Get messages for current conversation
  const currentMessages = currentConversation 
    ? getMessagesForConversation(currentConversation) 
    : [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!tokenValid) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-void)', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#f0eeff',
          background: 'var(--bg-card)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid rgba(240, 238, 255, 0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2>Session Expired</h2>
          <p>Please log in again to continue using the chat system.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.guestId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-void)', 
      padding: '2rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                color: '#f0eeff', 
                fontSize: '2rem', 
                fontWeight: 700, 
                marginBottom: '0.5rem',
                fontFamily: "'Poppins', sans-serif"
              }}>
                Customer Support Chat
              </h1>
              <p style={{ color: '#b8a8d8', fontSize: '1rem' }}>
                Manage customer conversations and provide support
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '20px', 
                fontSize: '0.875rem',
                background: connected ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 51, 102, 0.2)',
                color: connected ? '#00d4ff' : '#ff3366'
              }}>
                {connected ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
              <span style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '20px', 
                fontSize: '0.875rem',
                background: adminOnline ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 51, 102, 0.2)',
                color: adminOnline ? '#00d4ff' : '#ff3366'
              }}>
                {adminOnline ? '👨‍💼 Admin Available' : '😴 No Admin Available'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          height: 'calc(100vh - 200px)',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid rgba(240, 238, 255, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Conversations List */}
          <div style={{ 
            width: '300px', 
            borderRight: '1px solid rgba(240, 238, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(240, 238, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ color: '#f0eeff', fontWeight: 600, margin: 0 }}>Conversations</h3>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem',
                  background: connected ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 51, 102, 0.2)',
                  color: connected ? '#00d4ff' : '#ff3366'
                }}>
                  {connected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(14,10,20,0.6)',
                    border: '1px solid rgba(240,238,255,0.12)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv, index) => {
                  const filteredMessages = messages.filter(msg => msg.conversationId === conv.conversationId);
                  const lastMessage = filteredMessages[filteredMessages.length - 1];
                  
                  return (
                    <div
                      key={`${conv.conversationId}-${index}`} // Added index to ensure unique key
                      onClick={() => handleSelectConversation(conv.conversationId)}
                      className={`p-3 cursor-pointer transition-colors ${
                        currentConversation === conv.conversationId 
                          ? 'background: rgba(0, 212, 255, 0.1); border-left: 3px solid #00d4ff;' 
                          : 'hover:bg-gray-800'
                      }`}
                      style={{
                        backgroundColor: currentConversation === conv.conversationId 
                          ? 'rgba(0, 212, 255, 0.1)' 
                          : 'transparent',
                        borderLeft: currentConversation === conv.conversationId 
                          ? '3px solid #00d4ff' 
                          : 'none',
                        cursor: 'pointer',
                        padding: '1rem',
                        borderBottom: '1px solid rgba(240, 238, 255, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <div style={{ fontWeight: '600', color: '#f0eeff' }}>
                          Guest: {conv.guestId?.substring(0, 8) || conv.conversationId.replace('guest-', '').substring(0, 8)}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#b8a8d8' }}>
                          {conv.timestamp ? new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: '#b8a8d8', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        marginBottom: '0.25rem'
                      }}>
                        {lastMessage?.message || conv.lastMessage}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: 'rgba(0, 212, 255, 0.8)',
                          marginRight: '0.5rem'
                        }}></span>
                        <span style={{ fontSize: '0.75rem', color: '#00d4ff' }}>
                          Active now
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}>
                  {searchFilter ? 'No conversations match your search' : 'No active conversations'}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid rgba(240, 238, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ color: '#f0eeff', fontWeight: 600, margin: 0 }}>
                      Chat with Guest: {currentConversation.replace('guest-', '').substring(0, 8)}
                    </h3>
                    <p style={{ color: '#b8a8d8', fontSize: '0.875rem', margin: 0 }}>
                      {currentMessages.length} messages • {connected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem',
                      background: 'rgba(0, 212, 255, 0.2)',
                      color: '#00d4ff'
                    }}>
                      Active
                    </span>
                  </div>
                </div>

                {/* Messages Container */}
                <div style={{ 
                  flex: 1, 
                  padding: '1rem', 
                  overflowY: 'auto',
                  background: 'rgba(14,10,20,0.3)'
                }}>
                  {currentMessages.length > 0 ? (
                    currentMessages.map((msg, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: '1rem',
                          display: 'flex',
                          justifyContent: msg.senderType === 'admin' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            background: msg.senderType === 'admin' 
                              ? 'linear-gradient(135deg, rgba(255,51,102,0.15), rgba(255,0,102,0.1))' 
                              : 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,180,255,0.1))',
                            border: msg.senderType === 'admin' 
                              ? '1px solid rgba(255,51,102,0.2)' 
                              : '1px solid rgba(0,212,255,0.2)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                          }}
                        >
                          <div>{msg.message}</div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--text-muted)', 
                            marginTop: '0.25rem',
                            textAlign: 'right'
                          }}>
                            {msg.createdAt || msg.timestamp 
                              ? new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      color: 'var(--text-muted)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#f0eeff' }}>
                        Ready to assist
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#b8a8d8' }}>
                        Waiting for customer message...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div style={{ 
                  padding: '1rem', 
                  borderTop: '1px solid rgba(240, 238, 255, 0.1)',
                  backgroundColor: 'rgba(14,10,20,0.6)'
                }}>
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        background: 'rgba(14,10,20,0.8)',
                        border: '1px solid rgba(240,238,255,0.12)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || !currentConversation}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #00d4ff, #00b4ff)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: newMessage.trim() && currentConversation ? 'pointer' : 'not-allowed',
                        opacity: newMessage.trim() && currentConversation ? 1 : 0.6,
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '2rem'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#f0eeff' }}>
                  Select a conversation
                </div>
                <div style={{ fontSize: '1rem', color: '#b8a8d8', maxWidth: '400px' }}>
                  Choose a conversation from the left panel to start chatting with customers
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;