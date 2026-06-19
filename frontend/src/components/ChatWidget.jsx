import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

const ChatWidget = ({ isAdmin = false, authToken = null }) => {
  const {
    connected,
    adminOnline,
    messages,
    conversations,
    currentConversation,
    sendCustomerMessage,
    getMessagesForConversation,
    requestCallback,
    callbackSubmitted,
    adminAvailableAlert,
    dismissAdminAlert
  } = useChat({ authToken });

  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const [guestId, setGuestId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Initialize guest ID
  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestId');
    if (storedGuestId) {
      setGuestId(storedGuestId);
    } else if (!isAdmin) {
      const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestId', newGuestId);
      setGuestId(newGuestId);
    }
  }, [isAdmin]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      // Silent fail if element not available
    }
  }, [messages]);

  // Focus chat input when opening
  useEffect(() => {
    if (chatInputRef.current) {
      setTimeout(() => {
        try {
          chatInputRef.current?.focus();
        } catch (err) {
          // Silent fail if element not available
        }
      }, 100);
    }
  }, []);

  // Dismiss the admin available alert when component unmounts
  useEffect(() => {
    return () => {
      if (adminAvailableAlert) {
        dismissAdminAlert();
      }
    };
  }, [adminAvailableAlert, dismissAdminAlert]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Use existing guest ID or create a new one
    const effectiveGuestId = guestId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine conversation ID - use existing or create new
    const conversationId = currentConversation || `conversation-guest-${effectiveGuestId}`;
    
    // Add the message to local state immediately for UI feedback
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      message: newMessage,
      senderType: 'customer',
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
      conversationId: conversationId
    };
    
    // Update messages state to show the message immediately
    setMessages(prev => [...prev, tempMessage]);
    
    // If this is the first message from customer, initiate a new conversation
    if (messages.length === 0 || !currentConversation) {
      // Store guest ID if not already stored
      if (!guestId) {
        localStorage.setItem('guestId', effectiveGuestId);
        setGuestId(effectiveGuestId);
      }
      // Send message with guest ID
      sendCustomerMessage(newMessage, effectiveGuestId);
      setCurrentConversation(conversationId);
    } else {
      // Use existing conversation
      sendCustomerMessage(newMessage, effectiveGuestId);
    }
    
    setNewMessage('');
  };

  const handleSubmitCallback = (e) => {
    e.preventDefault();
    if (!guestName.trim() || !initialMessage.trim()) return;

    // Use existing guest ID or create a new one
    const effectiveGuestId = guestId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store guest ID if not already stored
    if (!guestId) {
      localStorage.setItem('guestId', effectiveGuestId);
      setGuestId(effectiveGuestId);
    }
    
    requestCallback(guestName, initialMessage, guestPhone, effectiveGuestId);
    setShowCallbackForm(false);
    setGuestName('');
    setGuestPhone('');
    setInitialMessage('');
  };

  if (isAdmin) {
    // Admin view remains the same as in the MessagesPage component
    return (
      <div style={{ display: 'none' }}>Admin view not handled here</div>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {isOpen ? (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '16px',
            backgroundColor: '#16213e',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Customer Support</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: adminOnline ? '#4ade80' : '#f87171'
                }}></div>
                <span style={{ color: adminOnline ? '#4ade80' : '#f87171', fontSize: '14px' }}>
                  {adminOnline ? 'Online - We\'re here to help!' : 'Offline - Leave a message'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          {/* Alert when admin becomes available */}
          {adminAvailableAlert && (
            <div style={{
              padding: '12px',
              backgroundColor: '#22c55e',
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>We're back online! Start chatting with us now.</span>
              <button
                onClick={dismissAdminAlert}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#1e1e2e'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#a0aec0', marginTop: '20px' }}>
                <p>Hello! How can we help you today?</p>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                  {adminOnline 
                    ? 'Send us a message and we\'ll respond right away.' 
                    : 'We\'re currently offline. Leave your message and we\'ll get back to you ASAP.'}
                </p>
              </div>
            ) : (
              messages
                .filter(msg => !currentConversation || msg.conversationId === currentConversation) // Only show messages for current conversation if set
                .map((msg, index) => (
                <div key={msg._id || `${msg.timestamp || Date.now()}-${index}`} style={{
                  marginBottom: '12px',
                  textAlign: msg.senderType === 'admin' ? 'left' : 'right'
                }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: msg.senderType === 'admin' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                    backgroundColor: msg.senderType === 'admin' ? '#4f46e5' : '#10b981',
                    color: 'white',
                    maxWidth: '80%'
                  }}>
                    {msg.message}
                  </div>
                  <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '4px' }}>
                    {msg.senderType === 'admin' ? 'Support' : 'You'} • {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Callback Form - shown when admin is offline and no messages exchanged yet */}
          {callbackSubmitted ? (
            <div style={{
              padding: '16px',
              backgroundColor: '#1e1e2e',
              textAlign: 'center',
              color: '#4ade80'
            }}>
              Thank you! We'll contact you shortly.
            </div>
          ) : showCallbackForm ? (
            <form onSubmit={handleSubmitCallback} style={{
              padding: '16px',
              backgroundColor: '#1e1e2e',
              borderTop: '1px solid #374151'
            }}>
              <h4 style={{ margin: '0 0 12px', color: '#fff' }}>Leave your details</h4>
              <input
                type="text"
                placeholder="Your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: '#fff'
                }}
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: '#fff'
                }}
              />
              <textarea
                placeholder="Your message"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                required
                rows="2"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  marginBottom: '12px',
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: '#fff',
                  resize: 'vertical'
                }}
              ></textarea>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowCallbackForm(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Message Input - shown when admin is online or when having an active conversation */
            <form onSubmit={handleSendMessage} style={{
              padding: '16px',
              backgroundColor: '#1e1e2e',
              borderTop: '1px solid #374151'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder={adminOnline ? "Type your message..." : "Admin offline - click 'Callback' to leave details"}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!adminOnline && messages.length === 0}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '20px',
                    border: '1px solid #374151',
                    backgroundColor: '#374151',
                    color: '#fff'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || (!adminOnline && messages.length === 0)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: adminOnline ? '#4f46e5' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer'
                  }}
                >
                  Send
                </button>
              </div>
              
              {/* Show callback option when admin is offline */}
              {!adminOnline && messages.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCallbackForm(true)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Request Callback
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}
        >
          💬
          {/* Indicator for admin online status */}
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: adminOnline ? '#4ade80' : '#f87171',
            border: '2px solid #1a1a2e'
          }}></div>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;