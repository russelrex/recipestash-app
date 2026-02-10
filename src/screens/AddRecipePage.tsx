import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Checkbox,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageUploadSection from '../components/ImageUploadSection';
import { authApi, CreateRecipeData, recipesApi, UpdateRecipeData } from '../services/api';
import type { ImageData } from '../services/imagePicker';
import { imageUploadService } from '../services/imageUploadService';
import { Colors } from '../theme';

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
  const route = useRoute();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = route.params as any;
  
  const recipeId = params?.recipeId;
  const isEditMode = !!recipeId;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('breakfast');
  const [difficulty, setDifficulty] = useState('easy');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [featured, setFeatured] = useState(false);

  // Image state
  const [featuredImage, setFeaturedImage] = useState<ImageData | null>(null);
  const [additionalImages, setAdditionalImages] = useState<ImageData[]>([]);
  const [existingFeaturedUrl, setExistingFeaturedUrl] = useState<string>('');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  // Ingredients state
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [currentIngredient, setCurrentIngredient] = useState('');

  // Instructions state
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [currentInstruction, setCurrentInstruction] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) {
      loadRecipe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      setLoadingRecipe(true);
      const recipe = await recipesApi.getRecipe(recipeId!);

      setTitle(recipe.title);
      setDescription(recipe.description);
      setCategory(recipe.category);
      setDifficulty(recipe.difficulty);
      setPrepTime(recipe.prepTime.toString());
      setCookTime(recipe.cookTime.toString());
      setServings(recipe.servings.toString());
      setFeatured(recipe.featured || false);
      setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : ['']);
      setInstructions(recipe.instructions.length > 0 ? recipe.instructions : ['']);

      if (recipe.featuredImage) {
        setExistingFeaturedUrl(recipe.featuredImage);
      }
      if (recipe.images && recipe.images.length > 0) {
        setExistingImageUrls(recipe.images);
      }
    } catch (error: any) {
      console.error('Error loading recipe:', error);
      setSnackbarType('error');
      setSnackbarMessage(error.message || 'Failed to load recipe');
      setSnackbarVisible(true);
      setTimeout(() => navigation.goBack(), 2000);
    } finally {
      setLoadingRecipe(false);
    }
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!prepTime || parseInt(prepTime) <= 0) {
      newErrors.prepTime = 'Valid prep time required';
    }

    if (!cookTime || parseInt(cookTime) <= 0) {
      newErrors.cookTime = 'Valid cook time required';
    }

    if (!servings || parseInt(servings) <= 0) {
      newErrors.servings = 'Valid servings required';
    }
    
    const validIngredients = ingredients.filter(i => i.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient required';
    }
    
    const validInstructions = instructions.filter(i => i.trim());
    if (validInstructions.length === 0) {
      newErrors.instructions = 'At least one instruction required';
    }

    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      // Log which fields failed for easier debugging
      console.log('Validation errors:', newErrors);

      // Surface the first error in the snackbar so it's obvious what to fix
      const firstErrorKey = errorKeys[0];
      const firstErrorMessage = newErrors[firstErrorKey];
      setSnackbarType('error');
      setSnackbarMessage(firstErrorMessage);
      setSnackbarVisible(true);

      return false;
    }

    return true;
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
    console.log('handleSubmit pressed, isEditMode:', isEditMode);

    if (!validateForm()) {
      console.log('Validation failed, not submitting');
      return;
    }

    // Call submit directly for both create and update to avoid any Alert callback issues
    await performSubmit();
  };

  const performSubmit = async () => {
    console.log('Performing submit');
    setLoading(true);

    try {
      const validIngredients = ingredients.filter(i => i.trim());
      const validInstructions = instructions.filter(i => i.trim());

      // Get auth token for image uploads
      const authToken = await authApi.getAuthToken();
      if (!authToken || authToken === 'null' || authToken === 'offline') {
        throw new Error('Authentication required. Please log in again.');
      }

      // Upload new featured image if selected
      let featuredImageData: string | undefined = undefined;
      if (featuredImage) {
        console.log('Uploading featured image...');
        const uploadResult = await imageUploadService.uploadRecipeImage(featuredImage.uri, authToken);
        featuredImageData = uploadResult.url;
        console.log('Featured image uploaded:', featuredImageData);
      } else if (existingFeaturedUrl && existingFeaturedUrl.trim()) {
        featuredImageData = existingFeaturedUrl;
      }

      // Upload new additional images
      const uploadedAdditionalImages: string[] = [];
      for (const img of additionalImages) {
        console.log('Uploading additional image...');
        const uploadResult = await imageUploadService.uploadRecipeImage(img.uri, authToken);
        uploadedAdditionalImages.push(uploadResult.url);
        console.log('Additional image uploaded:', uploadResult.url);
      }

      // Prepare additional images (existing URLs + newly uploaded)
      const additionalImagesData = [
        ...existingImageUrls.filter(url => url && url.trim()),
        ...uploadedAdditionalImages,
      ].slice(0, 5); // Max 5 images

      if (isEditMode) {
        const recipeData: UpdateRecipeData = {
          title: title.trim(),
          description: description.trim(),
          ingredients: validIngredients,
          instructions: validInstructions,
          category,
          prepTime: parseInt(prepTime),
          cookTime: parseInt(cookTime),
          servings: parseInt(servings),
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          featured,
        };

        // Only include image fields if they have values
        if (featuredImageData) {
          recipeData.featuredImage = featuredImageData;
        }
        if (additionalImagesData.length > 0) {
          recipeData.images = additionalImagesData;
        }

        console.log('Updating recipe with data:', {
          recipeId,
          recipeData: {
            ...recipeData,
            featuredImage: featuredImageData ? `${featuredImageData.substring(0, 50)}...` : undefined,
            images: additionalImagesData.length,
          },
        });

        await recipesApi.updateRecipe(recipeId!, recipeData);
        setSnackbarType('success');
        setSnackbarMessage('Recipe updated successfully! ✨');
      } else {
        // Get current user info for ownerId and ownerName
        const userId = await authApi.getCurrentUserId();
        const userName = await authApi.getCurrentUserName();

        if (!userId || !userName) {
          throw new Error('User information not found. Please log in again.');
        }

        const recipeData: CreateRecipeData = {
          title: title.trim(),
          description: description.trim(),
          category,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          prepTime: parseInt(prepTime),
          cookTime: parseInt(cookTime),
          servings: parseInt(servings),
          ingredients: validIngredients,
          instructions: validInstructions,
          ownerId: userId,
          ownerName: userName,
          featured,
        };

        // Only include image fields if they have values
        if (featuredImageData) {
          recipeData.featuredImage = featuredImageData;
        }
        if (additionalImagesData.length > 0) {
          recipeData.images = additionalImagesData;
        }

        await recipesApi.createRecipe(recipeData);
        setSnackbarType('success');
        setSnackbarMessage('Recipe created successfully! 🎉');
      }

      setSnackbarVisible(true);

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setSnackbarType('error');
      setSnackbarMessage(error.message || 'Failed to save recipe');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  if (loadingRecipe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>
          {isEditMode ? 'Loading recipe...' : 'Please wait...'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ImageBackground
          source={require('../../assets/images/placeholder_bg.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
        <View style={styles.overlay}>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 80 }
            ]}
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
              {isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              {isEditMode ? 'Update your recipe details' : 'Fill in the details to add your favorite recipe'}
            </Text>
          </View>

          {/* Image Upload Section */}
          <ImageUploadSection
            featuredImage={featuredImage}
            additionalImages={additionalImages}
            onFeaturedImageChange={setFeaturedImage}
            onAdditionalImagesChange={setAdditionalImages}
            existingFeaturedUrl={existingFeaturedUrl}
            existingImageUrls={existingImageUrls}
            onExistingFeaturedUrlChange={setExistingFeaturedUrl}
            onExistingImageUrlsChange={setExistingImageUrls}
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
                  onChangeText={(text) => {
                    // Only allow numeric input
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setPrepTime(numericValue);
                  }}
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
                  onChangeText={(text) => {
                    // Only allow numeric input
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setCookTime(numericValue);
                  }}
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
              onChangeText={(text) => {
                // Only allow numeric input
                const numericValue = text.replace(/[^0-9]/g, '');
                setServings(numericValue);
              }}
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

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={featured ? 'checked' : 'unchecked'}
                onPress={() => setFeatured(!featured)}
                color={Colors.primary.main}
              />
              <TouchableOpacity
                style={styles.checkboxLabel}
                onPress={() => setFeatured(!featured)}
                activeOpacity={0.7}
              >
                <Text variant="bodyLarge" style={styles.checkboxText}>
                  Set as featured recipe
                </Text>
                <Text variant="bodySmall" style={styles.checkboxHint}>
                  Featured recipes appear on your profile (max 3)
                </Text>
              </TouchableOpacity>
            </View>
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
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Recipe'
                : 'Create Recipe'}
            </Button>

            <Button
              mode="outlined"
              onPress={handleCancel}
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
          style={[
            styles.snackbar,
            snackbarType === 'success' && styles.snackbarSuccess,
            snackbarType === 'error' && styles.snackbarError,
          ]}
        >
          {snackbarMessage}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.default,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.text.secondary,
  },
  background: {
    flex: 1,
    width: '100%',
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
  snackbar: {
    backgroundColor: Colors.status.info,
  },
  snackbarSuccess: {
    backgroundColor: Colors.status.success,
  },
  snackbarError: {
    backgroundColor: Colors.status.error,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingVertical: 8,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
  },
  checkboxText: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  checkboxHint: {
    color: Colors.text.secondary,
    marginTop: 4,
  },
});
