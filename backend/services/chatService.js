import axios from 'axios';

const API_URL = 'http://localhost:3001/api/chat';

// Function to send message to the server
export const sendMessage = async (message) => {
  try {
    const response = await axios.post(API_URL, { message });
    return response.data.response;
  } catch (error) {
    console.error('Error sending message:', error);
    return 'Error occurred, please try again later.';
  }
};