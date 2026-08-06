import { useState, useEffect } from 'react';
import './AgentBuilder.css';

function AgentBuilder({ onClose, onPipelineReady, savedAgents, editingAgent, availableTools }) {
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
  const [selectedTools, setSelectedTools] = useState([]);

  // Load editing agent if provided
  useEffect(() => {
    if (editingAgent) {
      setAgents([editingAgent]);
      setSelectedTools(editingAgent.tools || []);
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
      order: editingIndex !== null ? currentAgent.order : agents.length,
      tools: selectedTools
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
    setSelectedTools([]);
  };

  const handleEditAgent = (index) => {
    setCurrentAgent(agents[index]);
    setSelectedTools(agents[index].tools || []);
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
    setSelectedTools(template.tools || []);
    setShowTemplates(false);
  };

  const handleToolToggle = (toolId) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
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

            <div className="form-group">
              <label>Tools (Optional)</label>
              <div className="tools-selection">
                {availableTools && availableTools.length > 0 ? (
                  availableTools.map(tool => (
                    <div key={tool.id} className="tool-checkbox">
                      <input
                        type="checkbox"
                        id={`tool-${tool.id}`}
                        checked={selectedTools.includes(tool.id)}
                        onChange={() => handleToolToggle(tool.id)}
                      />
                      <label htmlFor={`tool-${tool.id}`}>
                        <span className="tool-checkbox-name">{tool.name}</span>
                        <span className="tool-checkbox-desc">{tool.description}</span>
                      </label>
                    </div>
                  ))
                ) : (
                  <span className="help-text">No tools available</span>
                )}
              </div>
              {selectedTools.length > 0 && (
                <div className="selected-tools-info">
                  ✓ {selectedTools.length} tool{selectedTools.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowTemplates(!showTemplates)}>
                📋 Templates
              </button>
              <button className="btn-save-agent" onClick={handleAddAgent} title="Save agent to pipeline">
                💾 {editingIndex !== null ? 'Update' : 'Save'}
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
                  setSelectedTools([]);
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
                      {agent.tools && agent.tools.length > 0 && (
                        <div className="pipeline-tools">
                          🔧 {agent.tools.join(', ')}
                        </div>
                      )}
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
