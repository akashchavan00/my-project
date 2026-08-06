import { useState, useEffect } from 'react';
import './AgentBuilder.css';

function AgentBuilder({ onClose, onPipelineReady, savedAgents, editingAgent }) {
  const [agents, setAgents] = useState([]);
  const [currentAgent, setCurrentAgent] = useState({
    agent_id: '',
    name: '',
    description: '',
    prompt: '',
    temperature: 0.7,
    tools: [],
    order: 0
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Load editing agent if provided
  useEffect(() => {
    if (editingAgent) {
      setAgents([editingAgent]);
    }
  }, [editingAgent]);

  const generateAgentId = () => {
    return 'agent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const handleAddAgent = () => {
    if (!currentAgent.name || !currentAgent.prompt) {
      alert('Please fill in agent name and prompt');
      return;
    }

    const newAgent = {
      ...currentAgent,
      agent_id: currentAgent.agent_id || generateAgentId(),
      order: editingIndex !== null ? currentAgent.order : agents.length
    };

    if (editingIndex !== null) {
      const updatedAgents = [...agents];
      updatedAgents[editingIndex] = newAgent;
      setAgents(updatedAgents);
      setEditingIndex(null);
    } else {
      setAgents([...agents, newAgent]);
    }

    // Reset form
    setCurrentAgent({
      agent_id: '',
      name: '',
      description: '',
      prompt: '',
      temperature: 0.7,
      tools: [],
      order: 0
    });
  };

  const handleEditAgent = (index) => {
    setCurrentAgent(agents[index]);
    setEditingIndex(index);
  };

  const handleDeleteAgent = (index) => {
    const updatedAgents = agents.filter((_, i) => i !== index);
    const reorderedAgents = updatedAgents.map((agent, i) => ({
      ...agent,
      order: i
    }));
    setAgents(reorderedAgents);
  };

  const handleMoveAgent = (index, direction) => {
    const newAgents = [...agents];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newAgents.length) return;
    
    [newAgents[index], newAgents[newIndex]] = [newAgents[newIndex], newAgents[index]];
    
    newAgents.forEach((agent, i) => {
      agent.order = i;
    });
    
    setAgents(newAgents);
  };

  const handleLoadTemplate = (template) => {
    const newAgent = {
      ...template,
      agent_id: generateAgentId(),
      order: agents.length
    };
    setCurrentAgent(newAgent);
    setShowTemplates(false);
  };

  const handleDone = () => {
    if (agents.length === 0) {
      alert('Please add at least one agent');
      return;
    }
    onPipelineReady(agents);
  };

  return (
    <div className="agent-builder-overlay">
      <div className="agent-builder">
        <div className="agent-builder-header">
          <h2>🤖 {editingAgent ? 'Edit Agent' : 'Agent Pipeline Builder'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="agent-builder-content">
          <div className="agent-form">
            <h3>{editingIndex !== null ? 'Edit Agent' : 'Create Agent'}</h3>
            
            <div className="form-group">
              <label>Agent Name *</label>
              <input
                type="text"
                placeholder="e.g., Content Analyzer"
                value={currentAgent.name}
                onChange={(e) => setCurrentAgent({...currentAgent, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="What this agent does"
                value={currentAgent.description}
                onChange={(e) => setCurrentAgent({...currentAgent, description: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Agent Task/Prompt *</label>
              <textarea
                placeholder="Instructions for this agent. E.g., 'You are an expert analyzer. Review the text and provide insights...'"
                value={currentAgent.prompt}
                onChange={(e) => setCurrentAgent({...currentAgent, prompt: e.target.value})}
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Temperature</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={currentAgent.temperature}
                  onChange={(e) => setCurrentAgent({...currentAgent, temperature: parseFloat(e.target.value)})}
                />
                <span className="help-text">Higher = more creative (0-2)</span>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowTemplates(!showTemplates)}>
                📋 Templates
              </button>
              <button className="btn-add-agent-simple" onClick={handleAddAgent} title="Add Agent">
                +
              </button>
              {editingIndex !== null && (
                <button className="btn-cancel-edit" onClick={() => {
                  setEditingIndex(null);
                  setCurrentAgent({
                    agent_id: '',
                    name: '',
                    description: '',
                    prompt: '',
                    temperature: 0.7,
                    tools: [],
                    order: 0
                  });
                }}>
                  Cancel
                </button>
              )}
            </div>

            {showTemplates && savedAgents.length > 0 && (
              <div className="templates-list">
                <h4>Saved Templates</h4>
                {savedAgents.map((template, index) => (
                  <div key={index} className="template-item" onClick={() => handleLoadTemplate(template)}>
                    <div className="template-name">{template.name}</div>
                    <div className="template-desc">{template.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="agents-pipeline">
            <h3>Pipeline ({agents.length} agent{agents.length !== 1 ? 's' : ''})</h3>
            
            {agents.length === 0 ? (
              <div className="empty-pipeline">
                <p>No agents added</p>
                <p className="help-text">Create agents to build your pipeline</p>
              </div>
            ) : (
              <div className="pipeline-list">
                {agents.map((agent, index) => (
                  <div key={index} className="pipeline-item">
                    <div className="pipeline-order">#{index + 1}</div>
                    <div className="pipeline-content">
                      <div className="pipeline-name">{agent.name}</div>
                      <div className="pipeline-desc">{agent.description || 'No description'}</div>
                      <div className="pipeline-prompt">{agent.prompt.substring(0, 60)}...</div>
                    </div>
                    <div className="pipeline-actions">
                      <button 
                        className="btn-move" 
                        onClick={() => handleMoveAgent(index, 'up')}
                        disabled={index === 0}
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button 
                        className="btn-move" 
                        onClick={() => handleMoveAgent(index, 'down')}
                        disabled={index === agents.length - 1}
                        title="Move down"
                      >
                        ▼
                      </button>
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditAgent(index)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteAgent(index)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="agent-builder-footer">
          <div className="footer-info">
            <span className="info-icon">ℹ️</span>
            <span>Agents will be saved to your collection.</span>
          </div>
          <div className="footer-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button 
              className="btn-done" 
              onClick={handleDone}
              disabled={agents.length === 0}
            >
              ✓ Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentBuilder;
