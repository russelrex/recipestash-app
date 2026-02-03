import React from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Menu, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImageUploadConfig, formatFileSize } from '../config/imageUpload.config';
import ImagePickerService, { ImageData } from '../services/imagePicker';
import { Colors } from '../theme';

interface ImageUploadSectionProps {
  featuredImage: ImageData | null;
  additionalImages: ImageData[];
  onFeaturedImageChange: (image: ImageData | null) => void;
  onAdditionalImagesChange: (images: ImageData[]) => void;
  existingFeaturedUrl?: string;
  existingImageUrls?: string[];
  onExistingFeaturedUrlChange?: (url: string) => void;
  onExistingImageUrlsChange?: (urls: string[]) => void;
}

export default function ImageUploadSection({
  featuredImage,
  additionalImages,
  onFeaturedImageChange,
  onAdditionalImagesChange,
  existingFeaturedUrl = '',
  existingImageUrls = [],
  onExistingFeaturedUrlChange,
  onExistingImageUrlsChange,
}: ImageUploadSectionProps) {
  const [featuredMenuVisible, setFeaturedMenuVisible] = React.useState(false);
  const [additionalMenuVisible, setAdditionalMenuVisible] = React.useState(false);

  const handleFeaturedImagePick = async (source: 'camera' | 'gallery') => {
    setFeaturedMenuVisible(false);

    const image =
      source === 'camera'
        ? await ImagePickerService.takePhoto('featured')
        : await ImagePickerService.pickFromGallery('featured');

    if (image) {
      onFeaturedImageChange(image);
    }
  };

  const handleAdditionalImagePick = async (source: 'camera' | 'gallery') => {
    setAdditionalMenuVisible(false);

    if (additionalImages.length >= ImageUploadConfig.maxAdditionalImages) {
      Alert.alert(
        'Limit Reached',
        `You can only add up to ${ImageUploadConfig.maxAdditionalImages} additional images`
      );
      return;
    }

    const image =
      source === 'camera'
        ? await ImagePickerService.takePhoto('additional')
        : await ImagePickerService.pickFromGallery('additional');

    if (image) {
      onAdditionalImagesChange([...additionalImages, image]);
    }
  };

  const handleRemoveFeaturedImage = () => {
    const remove = () => {
      onFeaturedImageChange(null);
      if (onExistingFeaturedUrlChange) {
        onExistingFeaturedUrlChange('');
      }
    };

    if (Platform.OS === 'web') {
      // Alert is not well-supported on web – remove directly
      remove();
      return;
    }

    Alert.alert('Remove Image', 'Are you sure you want to remove the featured image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
  };

  const handleRemoveExistingAdditionalImage = (index: number) => {
    const remove = () => {
      if (onExistingImageUrlsChange) {
        const newUrls = existingImageUrls.filter((_, i) => i !== index);
        onExistingImageUrlsChange(newUrls);
      }
    };

    if (Platform.OS === 'web') {
      remove();
      return;
    }

    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const remove = () => {
      const newImages = additionalImages.filter((_, i) => i !== index);
      onAdditionalImagesChange(newImages);
    };

    if (Platform.OS === 'web') {
      remove();
      return;
    }

    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
  };

  const getTotalSize = () => {
    let total = 0;
    if (featuredImage) total += featuredImage.size;
    additionalImages.forEach(img => (total += img.size));
    return total;
  };

  const hasFeaturedImage = featuredImage || existingFeaturedUrl;
  const totalAdditionalCount = additionalImages.length + existingImageUrls.length;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Featured Image
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            Total: {formatFileSize(getTotalSize())}
          </Text>
        </View>
        
        {/* Featured Image Section */}
        <View style={styles.subsection}>
          <View style={styles.subsectionHeader}>
            <Text variant="bodySmall" style={styles.subsectionSubtitle}>
              Main image for your recipe
            </Text>
          </View>

          {hasFeaturedImage ? (
            <View style={styles.featuredImageContainer}>
              <Image 
                source={{ uri: featuredImage ? featuredImage.uri : existingFeaturedUrl }} 
                style={styles.featuredImage} 
              />
              {featuredImage && (
                <View style={styles.imageInfo}>
                  <Text variant="bodySmall" style={styles.imageSizeText}>
                    {formatFileSize(featuredImage.size)}
                  </Text>
                </View>
              )}
              <View style={styles.featuredImageOverlay}>
                <IconButton
                  icon="pencil"
                  iconColor={Colors.text.inverse}
                  size={20}
                  onPress={() => setFeaturedMenuVisible(true)}
                  style={styles.overlayButton}
                />
                <IconButton
                  icon="delete"
                  iconColor={Colors.text.inverse}
                  size={20}
                  onPress={handleRemoveFeaturedImage}
                  style={styles.overlayButton}
                />
              </View>
              <Menu
                visible={featuredMenuVisible}
                onDismiss={() => setFeaturedMenuVisible(false)}
                anchor={{ x: 0, y: 0 }}
              >
                <Menu.Item
                  onPress={() => handleFeaturedImagePick('camera')}
                  title="Take Photo"
                  leadingIcon="camera"
                />
                <Menu.Item
                  onPress={() => handleFeaturedImagePick('gallery')}
                  title="Choose from Gallery"
                  leadingIcon="image"
                />
              </Menu>
            </View>
          ) : (
            <Menu
              visible={featuredMenuVisible}
              onDismiss={() => setFeaturedMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.uploadPlaceholder}
                  onPress={() => setFeaturedMenuVisible(true)}
                  activeOpacity={0.7}
                >
                  <Icon name="image-plus" size={48} color={Colors.primary.main} />
                  <Text variant="titleMedium" style={styles.uploadPlaceholderText}>
                    Add Featured Image
                  </Text>
                  <Text variant="bodySmall" style={styles.uploadPlaceholderSubtext}>
                    Recommended: {ImageUploadConfig.recommendedFeaturedSize}
                  </Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => handleFeaturedImagePick('camera')}
                title="Take Photo"
                leadingIcon="camera"
              />
              <Menu.Item
                onPress={() => handleFeaturedImagePick('gallery')}
                title="Choose from Gallery"
                leadingIcon="image"
              />
            </Menu>
          )}
        </View>

        {/* Additional Images Section */}
        <View style={styles.subsection}>
          <View style={styles.subsectionHeader}>
            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Additional Images ({totalAdditionalCount}/{ImageUploadConfig.maxAdditionalImages})
            </Text>
            <Text variant="bodySmall" style={styles.subsectionSubtitle}>
              Add up to {ImageUploadConfig.maxAdditionalImages} more images
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.additionalImagesScroll}>
            {/* Existing images */}
            {existingImageUrls.map((imageUrl, index) => (
              <View key={`existing-${index}`} style={styles.additionalImageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.additionalImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveExistingAdditionalImage(index)}
                >
                  <Icon name="close-circle" size={24} color={Colors.secondary.red} />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* New images */}
            {additionalImages.map((image, index) => (
              <View key={`new-${index}`} style={styles.additionalImageContainer}>
                <Image source={{ uri: image.uri }} style={styles.additionalImage} />
                <View style={styles.additionalImageInfo}>
                  <Text variant="bodySmall" style={styles.additionalImageSizeText}>
                    {formatFileSize(image.size)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveAdditionalImage(index)}
                >
                  <Icon name="close-circle" size={24} color={Colors.secondary.red} />
                </TouchableOpacity>
              </View>
            ))}

            {totalAdditionalCount < ImageUploadConfig.maxAdditionalImages && (
              <Menu
                visible={additionalMenuVisible}
                onDismiss={() => setAdditionalMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={() => setAdditionalMenuVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Icon name="plus" size={32} color={Colors.primary.main} />
                    <Text variant="bodySmall" style={styles.addImageText}>
                      Add Image
                    </Text>
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  onPress={() => handleAdditionalImagePick('camera')}
                  title="Take Photo"
                  leadingIcon="camera"
                />
                <Menu.Item
                  onPress={() => handleAdditionalImagePick('gallery')}
                  title="Choose from Gallery"
                  leadingIcon="image"
                />
              </Menu>
            )}
          </ScrollView>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  infoText: {
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  guidelinesContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.main + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  guidelinesText: {
    marginLeft: 8,
    flex: 1,
  },
  guidelineItem: {
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionHeader: {
    marginBottom: 12,
  },
  subsectionTitle: {
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subsectionSubtitle: {
    color: Colors.text.secondary,
  },
  featuredImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: Colors.border.light,
  },
  imageInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageSizeText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  featuredImageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  overlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    margin: 0,
  },
  uploadPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main + '10',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  uploadPlaceholderText: {
    marginTop: 12,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  uploadPlaceholderSubtext: {
    marginTop: 4,
    color: Colors.text.secondary,
  },
  additionalImagesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  additionalImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  additionalImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.border.light,
  },
  additionalImageInfo: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  additionalImageSizeText: {
    color: Colors.text.inverse,
    fontSize: 10,
    fontWeight: '600',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.background.paper,
    borderRadius: 12,
    elevation: 2,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    marginTop: 4,
    color: Colors.primary.main,
    fontWeight: '600',
  },
});
