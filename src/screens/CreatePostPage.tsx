import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Dimensions } from 'react-native';
import {
  TextInput,
  Button,
  Surface,
  Text,
  Chip,
  useTheme,
  Snackbar,
  Menu,
  IconButton,
  Avatar,
  Divider,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postsApi, recipesApi, Post, Recipe } from '../services/api';

const { height } = Dimensions.get('window');

export default function CreatePostPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  // Edit mode
  const editPost = (route.params as any)?.post as Post | undefined;
  const isEditMode = !!editPost;

  // Form state
  const [content, setContent] = useState(editPost?.content || '');
  const [imageUrl, setImageUrl] = useState(editPost?.imageUrl || '');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Recipe selection
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeMenuVisible, setRecipeMenuVisible] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    loadRecipes();
    if (isEditMode && editPost.recipeId) {
      loadSelectedRecipe(editPost.recipeId);
    }
  }, []);

  const loadRecipes = async () => {
    try {
      setLoadingRecipes(true);
      const userRecipes = await recipesApi.getAllRecipes();
      setRecipes(userRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const loadSelectedRecipe = async (recipeId: string) => {
    try {
      const recipe = await recipesApi.getRecipe(recipeId);
      setSelectedRecipe(recipe);
    } catch (error) {
      console.error('Error loading recipe:', error);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setSnackbarMessage('Please write something to post');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);

    try {
      const postData = {
        content: content.trim(),
        recipeId: selectedRecipe?.id,
        imageUrl: imageUrl.trim() || undefined,
      };

      if (isEditMode) {
        await postsApi.updatePost(editPost.id, postData);
        setSnackbarMessage('Post updated successfully! ✨');
      } else {
        await postsApi.createPost(postData);
        setSnackbarMessage('Post created successfully! 🎉');
      }

      setSnackbarVisible(true);

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving post:', error);
      setSnackbarMessage(error.message || 'Failed to save post');
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Surface style={styles.surface} elevation={2}>
                <View style={styles.sectionHeader}>
                  <Avatar.Icon icon="pencil" size={32} style={styles.sectionIcon} />
                  <Text variant="titleLarge" style={styles.sectionTitle}>
                    {isEditMode ? 'Edit Post' : 'Create Post'}
                  </Text>
                </View>
                <Divider style={styles.divider} />

                <TextInput
                  label="What's on your mind?"
                  value={content}
                  onChangeText={setContent}
                  mode="outlined"
                  style={styles.input}
                  placeholder="Share your cooking experience..."
                  multiline
                  numberOfLines={6}
                  left={<TextInput.Icon icon="text" />}
                  contentStyle={styles.inputContent}
                />

                <TextInput
                  label="Image URL (Optional)"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  mode="outlined"
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  left={<TextInput.Icon icon="image" />}
                  contentStyle={styles.inputContent}
                />

                <Text variant="bodyLarge" style={styles.label}>
                  Link a Recipe (Optional)
                </Text>

                {selectedRecipe ? (
                  <View style={styles.selectedRecipeContainer}>
                    <Chip
                      icon="book-open-page-variant"
                      onClose={() => setSelectedRecipe(null)}
                      style={styles.selectedRecipeChip}
                    >
                      {selectedRecipe.title}
                    </Chip>
                  </View>
                ) : (
                  <Menu
                    visible={recipeMenuVisible}
                    onDismiss={() => setRecipeMenuVisible(false)}
                    anchor={
                      <Button
                        mode="outlined"
                        onPress={() => setRecipeMenuVisible(true)}
                        icon="book-open-page-variant"
                        loading={loadingRecipes}
                        style={styles.selectButton}
                      >
                        Select Recipe
                      </Button>
                    }
                    contentStyle={styles.menuContent}
                  >
                    {recipes.length === 0 ? (
                      <Menu.Item title="No recipes available" disabled />
                    ) : (
                      recipes.map(recipe => (
                        <Menu.Item
                          key={recipe.id}
                          onPress={() => {
                            setSelectedRecipe(recipe);
                            setRecipeMenuVisible(false);
                          }}
                          title={recipe.title}
                        />
                      ))
                    )}
                  </Menu>
                )}
              </Surface>

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
                      : 'Posting...'
                    : isEditMode
                    ? 'Update Post'
                    : 'Post'}
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
    backgroundColor: '#E8F5E9',
    marginRight: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    flex: 1,
    color: '#37474F',
    fontSize: 20,
  },
  divider: {
    marginBottom: 16,
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
  },
  inputContent: {
    minHeight: 56,
  },
  label: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#37474F',
  },
  selectedRecipeContainer: {
    marginBottom: 16,
  },
  selectedRecipeChip: {
    alignSelf: 'flex-start',
  },
  selectButton: {
    marginBottom: 16,
  },
  menuContent: {
    maxHeight: 300,
  },
  buttonSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
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
