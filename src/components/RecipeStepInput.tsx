import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Menu, Text, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../theme';
import ImagePickerService, { ImageData } from '../services/imagePicker';

export interface EditableRecipeStep {
  id: string;
  description: string;
  // Local image chosen in the editor (not yet uploaded).
  image?: ImageData | null;
  // Existing remote URL for this step image when editing an existing recipe.
  existingImageUrl?: string;
}

interface RecipeStepInputProps {
  step: EditableRecipeStep;
  index: number;
  onChange: (updated: EditableRecipeStep) => void;
  onRemove: () => void;
}

export default function RecipeStepInput({
  step,
  index,
  onChange,
  onRemove,
}: RecipeStepInputProps) {
  const [imageMenuVisible, setImageMenuVisible] = useState(false);

  const hasImage = !!step.image || !!step.existingImageUrl;
  const imageUri = step.image?.uri || step.existingImageUrl || '';

  const handlePickImage = async (source: 'camera' | 'gallery') => {
    setImageMenuVisible(false);
    const picked =
      source === 'camera'
        ? await ImagePickerService.takePhoto('additional')
        : await ImagePickerService.pickFromGallery('additional');

    if (picked) {
      onChange({
        ...step,
        image: picked,
        existingImageUrl: undefined,
      });
    }
  };

  const handleRemoveImage = () => {
    onChange({
      ...step,
      image: undefined,
      existingImageUrl: undefined,
    });
  };

  const badgeLabel = (index + 1).toString();

  return (
    <Card style={styles.card} elevation={2}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Step {badgeLabel}</Text>
          <Text style={styles.headerSubtitle}>Add an optional image and description</Text>
        </View>

        <View style={styles.headerActions}>
          <IconButton
            icon="delete-outline"
            size={20}
            iconColor={Colors.status?.error || '#C62828'}
            onPress={onRemove}
          />
        </View>
      </View>

      {/* Image preview on top when present */}
      {hasImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.imageOverlay}>
            <IconButton
              icon="pencil"
              size={18}
              style={styles.imageOverlayButton}
              onPress={() => setImageMenuVisible(true)}
            />
            <IconButton
              icon="delete"
              size={18}
              style={styles.imageOverlayButton}
              onPress={handleRemoveImage}
            />
          </View>
          <Menu
            visible={imageMenuVisible}
            onDismiss={() => setImageMenuVisible(false)}
            anchor={{ x: 0, y: 0 }}
          >
            <Menu.Item
              onPress={() => handlePickImage('camera')}
              title="Take Photo"
              leadingIcon="camera"
            />
            <Menu.Item
              onPress={() => handlePickImage('gallery')}
              title="Choose from Gallery"
              leadingIcon="image"
            />
          </Menu>
        </View>
      ) : (
        <Menu
          visible={imageMenuVisible}
          onDismiss={() => setImageMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={() => setImageMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Icon name="image-plus" size={28} color={Colors.primary.main} />
              <Text style={styles.imagePlaceholderText}>Add step image (optional)</Text>
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => handlePickImage('camera')}
            title="Take Photo"
            leadingIcon="camera"
          />
          <Menu.Item
            onPress={() => handlePickImage('gallery')}
            title="Choose from Gallery"
            leadingIcon="image"
          />
        </Menu>
      )}

      {/* Description */}
      <TextInput
        label="Step description"
        value={step.description}
        onChangeText={(text) => onChange({ ...step, description: text })}
        mode="outlined"
        multiline
        style={styles.input}
        placeholder="e.g., Preheat oven to 375°F and lightly grease the baking dish."
      />

      {/* No extra metadata: simplified implementation */}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    backgroundColor: Colors.background?.paper || '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border?.light || '#ECECEC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.border.light,
  },
  imageOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 6,
  },
  imageOverlayButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    margin: 0,
  },
  imagePlaceholder: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main + '10',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  input: {
    marginTop: 12,
  },
});

