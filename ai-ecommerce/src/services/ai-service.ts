import axios from 'axios';

const AI_SERVICE_URL = 'https://api.example.com/ai'; // Replace with your actual AI service URL

export const fetchRecommendations = async (userId) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/recommendations`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const processUserData = async (userData) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/process`, userData);
    return response.data;
  } catch (error) {
    console.error('Error processing user data:', error);
    throw error;
  }
};