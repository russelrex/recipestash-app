import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Alert, Platform } from 'react-native';
import { ImageUploadConfig, ImageUploadMessages, formatFileSize } from '../config/imageUpload.config';

// Conditionally import ImageResizer only for native platforms
let ImageResizer: any = null;
if (Platform.OS !== 'web') {
  try {
    ImageResizer = require('react-native-image-resizer').default;
  } catch (error) {
    console.warn('ImageResizer not available:', error);
  }
}

export interface ImageData {
  uri: string;
  type: string;
  name: string;
  size: number;
}

class ImagePickerService {
  async pickFromGallery(imageType: 'featured' | 'additional' = 'additional'): Promise<ImageData | null> {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxWidth: ImageUploadConfig.maxWidth,
        maxHeight: ImageUploadConfig.maxHeight,
        quality: ImageUploadConfig.resizeQuality,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return null;
      }

      return await this.processImage(result, imageType);
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', ImageUploadMessages.uploadFailed);
      return null;
    }
  }

  async takePhoto(imageType: 'featured' | 'additional' = 'additional'): Promise<ImageData | null> {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        includeBase64: false,
        maxWidth: ImageUploadConfig.maxWidth,
        maxHeight: ImageUploadConfig.maxHeight,
        quality: ImageUploadConfig.resizeQuality,
        saveToPhotos: true,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return null;
      }

      return await this.processImage(result, imageType);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', ImageUploadMessages.uploadFailed);
      return null;
    }
  }

  private async processImage(
    result: ImagePickerResponse,
    imageType: 'featured' | 'additional',
  ): Promise<ImageData | null> {
    const asset = result.assets![0];

    if (!asset.uri) {
      return null;
    }

    // Validate file type
    if (asset.type && !ImageUploadConfig.allowedMimeTypes.includes(asset.type)) {
      Alert.alert('Invalid Format', ImageUploadMessages.invalidFormat);
      return null;
    }

    // Pre-compression validation: check original file size before any processing.
    // This protects against extremely large images that could cause long processing
    // times or memory issues on older devices.
    if (asset.fileSize) {
      const originalSize = asset.fileSize;
      const maxUncompressed = ImageUploadConfig.maxUncompressedSize;
      const warningThreshold = ImageUploadConfig.warningSizeThreshold;

      if (originalSize > maxUncompressed) {
        Alert.alert(
          ImageUploadMessages.preUploadFileTooLargeTitle,
          ImageUploadMessages.preUploadFileTooLargeDescription(
            formatFileSize(originalSize),
            formatFileSize(maxUncompressed),
          ),
        );
        return null;
      }

      if (originalSize > warningThreshold) {
        Alert.alert(
          ImageUploadMessages.preUploadFileVeryLargeTitle,
          ImageUploadMessages.preUploadFileVeryLargeDescription(
            formatFileSize(originalSize),
          ),
        );
      }
    }

    try {
      // Get resize settings based on image type
      const resizeSettings =
        imageType === 'featured'
          ? ImageUploadConfig.featuredImageResize
          : ImageUploadConfig.additionalImageResize;

      let processedUri: string;
      let processedSize: number;

      if (Platform.OS === 'web') {
        // Web: Use canvas-based resizing
        const result = await this.resizeImageWeb(
          asset.uri,
          resizeSettings.maxWidth,
          resizeSettings.maxHeight,
          ImageUploadConfig.compressionQuality / 100
        );
        processedUri = result.uri;
        // For web, estimate size (will be validated on upload)
        processedSize = asset.fileSize || 0;
      } else {
        // Native: Use ImageResizer
        if (!ImageResizer) {
          throw new Error('ImageResizer is not available on this platform');
        }

        const resized = await ImageResizer.createResizedImage(
          asset.uri,
          resizeSettings.maxWidth,
          resizeSettings.maxHeight,
          ImageUploadConfig.compressFormat,
          ImageUploadConfig.compressionQuality,
          0,
          undefined,
          false,
          { mode: 'contain', onlyScaleDown: true },
        );

        processedUri = resized.uri;
        // Use original file size as estimate (resizing typically reduces size)
        processedSize = asset.fileSize || 0;
      }

      // Validate size against per-type limits (using original size as estimate)
      const maxSize =
        imageType === 'featured'
          ? ImageUploadConfig.featuredImageMaxSize
          : ImageUploadConfig.additionalImageMaxSize;

      if (processedSize > maxSize) {
        Alert.alert(
          'File Too Large',
          `The image is too large (${formatFileSize(processedSize)}). Please try a different image.`
        );
        return null;
      }

      return {
        uri: processedUri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: processedSize,
      };
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', ImageUploadMessages.processingError);
      return null;
    }
  }

  private async resizeImageWeb(
    uri: string,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<{ uri: string }> {
    return new Promise((resolve, reject) => {
      // Type guard for web environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        reject(new Error('Web APIs are not available'));
        return;
      }

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Create blob URL for preview
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              const blobUrl = window.URL.createObjectURL(blob);
              resolve({ uri: blobUrl });
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = uri;
    });
  }
}

export default new ImagePickerService();
