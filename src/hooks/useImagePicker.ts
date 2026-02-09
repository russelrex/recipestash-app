import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform, Linking } from 'react-native';

interface UseImagePickerOptions {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
  maxSizeMB?: number;
}

interface PickedImage {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export const useImagePicker = (options: UseImagePickerOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    aspect = [1, 1],
    quality = 0.8,
    allowsEditing = true,
    maxSizeMB = 10,
  } = options;

  const requestPermission = async (type: 'camera' | 'library') => {
    try {
      let permissionResult;

      if (type === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      console.log(`${type} permission status:`, permissionResult.status);

      if (permissionResult.status !== 'granted') {
        const permissionType = type === 'camera' ? 'camera' : 'photo library';
        
        Alert.alert(
          'Permission Required',
          `RecipeStash needs access to your ${permissionType} to upload images. Please enable it in settings.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      setError('Failed to request permissions');
      return false;
    }
  };

  const validateImage = (image: ImagePicker.ImagePickerAsset): boolean => {
    // Check file size
    if (image.fileSize) {
      const sizeMB = image.fileSize / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        setError(`Image is too large (${sizeMB.toFixed(1)}MB). Please select an image smaller than ${maxSizeMB}MB.`);
        Alert.alert(
          'Image Too Large',
          `The selected image is ${sizeMB.toFixed(1)}MB. Please choose an image smaller than ${maxSizeMB}MB.`
        );
        return false;
      }
    }

    // Check dimensions (optional - can add max width/height)
    console.log('Image dimensions:', image.width, 'x', image.height);

    return true;
  };

  const pickFromLibrary = async (): Promise<PickedImage | null> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Requesting library permission...');
      const hasPermission = await requestPermission('library');
      
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect,
        quality,
        base64: false, // Don't use base64 for performance
      });

      console.log('Image picker result:', result);

      if (result.canceled) {
        console.log('User cancelled image selection');
        setIsLoading(false);
        return null;
      }

      const image = result.assets[0];

      if (!validateImage(image)) {
        setIsLoading(false);
        return null;
      }

      console.log('Selected image:', {
        uri: image.uri,
        width: image.width,
        height: image.height,
        size: image.fileSize,
      });

      setIsLoading(false);
      return {
        uri: image.uri,
        width: image.width,
        height: image.height,
        type: image.type,
        fileName: image.fileName,
        fileSize: image.fileSize,
      };
    } catch (error: any) {
      console.error('Error picking image from library:', error);
      setError(error.message || 'Failed to pick image');
      Alert.alert('Error', 'Failed to select image. Please try again.');
      setIsLoading(false);
      return null;
    }
  };

  const pickFromCamera = async (): Promise<PickedImage | null> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Requesting camera permission...');
      const hasPermission = await requestPermission('camera');
      
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing,
        aspect,
        quality,
        base64: false,
      });

      console.log('Camera result:', result);

      if (result.canceled) {
        console.log('User cancelled camera');
        setIsLoading(false);
        return null;
      }

      const image = result.assets[0];

      if (!validateImage(image)) {
        setIsLoading(false);
        return null;
      }

      console.log('Captured photo:', {
        uri: image.uri,
        width: image.width,
        height: image.height,
        size: image.fileSize,
      });

      setIsLoading(false);
      return {
        uri: image.uri,
        width: image.width,
        height: image.height,
        type: image.type,
        fileName: image.fileName,
        fileSize: image.fileSize,
      };
    } catch (error: any) {
      console.error('Error taking photo:', error);
      setError(error.message || 'Failed to take photo');
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      setIsLoading(false);
      return null;
    }
  };

  const showImageSourcePicker = (): Promise<PickedImage | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image Source',
        'Choose where to get your image from',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const image = await pickFromCamera();
              resolve(image);
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const image = await pickFromLibrary();
              resolve(image);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ]
      );
    });
  };

  return {
    pickFromLibrary,
    pickFromCamera,
    showImageSourcePicker,
    isLoading,
    error,
  };
};
