import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Divider,
  Menu,
  Snackbar,
  Text,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authApi, postsApi, recipesApi, type Post, type Recipe } from '../services/api';
import { Colors } from '../theme';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

export default function RecipeDetailPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const recipeId = (route.params as any)?.recipeId as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');

  useEffect(() => {
    loadRecipeDetails();
    loadCurrentUserId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  const loadCurrentUserId = async () => {
    const userId = await authApi.getCurrentUserId();
    setCurrentUserId(userId);
  };

  const loadRecipeDetails = async () => {
    try {
      setLoading(true);
      const [recipeData, posts] = await Promise.all([
        recipesApi.getRecipe(recipeId),
        postsApi.getPostsByRecipe(recipeId),
      ]);
      setRecipe(recipeData);
      setRelatedPosts(posts);
    } catch (error: any) {
      console.error('Error loading recipe:', error);
      setSnackbarMessage('Failed to load recipe details');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;

    try {
      const updatedRecipe = await recipesApi.toggleFavorite(recipe._id);
      setRecipe(updatedRecipe);
      setSnackbarMessage(
        updatedRecipe.isFavorite ? 'Added to favorites ❤️' : 'Removed from favorites',
      );
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbarMessage('Failed to update favorite');
      setSnackbarVisible(true);
    }
  };

  const handleEdit = () => {
    if (!recipe) return;
    setMenuVisible(false);
    (navigation as any).navigate('AddRecipe', { recipeId: recipe._id });
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recipesApi.deleteRecipe(recipe?._id || recipeId);
              setSnackbarMessage('Recipe deleted successfully');
              setSnackbarVisible(true);
              setTimeout(() => {
                navigation.goBack();
              }, 1000);
            } catch (error) {
              console.error('Error deleting recipe:', error);
              setSnackbarMessage('Failed to delete recipe');
              setSnackbarVisible(true);
            }
          },
        },
      ],
    );
  };

  const getDifficultyIcon = (difficulty: string) => {
    const icons: Record<string, string> = {
      easy: 'emoticon-happy',
      medium: 'emoticon-neutral',
      hard: 'fire',
    };
    return icons[difficulty.toLowerCase()] || 'help';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color={Colors.text.secondary} />
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnRecipe = currentUserId === recipe.userId;
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Image with Overlay */}
        <View style={styles.headerContainer}>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={styles.headerImage} />
          ) : (
            <View style={[styles.headerImage, styles.placeholderContainer]}>
              <Icon name="food" size={80} color={Colors.text.disabled} />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          <View style={styles.headerOverlay} />

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={Colors.text.inverse} />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
              <Icon
                name={recipe.isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={recipe.isFavorite ? Colors.interaction.like : Colors.text.inverse}
              />
            </TouchableOpacity>
            {isOwnRecipe && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity style={styles.actionButton} onPress={() => setMenuVisible(true)}>
                    <Icon name="dots-vertical" size={24} color={Colors.text.inverse} />
                  </TouchableOpacity>
                }
              >
                <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
                <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
              </Menu>
            )}
          </View>
        </View>

        {/* Profile Card Overlay */}
        <View style={styles.profileCard}>
          <Text style={styles.recipeName}>{recipe.title}</Text>
          <Text style={styles.recipeCategory}>{recipe.category}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[styles.statIconContainer, { backgroundColor: Colors.primary.light + '20' }]}
              >
                <Icon name="clock-outline" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.statValue}>{totalTime}</Text>
              <Text style={styles.statLabel}>Total time</Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.statIconContainer, { backgroundColor: Colors.primary.main + '20' }]}
              >
                <Icon name="food-fork-drink" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.statValue}>{recipe.servings}</Text>
              <Text style={styles.statLabel}>Servings</Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.statIconContainer, { backgroundColor: Colors.secondary.main + '20' }]}
              >
                <Icon name={getDifficultyIcon(recipe.difficulty)} size={20} color={Colors.secondary.main} />
              </View>
              <Text style={styles.statValue}>{recipe.difficulty}</Text>
              <Text style={styles.statLabel}>Difficulty</Text>
            </View>
          </View>

          {/* Description */}
          {recipe.description && <Text style={styles.description}>{recipe.description}</Text>}

          {/* Related Posts Carousel */}
          {relatedPosts.length > 0 && (
            <View style={styles.postsSection}>
              <Text style={styles.postsSectionTitle}>Posted by</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postsCarousel}>
                {relatedPosts.map(post => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.postThumbnail}
                    onPress={() => (navigation as any).navigate('PostDetail', { postId: post.id })}
                  >
                    {post.imageUrl ? (
                      <Image source={{ uri: post.imageUrl }} style={styles.postThumbnailImage} />
                    ) : (
                      <View style={styles.postThumbnailPlaceholder}>
                        <Icon name="image-outline" size={24} color={Colors.text.disabled} />
                      </View>
                    )}
                    <View style={styles.postThumbnailOverlay}>
                      <Icon name="account" size={16} color={Colors.text.inverse} />
                    </View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.postThumbnailMore}>
                  <Icon name="chevron-right" size={24} color={Colors.text.secondary} />
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ingredients' && styles.tabActive]}
            onPress={() => setActiveTab('ingredients')}
          >
            <Text style={[styles.tabText, activeTab === 'ingredients' && styles.tabTextActive]}>
              Ingredients
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'instructions' && styles.tabActive]}
            onPress={() => setActiveTab('instructions')}
          >
            <Text style={[styles.tabText, activeTab === 'instructions' && styles.tabTextActive]}>
              Instructions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'ingredients' ? (
            <View style={styles.ingredientsContainer}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.instructionsContainer}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Time Breakdown */}
        <View style={styles.timeBreakdown}>
          <View style={styles.timeItem}>
            <Icon name="chef-hat" size={24} color={Colors.primary.main} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeValue}>{recipe.prepTime} min</Text>
              <Text style={styles.timeLabel}>Prep time</Text>
            </View>
          </View>
          <Divider style={styles.timeDivider} />
          <View style={styles.timeItem}>
            <Icon name="pot-steam" size={24} color={Colors.primary.main} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeValue}>{recipe.cookTime} min</Text>
              <Text style={styles.timeLabel}>Cook time</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background.default,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
    color: Colors.text.secondary,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  errorButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    backgroundColor: Colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: Colors.background.paper,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  postsSection: {
    marginBottom: 8,
  },
  postsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  postsCarousel: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  postThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  postThumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postThumbnailOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postThumbnailMore: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.paper,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary.main,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  contentContainer: {
    backgroundColor: Colors.background.paper,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  ingredientsContainer: {},
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.main,
    marginTop: 8,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
  },
  instructionsContainer: {},
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    paddingTop: 4,
  },
  timeBreakdown: {
    flexDirection: 'row',
    backgroundColor: Colors.background.paper,
    padding: 24,
    marginTop: 8,
  },
  timeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfo: {
    marginLeft: 12,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  timeDivider: {
    width: 1,
    marginHorizontal: 16,
    backgroundColor: Colors.border.main,
  },
});
