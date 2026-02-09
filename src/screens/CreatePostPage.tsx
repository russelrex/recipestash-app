import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Post, postsApi, Recipe, recipesApi } from '../services/api';
import { Colors } from '../theme';

const MAX_POST_LENGTH = 500;

export default function CreatePostPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

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
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  
  // Refs for cursor position tracking
  const textInputRef = useRef<any>(null);
  const cursorPosition = useRef(0);

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

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    // Insert emoji at cursor position
    const before = content.substring(0, cursorPosition.current);
    const after = content.substring(cursorPosition.current);
    const newContent = before + emoji + after;
    
    // Check if adding emoji would exceed max length
    if (newContent.length > MAX_POST_LENGTH) {
      setSnackbarMessage(`Post must be ${MAX_POST_LENGTH} characters or less`);
      setSnackbarVisible(true);
      return;
    }
    
    setContent(newContent);
    
    // Update cursor position (after inserted emoji)
    cursorPosition.current = before.length + emoji.length;
    
    // Focus back on TextInput
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  };

  // Track cursor position when selection changes
  const handleSelectionChange = (event: any) => {
    cursorPosition.current = event.nativeEvent.selection?.start || content.length;
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setSnackbarType('error');
      setSnackbarMessage('Please write something to post');
      setSnackbarVisible(true);
      return;
    }

    if (content.length > MAX_POST_LENGTH) {
      setSnackbarType('error');
      setSnackbarMessage(`Post must be ${MAX_POST_LENGTH} characters or less`);
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
        setSnackbarType('success');
        setSnackbarMessage('Post updated successfully! ✨');
      } else {
        await postsApi.createPost(postData);
        setSnackbarType('success');
        setSnackbarMessage('Post created successfully! 🎉');
      }

      setSnackbarVisible(true);

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving post:', error);
      setSnackbarType('error');
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

  const bgImage = require('../../assets/images/placeholder_bg.jpg');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* SINGLE CARD CONTAINER - NO NESTING */}
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={textInputRef}
                  label="What's on your mind?"
                  value={content}
                  onChangeText={setContent}
                  onSelectionChange={handleSelectionChange}
                  mode="outlined"
                  style={styles.input}
                  placeholder="Share your cooking journey..."
                  multiline
                  numberOfLines={6}
                  maxLength={MAX_POST_LENGTH}
                  outlineColor={Colors.border.main}
                  activeOutlineColor={Colors.primary.main}
                />
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => setEmojiPickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Icon name="emoticon-happy-outline" size={28} color={Colors.primary.main} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.characterCounter}>
              <Text 
                variant="bodySmall" 
                style={[
                  styles.characterCounterText,
                  content.length > MAX_POST_LENGTH * 0.9 && styles.characterCounterWarning
                ]}
              >
                {content.length} / {MAX_POST_LENGTH} characters
              </Text>
            </View>
            
            <Text variant="titleMedium" style={styles.label}>
              Link a Recipe (Optional)
            </Text>

            {selectedRecipe ? (
              <View style={styles.selectedRecipeContainer}>
                {selectedRecipe.featuredImage || selectedRecipe.imageUrl ? (
                  <Image
                    source={{ uri: selectedRecipe.featuredImage || selectedRecipe.imageUrl }}
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
              </View>
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
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            style={[styles.postButton, (!content.trim() || loading) && styles.postButtonDisabled]}
            onPress={handleSubmit}
            disabled={!content.trim() || loading}
          >
            <Icon name="check" size={20} color="#fff" />
            <Text style={styles.postButtonText}>
              {loading ? (isEditMode ? 'Updating...' : 'Posting...') : isEditMode ? 'Update Post' : 'Post'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Icon name="close" size={20} color={Colors.text.primary} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>


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
                          {recipe.featuredImage || recipe.imageUrl ? (
                            <Image 
                              source={{ uri: recipe.featuredImage || recipe.imageUrl }} 
                              style={styles.recipeImage} 
                            />
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
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  // SINGLE CARD - NO DOUBLE CONTAINER
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text.primary,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: Colors.background.paper,
    paddingRight: 50, // Make room for emoji button
  },
  emojiButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
    padding: 4,
  },
  characterCounter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  characterCounterText: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  characterCounterWarning: {
    color: Colors.status.error,
    fontWeight: '600',
  },
  label: {
    marginBottom: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  selectedRecipeCard: {
    marginBottom: 16,
    elevation: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
    marginTop: 8,
    borderColor: Colors.primary.main,
  },
  selectedRecipeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.default,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  postButtonDisabled: {
    backgroundColor: 'rgba(177, 89, 18, 0.4)',
    shadowOpacity: 0,
    elevation: 0,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.text.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
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
    height: '75%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
