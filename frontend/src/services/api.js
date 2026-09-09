import axios from 'axios';

// Normalize base URL to handle missing /api, trailing slashes, or accidental http://
let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');

// Upgrade to https if pointing to onrender.com to prevent mixed-content blocks
if (rawBaseUrl.includes('onrender.com') && rawBaseUrl.startsWith('http://')) {
  rawBaseUrl = rawBaseUrl.replace('http://', 'https://');
}

// Automatically ensure /api suffix exists
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthenticated 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
