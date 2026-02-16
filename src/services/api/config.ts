import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
export const API_BASE_URL = `${BACKEND_URL}/api`;

console.log('🌐 API URL:', API_BASE_URL);
console.log('📱 Build Profile:', process.env.EAS_BUILD_PROFILE);

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
    // Only add token if it exists, is not "null" string, and is not "offline"
    // Skip Authorization header for offline mode to prevent credential leakage
    if (token && token !== 'null' && token.trim() !== '' && token !== 'offline') {
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


