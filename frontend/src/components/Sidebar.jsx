import { useState, useEffect } from 'react';
import './Sidebar.css';

function Sidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  agents,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  tools,
  isOpen,
  onToggle 
}) {
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [agentsExpanded, setAgentsExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const groupSessionsByDate = (sessions) => {
    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: []
    };

    sessions.forEach(session => {
      const date = new Date(session.updated_at);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        groups.today.push(session);
      } else if (diffDays === 1) {
        groups.yesterday.push(session);
      } else if (diffDays < 7) {
        groups.lastWeek.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate(sessions);

  const renderSessionGroup = (title, sessions) => {
    if (sessions.length === 0) return null;

    return (
      <div className="session-group">
        <div className="session-group-title">{title}</div>
        {sessions.map((session) => (
          <div
            key={session.session_id}
            className={`session-item ${session.session_id === currentSessionId ? 'active' : ''}`}
            onClick={() => onSelectSession(session.session_id)}
          >
            <div className="session-content">
              <div className="session-icon">💬</div>
              <div className="session-info">
                <div className="session-preview">{session.preview}</div>
                <div className="session-meta">
                  <span className="session-count">{session.message_count} msgs</span>
                </div>
              </div>
            </div>
            <button
              className="delete-session-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Delete this chat?')) {
                  onDeleteSession(session.session_id);
                }
              }}
              title="Delete chat"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <button 
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        {isOpen ? '◀' : '☰'}
      </button>

      <div 
        className={`sidebar ${isOpen ? 'open' : ''}`}
      >
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="new-chat-btn" onClick={onNewChat}>
            <span className="btn-icon">➕</span>
            <span className="btn-text">New Chat</span>
          </button>
        </div>

        <div className="sidebar-content">
          {/* Chats Section */}
          <div className="sidebar-section">
            <button 
              className={`section-toggle ${chatsExpanded ? 'expanded' : ''}`}
              onClick={() => setChatsExpanded(!chatsExpanded)}
            >
              <span className="toggle-icon">{chatsExpanded ? '▼' : '▶'}</span>
              <span className="section-title">Chat History</span>
              <span className="section-count">{sessions.length}</span>
            </button>
            
            {chatsExpanded && (
              <div className="section-content">
                {sessions.length === 0 ? (
                  <div className="empty-state">
                    <p>No chats yet</p>
                  </div>
                ) : (
                  <>
                    {renderSessionGroup('Today', groupedSessions.today)}
                    {renderSessionGroup('Yesterday', groupedSessions.yesterday)}
                    {renderSessionGroup('Last 7 Days', groupedSessions.lastWeek)}
                    {renderSessionGroup('Older', groupedSessions.older)}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Agents Section */}
          <div className="sidebar-section">
            <button 
              className={`section-toggle ${agentsExpanded ? 'expanded' : ''}`}
              onClick={() => setAgentsExpanded(!agentsExpanded)}
            >
              <span className="toggle-icon">{agentsExpanded ? '▼' : '▶'}</span>
              <span className="section-title">Saved Agents</span>
              <span className="section-count">{agents.length}</span>
            </button>
            
            {agentsExpanded && (
              <div className="section-content">
                <button className="create-agent-btn" onClick={onCreateAgent}>
                  <span className="btn-icon">➕</span>
                  <span className="btn-text">Create Agent</span>
                </button>

                {agents.length === 0 ? (
                  <div className="empty-state">
                    <p>No saved agents</p>
                  </div>
                ) : (
                  <div className="agents-list">
                    {agents.map((agent) => (
                      <div key={agent.agent_id} className="agent-item">
                        <div className="agent-content" onClick={() => onEditAgent(agent)}>
                          <div className="agent-icon">🤖</div>
                          <div className="agent-info">
                            <div className="agent-name">{agent.name}</div>
                            <div className="agent-desc">{agent.description || 'No description'}</div>
                          </div>
                        </div>
                        <button
                          className="delete-agent-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete agent "${agent.name}"?`)) {
                              onDeleteAgent(agent.agent_id);
                            }
                          }}
                          title="Delete agent"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tools Section */}
          <div className="sidebar-section">
            <button 
              className={`section-toggle ${toolsExpanded ? 'expanded' : ''}`}
              onClick={() => setToolsExpanded(!toolsExpanded)}
            >
              <span className="toggle-icon">{toolsExpanded ? '▼' : '▶'}</span>
              <span className="section-title">Available Tools</span>
              <span className="section-count">{tools?.length || 0}</span>
            </button>
            
            {toolsExpanded && (
              <div className="section-content">
                {!tools || tools.length === 0 ? (
                  <div className="empty-state">
                    <p>No tools available</p>
                  </div>
                ) : (
                  <div className="tools-list">
                    {tools.map((tool) => (
                      <div key={tool.id} className="tool-item">
                        <div className="tool-icon">🔧</div>
                        <div className="tool-info">
                          <div className="tool-name">{tool.name}</div>
                          <div className="tool-desc">{tool.description}</div>
                          {tool.usage && (
                            <div className="tool-usage">💡 {tool.usage}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
    </>
  );
}

export default Sidebar;
