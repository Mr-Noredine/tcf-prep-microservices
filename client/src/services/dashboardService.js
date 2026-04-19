import axios from 'axios';

const API_URL = '/api/users';

export const dashboardService = {
  // Get user statistics
  getStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user progress by category
  getProgress: async () => {
    try {
      const response = await axios.get(`${API_URL}/progress`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get attempts history
  getAttempts: async (limit = 10, offset = 0) => {
    try {
      const response = await axios.get(`${API_URL}/attempts`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get progress timeline (last 30 days)
  getTimeline: async () => {
    try {
      const response = await axios.get(`${API_URL}/timeline`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get personalized recommendations
  getRecommendations: async () => {
    try {
      const response = await axios.get(`${API_URL}/recommendations`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};