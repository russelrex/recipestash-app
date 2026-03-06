import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
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
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    try {
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

      const fileExtension = this.getFileExtension(imageUri);
      const mimeType = this.getMimeType(fileExtension);
      const fileName = `photo_${Date.now()}.${fileExtension}`;

      // Normalize URI for platforms (iOS often requires stripping file://)
      const normalizedUri =
        Platform.OS === 'ios'
          ? imageUri.replace('file://', '')
          : imageUri;

      const formData = new FormData();
      formData.append('file', {
        uri: normalizedUri,
        name: fileName,
        type: mimeType,
      } as any);

      const headers: any = {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      };

      const response = await axios.post(fullUrl, formData, {
        headers,
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        },
      });

      return response.data;
    } catch (error: any) {
      const hasResponse = !!error.response;
      const hasRequest = !!error.request;
      if (error.response) {
        throw new Error(
          error.response.data?.message || 'Upload failed. Please try again.'
        );
      }
      if (error.request) {
        throw new Error(
          'Could not connect to server. Please check your internet connection and try again.'
        );
      }
      throw new Error(error.message || 'Upload failed. Please try again.');
    }
  }

  async uploadProfilePicture(
    imageUri: string,
    token?: string
  ): Promise<UploadResponse> {
    const endpoint = '/users/profile-picture';

    // Backend may return either:
    // { url, filename, size }  OR  { success, message, profilePicture }
    const raw: any = await this.uploadImage(imageUri, endpoint, token);

    const resolvedUrl: string | undefined =
      raw?.url ?? raw?.profilePicture ?? raw?.avatarUrl;

    const normalized: UploadResponse = {
      url: resolvedUrl || '',
      filename: raw?.filename ?? 'profile-picture',
      size: typeof raw?.size === 'number' ? raw.size : 0,
    };

    return normalized;
  }

  async uploadRecipeImage(
    imageUri: string,
    token?: string
  ): Promise<UploadResponse> {
    const endpoint = '/recipes/upload-image';

    // Backend may return either:
    // { url, filename, size }  OR  { imageUrl, featuredImage, success, message }
    const raw: any = await this.uploadImage(imageUri, endpoint, token);

    const resolvedUrl: string | undefined =
      raw?.url ??
      raw?.imageUrl ??
      raw?.featuredImage ??
      raw?.fileUrl;

    const normalized: UploadResponse = {
      url: resolvedUrl || '',
      filename: raw?.filename ?? 'recipe-image',
      size: typeof raw?.size === 'number' ? raw.size : 0,
    };

    return normalized;
  }
}

export const imageUploadService = new ImageUploadService();
