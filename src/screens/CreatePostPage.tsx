import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Portal,
  Searchbar,
  Snackbar,
  Text,
  TextInput
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Post, postsApi, Recipe, recipesApi } from '../services/api';
import { Colors } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CreatePostPage() {
  const navigation = useNavigation();
  const route = useRoute();

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
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    loadRecipes();
    if (isEditMode && editPost.recipeId) {
      loadSelectedRecipe(editPost.recipeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, recipes]);

  const loadRecipes = async () => {
    try {
      setLoadingRecipes(true);
      const userRecipes = await recipesApi.getAllRecipes();
      setRecipes(userRecipes);
      setFilteredRecipes(userRecipes);
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

  const filterRecipes = () => {
    if (!searchQuery.trim()) {
      setFilteredRecipes(recipes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = recipes.filter(
      recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.category.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query),
    );
    setFilteredRecipes(filtered);
  };

  const handleOpenRecipeSelector = () => {
    setDrawerVisible(true);
  };

  const handleCloseRecipeSelector = () => {
    setDrawerVisible(false);
    setSearchQuery('');
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    handleCloseRecipeSelector();
  };

  const handleRemoveRecipe = () => {
    setSelectedRecipe(null);
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
        recipeId: selectedRecipe?._id,
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

  const getRecipeIcon = (category: string) => {
    const icons: Record<string, string> = {
      breakfast: 'coffee',
      lunch: 'bowl-mix',
      dinner: 'food-drumstick',
      dessert: 'cake',
      drinks: 'bottle-soda',
      vegetarian: 'leaf',
      snacks: 'food-apple',
    };
    return icons[category.toLowerCase()] || 'food';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                {isEditMode ? 'Edit Post' : 'Create Post'}
              </Text>

              <TextInput
                label="What's on your mind?"
                value={content}
                onChangeText={setContent}
                mode="outlined"
                style={styles.input}
                placeholder="Share your cooking journey..."
                multiline
                numberOfLines={6}
                outlineColor={Colors.border.main}
                activeOutlineColor={Colors.primary.main}
              />
              
              <Text variant="titleMedium" style={styles.label}>
                Link a Recipe (Optional)
              </Text>

              {selectedRecipe ? (
                <Card style={styles.selectedRecipeCard}>
                  <Card.Content style={styles.selectedRecipeContent}>
                    {selectedRecipe.imageUrl ? (
                      <Image
                        source={{ uri: selectedRecipe.imageUrl }}
                        style={styles.selectedRecipeImage}
                      />
                    ) : (
                      <View style={styles.selectedRecipePlaceholder}>
                        <Icon
                          name={getRecipeIcon(selectedRecipe.category)}
                          size={32}
                          color={Colors.primary.main}
                        />
                      </View>
                    )}
                    <View style={styles.selectedRecipeInfo}>
                      <Text variant="titleMedium" style={styles.selectedRecipeTitle}>
                        {selectedRecipe.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.selectedRecipeCategory}>
                        {selectedRecipe.category} • {selectedRecipe.prepTime + selectedRecipe.cookTime} mins
                      </Text>
                    </View>
                    <IconButton
                      icon="close-circle"
                      size={24}
                      iconColor={Colors.text.secondary}
                      onPress={handleRemoveRecipe}
                    />
                  </Card.Content>
                </Card>
              ) : (
                <Button
                  mode="outlined"
                  onPress={handleOpenRecipeSelector}
                  icon="book-open-page-variant"
                  style={styles.selectButton}
                  textColor={Colors.primary.main}
                  disabled={loadingRecipes}
                >
                  {loadingRecipes ? 'Loading recipes...' : 'Select Recipe'}
                </Button>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomButtonsContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          loading={loading}
          disabled={loading}
          buttonColor={Colors.primary.main}
        >
          {loading ? (isEditMode ? 'Updating...' : 'Posting...') : isEditMode ? 'Update Post' : 'Post'}
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={loading}
          textColor={Colors.text.secondary}
        >
          Cancel
        </Button>
      </View>

      {/* Bottom Drawer using Portal and Modal */}
      <Portal>
        <Modal
          visible={drawerVisible}
          onRequestClose={handleCloseRecipeSelector}
          transparent
          animationType="slide"
        >
          <View style={styles.drawerOverlay}>
            <TouchableOpacity
              style={styles.drawerBackdrop}
              activeOpacity={1}
              onPress={handleCloseRecipeSelector}
            />
            <View style={styles.drawerContainer}>
              {/* Drawer Handle */}
              <View style={styles.drawerHandle} />

              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <Text variant="headlineSmall" style={styles.drawerTitle}>
                  Select Recipe
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleCloseRecipeSelector}
                  iconColor={Colors.text.primary}
                />
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Searchbar
                  placeholder="Search recipes..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={styles.searchBar}
                  iconColor={Colors.primary.main}
                  inputStyle={styles.searchInput}
                />
              </View>

              {/* Recipe List */}
              <ScrollView style={styles.recipeList} showsVerticalScrollIndicator={false}>
                {loadingRecipes ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.main} />
                    <Text style={styles.loadingText}>Loading recipes...</Text>
                  </View>
                ) : filteredRecipes.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="food-off" size={64} color={Colors.text.disabled} />
                    <Text variant="titleMedium" style={styles.emptyTitle}>
                      {searchQuery ? 'No recipes found' : 'No recipes available'}
                    </Text>
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      {searchQuery
                        ? 'Try a different search term'
                        : 'Create a recipe to link it to your post'}
                    </Text>
                  </View>
                ) : (
                  filteredRecipes.map(recipe => (
                    <TouchableOpacity
                      key={recipe._id}
                      onPress={() => handleSelectRecipe(recipe)}
                      style={styles.recipeItem}
                      activeOpacity={0.7}
                    >
                      <Card style={styles.recipeCard}>
                        <Card.Content style={styles.recipeCardContent}>
                          {recipe.imageUrl ? (
                            <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
                          ) : (
                            <View style={styles.recipePlaceholder}>
                              <Icon
                                name={getRecipeIcon(recipe.category)}
                                size={28}
                                color={Colors.primary.main}
                              />
                            </View>
                          )}
                          <View style={styles.recipeInfo}>
                            <Text variant="titleMedium" style={styles.recipeTitle} numberOfLines={1}>
                              {recipe.title}
                            </Text>
                            <Text variant="bodySmall" style={styles.recipeCategory}>
                              {recipe.category}
                            </Text>
                            <View style={styles.recipeMeta}>
                              <Chip
                                icon="clock-outline"
                                style={styles.recipeChip}
                                textStyle={styles.recipeChipText}
                              >
                                {recipe.prepTime + recipe.cookTime} min
                              </Chip>
                              <Chip
                                icon="silverware-fork-knife"
                                style={styles.recipeChip}
                                textStyle={styles.recipeChipText}
                              >
                                {recipe.servings} servings
                              </Chip>
                            </View>
                          </View>
                          <Icon name="chevron-right" size={24} color={Colors.text.secondary} />
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Portal>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Add padding so content doesn't get hidden behind buttons
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text.primary,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.background.paper,
  },
  label: {
    marginBottom: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  selectedRecipeCard: {
    marginBottom: 16,
    elevation: 1,
    backgroundColor: Colors.background.default,
  },
  selectedRecipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectedRecipeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedRecipePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedRecipeInfo: {
    flex: 1,
  },
  selectedRecipeTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  selectedRecipeCategory: {
    color: Colors.text.secondary,
  },
  selectButton: {
    marginBottom: 16,
    borderColor: Colors.primary.main,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.paper,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButton: {
    marginBottom: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    marginBottom: 0,
  },
  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: Colors.background.paper,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border.main,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  drawerTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: Colors.background.default,
  },
  searchInput: {
    fontSize: 16,
  },
  recipeList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  emptyText: {
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  recipeItem: {
    marginBottom: 12,
  },
  recipeCard: {
    elevation: 1,
  },
  recipeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recipeImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  recipePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  recipeCategory: {
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  recipeChip: {
    height: 28,
    backgroundColor: Colors.background.default,
  },
  recipeChipText: {
    fontSize: 11,
  },
});
