import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

const ChatWidget = ({ isAdmin = false, authToken = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [contactType, setContactType] = useState('email');
  const [contact, setContact] = useState('');
  const [adminAvailableAlert, setAdminAvailableAlert] = useState(false);
  const messagesEndRef = useRef(null);

  const { socket, connected: socketConnected, adminOnline: socketAdminOnline } = useChat({ authToken });

  useEffect(() => {
    setConnected(socketConnected);
    setAdminOnline(socketAdminOnline);
  }, [socketConnected, socketAdminOnline]);

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const dismissAdminAlert = () => {
    setAdminAvailableAlert(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || (!adminOnline && messages.length === 0)) return;

    // In a real app, this would send the message via socket
    // For now, we'll just add it to the local state
    const messageObj = {
      id: Date.now(),
      text: newMessage,
      sender: 'customer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, messageObj]);
    setNewMessage('');

    // Scroll to bottom after adding message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
  };

  const handleRequestCallback = async () => {
    if (!customerName.trim() || !contact.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/chat/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: customerName,
          message: `Callback requested: ${contactType} - ${contact}`,
          phone: contactType === 'phone' ? contact : undefined
        })
      });

      if (response.ok) {
        alert('Callback request submitted successfully. We will contact you shortly.');
        setShowCallbackForm(false);
        setCustomerName('');
        setContact('');
      } else {
        alert('Failed to submit callback request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting callback request:', error);
      alert('Failed to submit callback request. Please try again.');
    }
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
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontFamily: "'Inter', sans-serif"
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
              <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Ruai Tech Support</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: connected ? (adminOnline ? '#4ade80' : '#f87171') : '#fbbf24'
                }}></div>
                <span style={{ color: connected ? (adminOnline ? '#4ade80' : '#f87171') : '#fbbf24', fontSize: '14px' }}>
                  {connected 
                    ? (adminOnline ? 'Online - We\'re here to help!' : 'Offline - Leave a message') 
                    : 'Connecting...'}
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
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>

          {/* Connection status indicator */}
          {!connected && (
            <div style={{
              padding: '8px',
              backgroundColor: '#fbbf24',
              color: '#1a202c',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              Connecting to support...
            </div>
          )}

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
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#1e293b' }}>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  style={{
                    marginBottom: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: msg.sender === 'customer' ? '#3b82f6' : '#4b5563',
                    alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '14px', color: '#fff' }}>{msg.text}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>{msg.timestamp}</div>
                </div>
              ))
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                color: '#9ca3af',
                textAlign: 'center',
                padding: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {adminOnline ? '💬' : '📞'}
                </div>
                <p>
                  {adminOnline 
                    ? 'Send us a message and we\'ll respond promptly!' 
                    : 'No admin is currently available. Leave your details and we\'ll call you back.'}
                </p>
                {!adminOnline && (
                  <button
                    onClick={() => setShowCallbackForm(true)}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Request Callback
                  </button>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Callback Form */}
          {showCallbackForm && (
            <div style={{
              padding: '16px',
              backgroundColor: '#1e293b',
              borderTop: '1px solid #334155'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#fff' }}>Request Callback</h4>
              <form onSubmit={handleCallbackSubmit}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '8px',
                    borderRadius: '4px',
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#fff'
                  }}
                />
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '8px',
                    borderRadius: '4px',
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#fff'
                  }}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
                <input
                  type={contactType === 'email' ? 'email' : 'tel'}
                  placeholder={contactType === 'email' ? 'your@email.com' : '+254712345678'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '12px',
                    borderRadius: '4px',
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#fff'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Submit
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
            </div>
          )}

          {/* Message Input */}
          {!showCallbackForm && (
            <form onSubmit={handleSendMessage} style={{
              padding: '12px',
              backgroundColor: '#1e293b',
              borderTop: '1px solid #334155',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={adminOnline ? "Type your message..." : "Admin offline - leave a message"}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  opacity: (!connected || (!adminOnline && messages.length === 0)) ? 0.6 : 1
                }}
                disabled={!connected || (!adminOnline && messages.length === 0)}
              />
              <button
                type="submit"
                disabled={!connected || !newMessage.trim() || (!adminOnline && messages.length === 0)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: (!connected || !newMessage.trim() || (!adminOnline && messages.length === 0)) ? 0.6 : 1
                }}
              >
                Send
              </button>
            </form>
          )}
          
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
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Request Callback
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: connected ? (adminOnline ? '#4f46e5' : '#6b7280') : '#fbbf24',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            zIndex: 1001
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
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
            backgroundColor: connected ? (adminOnline ? '#4ade80' : '#f87171') : '#fbbf24',
            border: '2px solid #1a1a2e'
          }}></div>
        </button>
      )}
      
    </div>
  );
};

export default ChatWidget;