import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Chip,
  Divider,
  HelperText,
  IconButton,
  SegmentedButtons,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import ImageUploadSection from '../components/ImageUploadSection';
import { ImageUploadConfig } from '../config/imageUpload.config';
import { authApi, CreateRecipeData, recipesApi } from '../services/api';
import type { ImageData } from '../services/imagePicker';
import { Colors } from '../theme';

const { height } = Dimensions.get('window');

const CATEGORIES = [
  { label: 'Breakfast', value: 'breakfast', icon: 'coffee' },
  { label: 'Lunch', value: 'lunch', icon: 'bowl-mix' },
  { label: 'Dinner', value: 'dinner', icon: 'food-drumstick' },
  { label: 'Dessert', value: 'dessert', icon: 'cake' },
  { label: 'Drinks', value: 'drinks', icon: 'bottle-soda' },
  { label: 'Snacks', value: 'snacks', icon: 'food-apple' },
];

export default function AddRecipePage() {
  const navigation = useNavigation();
  const theme = useTheme();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('breakfast');
  const [difficulty, setDifficulty] = useState('easy');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');

  // Image state
  const [featuredImage, setFeaturedImage] = useState<ImageData | null>(null);
  const [additionalImages, setAdditionalImages] = useState<ImageData[]>([]);

  // Ingredients state
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [currentIngredient, setCurrentIngredient] = useState('');

  // Instructions state
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [currentInstruction, setCurrentInstruction] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const buildOwnerInfo = async () => {
    const storedUserId = await authApi.getCurrentUserId();
    const storedId = await authApi.getCurrentUserId();
    const storedName = await authApi.getCurrentUserName();

    if (!storedId || !storedUserId) {
      throw new Error('Missing owner id. Please log in again.');
    }

    return {
      userId: storedUserId,
      ownerId: storedId,
      ownerName: storedName || 'You',
    };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!prepTime || parseInt(prepTime) <= 0) newErrors.prepTime = 'Valid prep time required';
    if (!cookTime || parseInt(cookTime) <= 0) newErrors.cookTime = 'Valid cook time required';
    if (!servings || parseInt(servings) <= 0) newErrors.servings = 'Valid servings required';
    
    const validIngredients = ingredients.filter(i => i.trim());
    if (validIngredients.length === 0) newErrors.ingredients = 'At least one ingredient required';
    
    const validInstructions = instructions.filter(i => i.trim());
    if (validInstructions.length === 0) newErrors.instructions = 'At least one instruction required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddInstruction = () => {
    if (currentInstruction.trim()) {
      setInstructions([...instructions, currentInstruction.trim()]);
      setCurrentInstruction('');
    }
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);

    try {
      const { userId, ownerId, ownerName } = await buildOwnerInfo();
      const validIngredients = ingredients.filter(i => i.trim());
      const validInstructions = instructions.filter(i => i.trim());

      // Prepare featured image (base64 or undefined)
      const featuredImageData = featuredImage ? featuredImage.base64 : undefined;

      // Prepare additional images (base64 array)
      const additionalImagesData = additionalImages
        .slice(0, ImageUploadConfig.maxAdditionalImages)
        .map(img => img.base64);

      const recipeData: CreateRecipeData = {
        userId,
        ownerId,
        ownerName,
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        prepTime: parseInt(prepTime),
        cookTime: parseInt(cookTime),
        servings: parseInt(servings),
        ingredients: validIngredients,
        instructions: validInstructions,
        featuredImage: featuredImageData,
        images: additionalImagesData,
        isFavorite: false,
      };

      await recipesApi.createRecipe(recipeData);

      setSnackbarMessage('Recipe created successfully! 🎉');
      setSnackbarVisible(true);

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      setSnackbarMessage(
        error.message === 'Missing owner id. Please log in again.'
          ? 'Your session seems to have expired. Please log in again before creating a recipe.'
          : error.message || 'Failed to create recipe',
      );
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ImageBackground
        source={require('../../assets/images/addrecipe_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Avatar.Icon 
              icon="chef-hat" 
              size={56} 
              style={[styles.headerIcon, { backgroundColor: theme.colors.primary }]} 
            />
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Create New Recipe
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Fill in the details to add your favorite recipe
            </Text>
          </View>

          {/* Image Upload Section */}
          <ImageUploadSection
            featuredImage={featuredImage}
            additionalImages={additionalImages}
            onFeaturedImageChange={setFeaturedImage}
            onAdditionalImagesChange={setAdditionalImages}
          />

          {/* Title Section */}
          <Surface style={styles.surface} elevation={2}>
            <View style={styles.sectionHeader}>
              <Avatar.Icon icon="information" size={32} style={styles.sectionIcon} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Basic Information
              </Text>
            </View>
            <Divider style={styles.divider} />

            <TextInput
              label="Recipe Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Spaghetti Carbonara"
              error={!!errors.title}
              left={<TextInput.Icon icon="format-title" />}
              contentStyle={styles.inputContent}
            />
            {errors.title ? (
              <HelperText type="error" visible={true}>
                {errors.title}
              </HelperText>
            ) : null}

            <TextInput
              label="Description *"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={styles.input}
              placeholder="Brief description of your recipe"
              multiline
              numberOfLines={3}
              error={!!errors.description}
              left={<TextInput.Icon icon="text" />}
              contentStyle={styles.inputContent}
            />
            {errors.description ? (
              <HelperText type="error" visible={true}>
                {errors.description}
              </HelperText>
            ) : null}
          </Surface>

          {/* Category Section */}
          <Surface style={styles.surface} elevation={2}>
            <View style={styles.sectionHeader}>
              <Avatar.Icon icon="tag-multiple" size={32} style={styles.sectionIcon} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Category *
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.chipContainer}>
              {CATEGORIES.map(cat => {
                const isSelected = category === cat.value;
                return (
                  <Chip
                    key={cat.value}
                    mode={isSelected ? 'flat' : 'outlined'}
                    selected={isSelected}
                    onPress={() => setCategory(cat.value)}
                    style={[
                      styles.chip,
                      isSelected && { backgroundColor: theme.colors.primary },
                    ]}
                    icon={cat.icon}
                    textStyle={{
                      color: isSelected ? theme.colors.onPrimary : '#37474F',
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {cat.label}
                  </Chip>
                );
              })}
            </View>
          </Surface>

          {/* Difficulty & Time Section */}
          <Surface style={styles.surface} elevation={2}>
            <View style={styles.sectionHeader}>
              <Avatar.Icon icon="timer" size={32} style={styles.sectionIcon} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Cooking Details *
              </Text>
            </View>
            <Divider style={styles.divider} />

            <Text variant="bodyLarge" style={styles.subsectionTitle}>
              Difficulty Level
            </Text>
            <SegmentedButtons
              value={difficulty}
              onValueChange={setDifficulty}
              buttons={[
                { value: 'easy', label: 'Easy', icon: 'emoticon-happy' },
                { value: 'medium', label: 'Medium', icon: 'emoticon-neutral' },
                { value: 'hard', label: 'Hard', icon: 'fire' },
              ]}
              style={styles.segmented}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <TextInput
                  label="Prep Time (min) *"
                  value={prepTime}
                  onChangeText={setPrepTime}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="15"
                  error={!!errors.prepTime}
                  left={<TextInput.Icon icon="clock-outline" />}
                  contentStyle={styles.inputContent}
                />
                {errors.prepTime ? (
                  <HelperText type="error" visible={true}>
                    {errors.prepTime}
                  </HelperText>
                ) : null}
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  label="Cook Time (min) *"
                  value={cookTime}
                  onChangeText={setCookTime}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="30"
                  error={!!errors.cookTime}
                  left={<TextInput.Icon icon="timer-outline" />}
                  contentStyle={styles.inputContent}
                />
                {errors.cookTime ? (
                  <HelperText type="error" visible={true}>
                    {errors.cookTime}
                  </HelperText>
                ) : null}
              </View>
            </View>

            <TextInput
              label="Servings *"
              value={servings}
              onChangeText={setServings}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              placeholder="4"
              error={!!errors.servings}
              left={<TextInput.Icon icon="account-group" />}
              contentStyle={styles.inputContent}
            />
            {errors.servings ? (
              <HelperText type="error" visible={true}>
                {errors.servings}
              </HelperText>
            ) : null}
          </Surface>

          {/* Ingredients Section */}
          <Surface style={styles.surface} elevation={2}>
            <View style={styles.sectionHeader}>
              <Avatar.Icon icon="food-apple" size={32} style={styles.sectionIcon} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Ingredients *
              </Text>
            </View>
            <Divider style={styles.divider} />

            <Surface style={styles.addItemSurface} elevation={1}>
              <View style={styles.addItemRow}>
                <TextInput
                  label="Add Ingredient"
                  value={currentIngredient}
                  onChangeText={setCurrentIngredient}
                  mode="outlined"
                  style={styles.addItemInput}
                  placeholder="e.g., 2 cups flour"
                  onSubmitEditing={handleAddIngredient}
                  left={<TextInput.Icon icon="plus-circle-outline" />}
                  contentStyle={styles.inputContent}
                />
                <IconButton
                  icon="plus-circle"
                  size={36}
                  iconColor={theme.colors.primary}
                  onPress={handleAddIngredient}
                  style={styles.addButton}
                />
              </View>
            </Surface>

            {errors.ingredients ? (
              <HelperText type="error" visible={true} style={styles.helperText}>
                {errors.ingredients}
              </HelperText>
            ) : null}

            <View style={styles.listContainer}>
              {ingredients.map((ingredient, index) => 
                ingredient.trim() ? (
                  <Surface key={index} style={styles.listItemSurface} elevation={1}>
                    <View style={styles.listItem}>
                      <Avatar.Text 
                        size={28} 
                        label={(index + 1).toString()} 
                        style={[styles.listNumberAvatar, { backgroundColor: theme.colors.primary }]}
                        labelStyle={styles.listNumberText}
                      />
                      <Text style={styles.listText}>{ingredient}</Text>
                      <IconButton
                        icon="close-circle"
                        size={24}
                        iconColor={theme.colors.error}
                        onPress={() => handleRemoveIngredient(index)}
                        style={styles.removeButton}
                      />
                    </View>
                  </Surface>
                ) : null
              )}
            </View>
          </Surface>

          {/* Instructions Section */}
          <Surface style={styles.surface} elevation={2}>
            <View style={styles.sectionHeader}>
              <Avatar.Icon icon="format-list-numbered" size={32} style={styles.sectionIcon} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Instructions *
              </Text>
            </View>
            <Divider style={styles.divider} />

            <Surface style={styles.addItemSurface} elevation={1}>
              <View style={styles.addItemRow}>
                <TextInput
                  label="Add Step"
                  value={currentInstruction}
                  onChangeText={setCurrentInstruction}
                  mode="outlined"
                  style={styles.addItemInput}
                  placeholder="e.g., Preheat oven to 350°F"
                  multiline
                  onSubmitEditing={handleAddInstruction}
                  left={<TextInput.Icon icon="plus-circle-outline" />}
                  contentStyle={styles.inputContent}
                />
                <IconButton
                  icon="plus-circle"
                  size={36}
                  iconColor={theme.colors.primary}
                  onPress={handleAddInstruction}
                  style={styles.addButton}
                />
              </View>
            </Surface>

            {errors.instructions ? (
              <HelperText type="error" visible={true} style={styles.helperText}>
                {errors.instructions}
              </HelperText>
            ) : null}

            <View style={styles.listContainer}>
              {instructions.map((instruction, index) => 
                instruction.trim() ? (
                  <Surface key={index} style={styles.listItemSurface} elevation={1}>
                    <View style={styles.listItem}>
                      <Avatar.Text 
                        size={28} 
                        label={(index + 1).toString()} 
                        style={[styles.listNumberAvatar, { backgroundColor: theme.colors.secondary }]}
                        labelStyle={styles.listNumberText}
                      />
                      <Text style={styles.listText}>{instruction}</Text>
                      <IconButton
                        icon="close-circle"
                        size={24}
                        iconColor={theme.colors.error}
                        onPress={() => handleRemoveInstruction(index)}
                        style={styles.removeButton}
                      />
                    </View>
                  </Surface>
                ) : null
              )}
            </View>
          </Surface>

          {/* Submit Button */}
          <Surface style={styles.buttonSurface} elevation={0}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              labelStyle={styles.submitButtonLabel}
              icon="check-circle"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Creating Recipe...' : 'Create Recipe'}
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              contentStyle={styles.cancelButtonContent}
              icon="close-circle"
              disabled={loading}
            >
              Cancel
            </Button>
          </Surface>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: '100%',
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerIcon: {
    marginBottom: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: Colors.secondary.main,
  },
  headerSubtitle: {
    textAlign: 'center',
    color: Colors.text.primary,
    fontWeight: '500',
    fontSize: 15,
  },
  surface: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    backgroundColor: Colors.border.light,
    marginRight: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    flex: 1,
    color: Colors.text.primary,
    fontSize: 20,
  },
  subsectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
    color: Colors.text.primary,
    fontSize: 16,
  },
  divider: {
    marginBottom: 16,
    marginTop: 4,
  },
  input: {
    marginBottom: 4,
  },
  inputContent: {
    minHeight: 56,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  halfInput: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 20,
  },
  addItemSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemInput: {
    flex: 1,
    marginRight: 4,
  },
  addButton: {
    margin: 0,
  },
  helperText: {
    marginTop: -8,
    marginBottom: 8,
  },
  listContainer: {
    marginTop: 8,
  },
  listItemSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    marginBottom: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
  },
  listNumberAvatar: {
    marginRight: 12,
  },
  listNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listText: {
    flex: 1,
    lineHeight: 22,
    fontSize: 15,
    paddingTop: 4,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  removeButton: {
    margin: 0,
    marginLeft: 4,
  },
  buttonSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  submitButton: {
    marginBottom: 12,
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 12,
  },
  cancelButtonContent: {
    paddingVertical: 6,
  },
});
