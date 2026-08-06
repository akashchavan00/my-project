import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class AgentService {
  async executeAgents(userInput, agents, sessionId = null) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/agents/execute`, {
        user_input: userInput,
        agents: agents,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error executing agents:', error);
      throw error;
    }
  }

  async saveAgentTemplate(agent) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/agents/save`, agent);
      return response.data;
    } catch (error) {
      console.error('Error saving agent template:', error);
      throw error;
    }
  }

  async getSavedAgents() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/agents/templates`);
      return response.data.agents;
    } catch (error) {
      console.error('Error fetching saved agents:', error);
      return [];
    }
  }

  async deleteAgentTemplate(agentId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/agents/templates/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting agent template:', error);
      throw error;
    }
  }
}

export default new AgentService();
