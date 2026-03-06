import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const RAW_BACKEND = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const BACKEND_URL = typeof RAW_BACKEND === 'string' ? RAW_BACKEND.trim().replace(/\/+$/, '') : RAW_BACKEND;
export const API_BASE_URL = `${BACKEND_URL}/api`;
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  async config => {
    const raw = await AsyncStorage.getItem('authToken');
    const token = typeof raw === 'string' ? raw.trim() : '';
    const hasValidToken =
      token &&
      token !== 'null' &&
      token !== 'offline' &&
      token.length > 0;
    if (hasValidToken) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    return Promise.reject(error);
  },
);

export default apiClient;


