
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { tokenUtils }   from '../utils/token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ───────────────────────────────────────
// Runs before EVERY request is sent
// Reads token from localStorage and attaches to Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenUtils.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────
// Runs after EVERY response comes back
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenUtils.remove();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;