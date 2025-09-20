// File Path: frontend/src/lib/api.js
import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL+'/api' || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// The interceptor now reads the token directly from localStorage.
// This breaks the circular dependency with the authStore.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // The token from localStorage is a plain string, no need to parse.
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

