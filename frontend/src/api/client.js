import axios from 'axios';

// In development, Vite proxies /api to http://localhost:5000 (or uses relative in production)
const API_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('homes2own_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    
    // Automatically clear token on 401 unauth
    if (error.response?.status === 401 && localStorage.getItem('homes2own_token')) {
      // Allow caller to handle redirect or state clear
    }

    return Promise.reject(new Error(message));
  }
);

export default client;
