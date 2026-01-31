export const ImageUploadConfig = {
  // Allowed formats
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],

  // File size limits (in bytes)
  maxFileSize: 5 * 1024 * 1024, // 5MB
  featuredImageMaxSize: 5 * 1024 * 1024, // 5MB
  additionalImageMaxSize: 3 * 1024 * 1024, // 3MB

  // Recommended sizes for display
  recommendedFeaturedSize: '2MB - 5MB',
  recommendedAdditionalSize: '1MB - 3MB',

  // Image dimensions
  maxWidth: 2048,
  maxHeight: 2048,

  // Resize settings
  resizeQuality: 0.8, // 0-1
  featuredImageResize: {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.85,
  },
  additionalImageResize: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
  },

  // Upload limits
  maxAdditionalImages: 5,

  // Compression
  compressFormat: 'JPEG' as const,
  compressionQuality: 80, // 0-100
};

export const ImageUploadMessages = {
  invalidFormat: 'Please select a valid image format (JPEG, PNG, or WebP)',
  fileTooLarge: (maxSize: number) =>
    `Image size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`,
  featuredImageTooLarge: `Featured image must be less than ${(ImageUploadConfig.featuredImageMaxSize / (1024 * 1024)).toFixed(0)}MB`,
  additionalImageTooLarge: `Additional images must be less than ${(ImageUploadConfig.additionalImageMaxSize / (1024 * 1024)).toFixed(0)}MB`,
  tooManyImages: `You can only upload up to ${ImageUploadConfig.maxAdditionalImages} additional images`,
  uploadFailed: 'Failed to upload image. Please try again.',
  processingError: 'Error processing image. Please try a different image.',
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
