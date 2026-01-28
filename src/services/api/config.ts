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
    // Only add token if it exists and is not "null" string
    if (token && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    if (error.response?.status === 401) {
      console.warn(
        'Received 401 Unauthorized from API. Endpoint:',
        error.config?.url,
      );
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


