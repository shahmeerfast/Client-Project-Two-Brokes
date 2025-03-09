import axios from 'axios';

// Create axios instance with base URL
const instance = axios.create({
    baseURL: 'http://localhost:4000', // Remove /api from here since it's included in the route paths
    timeout: 5000, // Request timeout in milliseconds
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor to handle errors
instance.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

export default instance; 