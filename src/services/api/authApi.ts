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
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatarUrl?: string; // base64 data URI | existing URL | '' to clear
}

class AuthApi {
  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
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
        throw new Error('An account with this email already exists');
      }
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: data.email,
        password: data.password,
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
        throw new Error('Invalid email or password');
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

      // Let the apiClient interceptor handle the Authorization header automatically
      const response = await apiClient.post('/auth/validate', {});

      return response.data.success === true;
    } catch (error: any) {
      console.error('Token validation error:', error);
      
      // Only clear token on actual authentication failure (401 Unauthorized)
      // Don't clear on network errors, timeouts, or other issues
      if (error.response?.status === 401) {
        console.warn('Token is invalid or expired, clearing auth data');
        await this.logout();
      } else if (error.response?.status === 400) {
        // 400 might be a bad request format, not necessarily invalid token
        // Log but don't clear token - let the user try again
        console.warn('Token validation request failed with 400, but keeping token');
      } else {
        // Network error, timeout, or other non-auth errors
        // Don't clear token - might be temporary issue
        console.warn('Token validation failed due to network/other error, keeping token');
      }
      
      return false;
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get('/users/profile');
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || 'Failed to fetch profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await apiClient.put('/users/profile', data);
      if (response.data.success) {
        const updated: UserProfile = response.data.data;
        if (updated.name) await AsyncStorage.setItem('userName', updated.name);
        return updated;
      }
      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'userId', 'userName']);
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      // Validate token exists and is not "null" string
      if (!token || token === 'null' || token.trim() === '') {
        return false;
      }
      
      // Try to validate the token
      const isValid = await this.validateToken();
      
      if (isValid) {
        return true;
      }
      
      // Validation returned false - check if token was cleared (401) or still exists (network error)
      const tokenStillExists = await AsyncStorage.getItem('authToken');
      if (tokenStillExists && tokenStillExists !== 'null' && tokenStillExists.trim() !== '') {
        // Token still exists, validation might have failed due to network error
        // Assume authenticated - API calls will handle actual auth failures
        console.warn('Token validation failed but token exists, assuming authenticated (likely network error)');
        return true;
      }
      
      // Token was cleared (401 error), user is not authenticated
      return false;
    } catch (error) {
      console.error('Error in isAuthenticated:', error);
      // On unexpected error, check if we have a token - if yes, assume authenticated
      const token = await AsyncStorage.getItem('authToken');
      return !!(token && token !== 'null' && token.trim() !== '');
    }
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


