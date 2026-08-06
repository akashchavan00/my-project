import { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import agentService from '../services/agentService';
import Sidebar from './Sidebar';
import AgentBuilder from './AgentBuilder';
import './ChatInterface.css';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('chat-theme') || 'light';
  });
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(chatService.getCurrentSessionId());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const [savedAgents, setSavedAgents] = useState([]);
  const [activePipeline, setActivePipeline] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkHealth();
    loadSessions();
    loadChatHistory(currentSessionId);
    loadSavedAgents();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chat-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const checkHealth = async () => {
    try {
      await chatService.checkHealth();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      console.error('Backend not connected:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const allSessions = await chatService.getAllSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadChatHistory = async (sessionId) => {
    try {
      const history = await chatService.getChatHistory(sessionId);
      if (history.messages && history.messages.length > 0) {
        setMessages(history.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([]);
    }
  };

  const loadSavedAgents = async () => {
    try {
      const agents = await agentService.getSavedAgents();
      setSavedAgents(agents);
    } catch (error) {
      console.error('Failed to load saved agents:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    chatService.setCurrentSessionId(sessionId);
    await loadChatHistory(sessionId);
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    const newSessionId = chatService.createNewSession();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setActivePipeline(null);
    loadSessions();
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await chatService.deleteSession(sessionId);
      await loadSessions();
      
      if (sessionId === currentSessionId) {
        const newSessionId = chatService.getCurrentSessionId();
        setCurrentSessionId(newSessionId);
        setMessages([]);
        setActivePipeline(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setShowAgentBuilder(true);
    setIsSidebarOpen(false);
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowAgentBuilder(true);
    setIsSidebarOpen(false);
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      await agentService.deleteAgentTemplate(agentId);
      await loadSavedAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleAgentPipelineReady = async (agents) => {
    // Save all agents to MongoDB
    try {
      for (const agent of agents) {
        await agentService.saveAgentTemplate(agent);
      }
      await loadSavedAgents();
    } catch (error) {
      console.error('Failed to save agents:', error);
    }

    // Store the pipeline and close the builder
    setActivePipeline(agents);
    setShowAgentBuilder(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    if (activePipeline && activePipeline.length > 0) {
      await executeWithAgentPipeline(userMessage);
    } else {
      await sendNormalMessage(userMessage);
    }
  };

  const sendNormalMessage = async (userMessage) => {
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    setIsLoading(true);
    
    try {
      const response = await chatService.sendMessage(userMessage, currentSessionId);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      loadSessions();
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeWithAgentPipeline = async (userMessage) => {
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    setIsLoading(true);
    
    try {
      const response = await agentService.executeAgents(userMessage, activePipeline, currentSessionId);
      
      const agentResultMessage = {
        role: 'assistant',
        content: response.final_output,
        timestamp: response.timestamp,
        isAgentResult: true,
        executionTime: response.total_execution_time,
        agentCount: response.results.length
      };
      setMessages(prev => [...prev, agentResultMessage]);
      
      loadSessions();
    } catch (error) {
      console.error('Failed to execute agents:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, agent execution failed. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPipeline = () => {
    setActivePipeline(null);
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
      try {
        await chatService.deleteSession(currentSessionId);
        handleNewChat();
      } catch (error) {
        console.error('Failed to clear chat:', error);
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        agents={savedAgents}
        onCreateAgent={handleCreateAgent}
        onEditAgent={handleEditAgent}
        onDeleteAgent={handleDeleteAgent}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {showAgentBuilder && (
        <AgentBuilder
          onClose={() => {
            setShowAgentBuilder(false);
            setEditingAgent(null);
          }}
          onPipelineReady={handleAgentPipelineReady}
          savedAgents={savedAgents}
          editingAgent={editingAgent}
        />
      )}

      <div className={`chat-container theme-${theme} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="chat-header">
          <div className="header-left">
            <div className="logo-section">
              <span className="logo-icon">💬</span>
              <h1>AI Assistant</h1>
            </div>
          </div>
          <div className="header-actions">
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn" 
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={handleClearChat} className="clear-btn" title="Clear chat history">
              <span className="btn-icon">🗑️</span>
              <span className="btn-text">Clear</span>
            </button>
          </div>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <div className="welcome-icon">🤖</div>
              <h2>Welcome to AI Assistant</h2>
              <p>I'm here to help you with any questions or tasks.</p>
              <div className="welcome-suggestions">
                <span className="suggestion">💡 Ask me anything</span>
                <span className="suggestion">🚀 Get instant answers</span>
                <span className="suggestion">💬 Have a conversation</span>
                <span className="suggestion" onClick={() => setShowAgentBuilder(true)}>
                  🤖 Create Custom Agents
                </span>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role} ${msg.isAgentResult ? 'agent-result' : ''}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? (
                    <div className="avatar user-avatar">👤</div>
                  ) : (
                    <div className="avatar bot-avatar">🤖</div>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  {msg.isAgentResult && (
                    <div className="message-meta">
                      🤖 {msg.agentCount} agent{msg.agentCount > 1 ? 's' : ''} • 
                      ⏱️ {msg.executionTime.toFixed(2)}s
                    </div>
                  )}
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">
                <div className="avatar bot-avatar">🤖</div>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="input-container">
          {activePipeline && activePipeline.length > 0 && (
            <div className="active-pipeline-banner">
              <span className="pipeline-info">
                🤖 Agent Pipeline Active ({activePipeline.length} agent{activePipeline.length > 1 ? 's' : ''})
              </span>
              <button 
                type="button" 
                className="clear-pipeline-btn"
                onClick={handleClearPipeline}
                title="Clear pipeline"
              >
                ✕
              </button>
            </div>
          )}
          <div className="input-wrapper">
            <button
              type="button"
              className="agent-btn"
              onClick={() => setShowAgentBuilder(true)}
              title="Create and configure custom agents"
              disabled={!isConnected}
            >
              + Add Agent
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={activePipeline ? "Message will be processed by agent pipeline..." : "Type your message here..."}
              disabled={isLoading || !isConnected}
              className="message-input"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputMessage.trim() || !isConnected}
              className="send-btn"
              aria-label="Send message"
            >
              <span className="send-icon">{isLoading ? '⏳' : '📤'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ChatInterface;
