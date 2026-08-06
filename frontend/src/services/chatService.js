import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class ChatService {
  constructor() {
    this.currentSessionId = this.getOrCreateSessionId();
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('current_chat_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('current_chat_session_id', sessionId);
    }
    return sessionId;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getCurrentSessionId() {
    return this.currentSessionId;
  }

  setCurrentSessionId(sessionId) {
    this.currentSessionId = sessionId;
    localStorage.setItem('current_chat_session_id', sessionId);
  }

  createNewSession() {
    const newSessionId = this.generateSessionId();
    this.setCurrentSessionId(newSessionId);
    return newSessionId;
  }

  async sendMessage(message, sessionId = null) {
    try {
      const sid = sessionId || this.currentSessionId;
      const response = await axios.post(`${API_BASE_URL}/api/chat/message`, {
        message: message,
        session_id: sid
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getAllSessions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/sessions`);
      return response.data.sessions;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId = null) {
    try {
      const sid = sessionId || this.currentSessionId;
      const response = await axios.get(`${API_BASE_URL}/api/chat/history/${sid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  async deleteSession(sessionId) {
    try {
      await axios.delete(`${API_BASE_URL}/api/chat/session/${sessionId}`);
      
      // If deleted session is current, create new one
      if (sessionId === this.currentSessionId) {
        this.createNewSession();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

export default new ChatService();
