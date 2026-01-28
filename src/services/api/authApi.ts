import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './config';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      lastLoginAt?: string;
    };
    token: string;
  };
}

export interface UserProfile {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

class AuthApi {
  async register(name: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        name,
      });

      if (response.data.success) {
        await this.storeAuthData(
          response.data.data.token,
          response.data.data.user._id,
          response.data.data.user.name,
        );
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('An account with this name already exists');
      }
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async login(name: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        name,
      });
      console.log('Login response:', response.data);
      if (response.data.success) {
        await this.storeAuthData(
          response.data.data.token,
          response.data.data.user._id,
          response.data.data.user.name,
        );
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials. Please check your name.');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      // Check if token exists and is not null/undefined/empty/"null" string
      if (!token || token === 'null' || token.trim() === '') {
        return false;
      }

      const response = await apiClient.post('/auth/validate', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.success === true;
    } catch (error: any) {
      console.error('Token validation error:', error);
      // If validation fails, clear potentially corrupted token
      if (error.response?.status === 400 || error.response?.status === 401) {
        await this.logout();
      }
      return false;
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'userId', 'userName']);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('authToken');
    // Validate token exists and is not "null" string
    if (!token || token === 'null' || token.trim() === '') {
      return false;
    }
    return this.validateToken();
  }

  async getCurrentUserId(): Promise<string | null> {
    return AsyncStorage.getItem('userId');
  }

  async getCurrentUserName(): Promise<string | null> {
    return AsyncStorage.getItem('userName');
  }

  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem('authToken');
  }

  private async storeAuthData(token: string, userId: string, userName: string): Promise<void> {
    // Validate token before storing
    if (!token || token.trim() === '') {
      throw new Error('Invalid token provided');
    }
    
    await AsyncStorage.multiSet([
      ['authToken', token],
      ['userId', userId],
      ['userName', userName],
    ]);
    
    // Verify token was stored correctly
    const storedToken = await AsyncStorage.getItem('authToken');
    if (!storedToken || storedToken !== token) {
      console.error('Token storage verification failed');
      throw new Error('Failed to store authentication token');
    }
  }
}

export default new AuthApi();


