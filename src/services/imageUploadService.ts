import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from './api/config';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

class ImageUploadService {
  private getFileExtension(uri: string): string {
    const parts = uri.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[extension] || 'image/jpeg';
  }

  async uploadImage(
    imageUri: string,
    endpoint: string = '/upload',
    token?: string
  ): Promise<UploadResponse> {
    try {
      console.log('Starting image upload...');
      console.log('Image URI:', imageUri);
      console.log('Upload endpoint:', `${API_BASE_URL}${endpoint}`);

      // Get auth token if not provided
      let authToken: string | undefined = token;
      if (!authToken) {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (
          !storedToken ||
          storedToken === 'null' ||
          storedToken === 'offline'
        ) {
          throw new Error('Authentication required for image upload');
        }
        authToken = storedToken;
      }

      // Create FormData
      const formData = new FormData();
      
      // Get file extension
      const fileExtension = this.getFileExtension(imageUri);
      const mimeType = this.getMimeType(fileExtension);
      
      console.log('File type:', mimeType);

      // Append image file
      formData.append('file', {
        uri: imageUri,
        name: `photo_${Date.now()}.${fileExtension}`,
        type: mimeType,
      } as any);

      // Prepare headers
      // NOTE: Do NOT set the Content-Type manually here.
      // Axios will set the correct multipart/form-data boundary automatically
      // when sending FormData. Manually setting it can cause the backend
      // to see an empty payload.
      const headers: any = {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      console.log('Uploading to:', `${API_BASE_URL}${endpoint}`);

      // Upload
      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        formData,
        {
          headers,
          timeout: 60000, // 60 seconds for uploads
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          },
        }
      );

      console.log('Upload successful:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error);

      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
        throw new Error(
          error.response.data.message || 'Upload failed. Please try again.'
        );
      } else if (error.request) {
        console.error('No response received');
        throw new Error(
          'Could not connect to server. Please check your internet connection.'
        );
      } else {
        throw new Error(error.message || 'Upload failed. Please try again.');
      }
    }
  }

  async uploadProfilePicture(
    imageUri: string,
    token?: string
  ): Promise<UploadResponse> {
    return this.uploadImage(imageUri, '/users/profile-picture', token);
  }

  async uploadRecipeImage(
    imageUri: string,
    token?: string
  ): Promise<UploadResponse> {
    return this.uploadImage(imageUri, '/recipes/upload-image', token);
  }
}

export const imageUploadService = new ImageUploadService();
