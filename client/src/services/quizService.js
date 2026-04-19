import axios from 'axios';

const API_URL = '/api/quiz';

export const quizService = {
  // Get quiz questions
  getQuestions: async (category, level, limit = 25) => {
    try {
      const response = await axios.get(API_URL, {
        params: { category, level, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Submit quiz attempt
  submitAttempt: async (attemptData) => {
    try {
      const response = await axios.post(`${API_URL}/attempt`, attemptData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
