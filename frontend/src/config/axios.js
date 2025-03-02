import axios from 'axios';

// Create axios instance with base URL
const instance = axios.create({
  baseURL: 'http://localhost:4000', // Your backend server URL
  timeout: 5000, // Request timeout in milliseconds
});

export default instance; 