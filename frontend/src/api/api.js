// src/api.js
import axios from 'axios';

// ✅ Read environment variable (from .env file)
const baseURL = `${import.meta.env.VITE_API_BASE_URL}/api`;

// ✅ Create an Axios instance
const api = axios.create({
  baseURL, // same as baseURL: baseURL
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor – adds token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // JWT stored after login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor – handles errors globally (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized! Redirecting to login...');
      // Optional: handle logout or redirect
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
