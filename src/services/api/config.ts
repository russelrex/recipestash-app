import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Expo only exposes env vars that start with EXPO_PUBLIC_
// Ensure your .env/.env.local contains: EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
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
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor - Handle auth errors
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async error => {
    console.error('API Error:', error.response?.status, error.config?.url);

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['authToken', 'userId', 'userName']);
      console.log('Authentication failed - please login again');
    }

    if (error.response) {
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    }
    return Promise.reject(error);
  },
);

export default apiClient;


