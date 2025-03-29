import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCommentDots, 
  faPaperPlane, 
  faTimes,
  faUser,
  faHeadset,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Fetch messages when component mounts or chat opens
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);
  
  // Check for unread messages periodically
  useEffect(() => {
    const checkUnreadInterval = setInterval(() => {
      if (!isOpen) {
        checkUnreadMessages();
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(checkUnreadInterval);
  }, [isOpen]);
  
  // Fetch user's messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/messages`,
        { headers: { auth_token: token } }
      );
      
      if (response.data.success) {
        setMessages(response.data.messages);
        
        // If chat is open, mark messages as read
        if (isOpen) {
          markMessagesAsRead();
          setHasUnread(false);
        }
      } else {
        setError('Failed to load messages');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error.response?.data?.error || 'Failed to load messages');
      setIsLoading(false);
    }
  };
  
  // Check for unread messages
  const checkUnreadMessages = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/messages/unread-count`,
        { headers: { auth_token: token } }
      );
      
      if (response.data.success) {
        setHasUnread(response.data.count > 0);
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  };
  
  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/messages/mark-read`,
        {},
        { headers: { auth_token: token } }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // Mark messages as read when opening
    if (!isOpen) {
      markMessagesAsRead();
      setHasUnread(false);
    }
  };
  
  // Close chat
  const closeChat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };
  
  // Handle sending a message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/messages`,
        { content: inputMessage },
        { headers: { auth_token: token } }
      );
      
      if (response.data.success) {
        // Add the new message to the messages list
        setMessages(prev => [...prev, response.data.message]);
        setInputMessage('');
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.error || 'Failed to send message');
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };
  
  // Handle message form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };
  
  return (
    <div className="chat-widget">
      {/* Chat toggle button */}
      <button 
        className={`chat-toggle ${hasUnread ? 'has-unread' : ''}`} 
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        <FontAwesomeIcon icon={faCommentDots} />
        {hasUnread && <span className="unread-indicator"></span>}
      </button>
      
      {/* Chat window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <FontAwesomeIcon icon={faHeadset} />
            <span>Support Chat</span>
          </div>
          <button className="chat-close" onClick={closeChat} aria-label="Close chat">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        {error && (
          <div className="chat-error">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        {isLoading && (
          <div className="chat-loading">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        )}
        
        <div className="chat-messages">
          {messages.length === 0 && !isLoading ? (
            <div className="no-messages">
              <p>No messages yet. Start a conversation with our support team!</p>
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message._id || `msg-${Date.now()}-${Math.random()}`} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'agent-message'}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? 
                    <FontAwesomeIcon icon={faUser} /> : 
                    <FontAwesomeIcon icon={faHeadset} />}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {message.read && message.sender === 'user' && (
                      <span className="read-indicator">
                        <FontAwesomeIcon icon={faCheckCircle} /> Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>
        

        
        <form className="chat-input" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={inputMessage} 
            onChange={handleInputChange} 
            disabled={isLoading}
            aria-label="Message input"
          />
          <button 
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            aria-label="Send message"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </div>
      
  );
};

export default ChatWidget;
