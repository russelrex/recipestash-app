import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  IconButton,
  Avatar,
  ActivityIndicator,
  Snackbar,
  Divider,
  Menu,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { recipesApi, postsApi, authApi, type Recipe, type Post } from '../services/api';

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
      const updatedRecipe = await recipesApi.toggleFavorite(recipe.id);
      setRecipe(updatedRecipe);
      setSnackbarMessage(
        updatedRecipe.isFavorite
          ? 'Added to favorites ❤️'
          : 'Removed from favorites',
      );
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbarMessage('Failed to update favorite');
      setSnackbarVisible(true);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('AddRecipe' as never, { recipe } as never);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recipesApi.deleteRecipe(recipeId);
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

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: '#4caf50',
      medium: '#ff9800',
      hard: '#f44336',
    };
    return colors[difficulty.toLowerCase()] || '#999';
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
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall" style={styles.errorText}>
          Recipe not found
        </Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  const isOwnRecipe = currentUserId === recipe.userId;
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Image */}
        {recipe.imageUrl && (
          <Card.Cover
            source={{ uri: recipe.imageUrl }}
            style={styles.headerImage}
          />
        )}

        {/* Title and Actions */}
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              {recipe.title}
            </Text>
            <View style={styles.headerActions}>
              <IconButton
                icon={recipe.isFavorite ? 'heart' : 'heart-outline'}
                iconColor={recipe.isFavorite ? '#e91e63' : '#666'}
                size={28}
                onPress={handleToggleFavorite}
              />
              {isOwnRecipe && (
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      size={24}
                      onPress={() => setMenuVisible(true)}
                    />
                  }
                >
                  <Menu.Item
                    onPress={handleEdit}
                    title="Edit"
                    leadingIcon="pencil"
                  />
                  <Menu.Item
                    onPress={handleDelete}
                    title="Delete"
                    leadingIcon="delete"
                  />
                </Menu>
              )}
            </View>
          </View>

          <Text variant="bodyLarge" style={styles.description}>
            {recipe.description}
          </Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <Chip
              icon={getRecipeIcon(recipe.category)}
              style={styles.metaChip}
              textStyle={styles.metaChipText}
            >
              {recipe.category}
            </Chip>
            <Chip
              icon="clock-outline"
              style={styles.metaChip}
              textStyle={styles.metaChipText}
            >
              {totalTime} mins
            </Chip>
            <Chip
              icon={getDifficultyIcon(recipe.difficulty)}
              style={[
                styles.metaChip,
                { backgroundColor: `${getDifficultyColor(recipe.difficulty)}20` },
              ]}
              textStyle={[
                styles.metaChipText,
                { color: getDifficultyColor(recipe.difficulty) },
              ]}
            >
              {recipe.difficulty}
            </Chip>
          </View>

          {/* Time Breakdown */}
          <Card style={styles.timeCard}>
            <Card.Content>
              <View style={styles.timeBreakdown}>
                <View style={styles.timeItem}>
                  <Avatar.Icon
                    icon="chef-hat"
                    size={40}
                    style={styles.timeIcon}
                  />
                  <Text variant="bodySmall" style={styles.timeLabel}>
                    Prep Time
                  </Text>
                  <Text variant="titleMedium" style={styles.timeValue}>
                    {recipe.prepTime} min
                  </Text>
                </View>
                <Divider style={styles.timeDivider} />
                <View style={styles.timeItem}>
                  <Avatar.Icon
                    icon="pot-steam"
                    size={40}
                    style={styles.timeIcon}
                  />
                  <Text variant="bodySmall" style={styles.timeLabel}>
                    Cook Time
                  </Text>
                  <Text variant="titleMedium" style={styles.timeValue}>
                    {recipe.cookTime} min
                  </Text>
                </View>
                <Divider style={styles.timeDivider} />
                <View style={styles.timeItem}>
                  <Avatar.Icon
                    icon="silverware-fork-knife"
                    size={40}
                    style={styles.timeIcon}
                  />
                  <Text variant="bodySmall" style={styles.timeLabel}>
                    Servings
                  </Text>
                  <Text variant="titleMedium" style={styles.timeValue}>
                    {recipe.servings}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Ingredients Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Avatar.Icon
                icon="format-list-bulleted"
                size={32}
                style={styles.sectionIcon}
              />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Ingredients
              </Text>
            </View>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text variant="bodyLarge" style={styles.listText}>
                  {ingredient}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Instructions Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Avatar.Icon
                icon="clipboard-text"
                size={32}
                style={styles.sectionIcon}
              />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Instructions
              </Text>
            </View>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text variant="titleMedium" style={styles.stepNumberText}>
                    {index + 1}
                  </Text>
                </View>
                <Text variant="bodyLarge" style={styles.instructionText}>
                  {instruction}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Avatar.Icon
                  icon="newspaper-variant"
                  size={32}
                  style={styles.sectionIcon}
                />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Posts with this Recipe ({relatedPosts.length})
                </Text>
              </View>
              {relatedPosts.map(post => (
                <Card
                  key={post.id}
                  style={styles.postCard}
                  onPress={() =>
                    navigation.navigate(
                      'PostDetail' as never,
                      { postId: post.id } as never,
                    )
                  }
                >
                  <Card.Content>
                    <View style={styles.postHeader}>
                      <Avatar.Text
                        size={32}
                        label={post.userName.substring(0, 2).toUpperCase()}
                        style={styles.postAvatar}
                      />
                      <View style={styles.postUserInfo}>
                        <Text variant="titleSmall" style={styles.postUserName}>
                          {post.userName}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={styles.postTimestamp}
                        >
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text
                      variant="bodyMedium"
                      numberOfLines={3}
                      style={styles.postContent}
                    >
                      {post.content}
                    </Text>
                    <View style={styles.postStats}>
                      <Text variant="bodySmall" style={styles.postStat}>
                        ❤️ {post.likesCount}
                      </Text>
                      <Text variant="bodySmall" style={styles.postStat}>
                        💬 {post.commentsCount}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff8e1',
  },
  errorText: {
    marginBottom: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    height: 250,
    borderRadius: 0,
  },
  headerSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  description: {
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaChip: {
    height: 36,
  },
  metaChipText: {
    fontSize: 14,
  },
  timeCard: {
    elevation: 2,
  },
  timeBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeIcon: {
    backgroundColor: '#fff8e1',
  },
  timeLabel: {
    color: '#666',
    marginTop: 8,
  },
  timeValue: {
    fontWeight: 'bold',
    color: '#d84315',
    marginTop: 4,
  },
  timeDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    backgroundColor: '#d84315',
    marginRight: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d84315',
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    lineHeight: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d84315',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    lineHeight: 24,
    paddingTop: 4,
  },
  postCard: {
    marginBottom: 12,
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAvatar: {
    backgroundColor: '#d84315',
  },
  postUserInfo: {
    marginLeft: 8,
    flex: 1,
  },
  postUserName: {
    fontWeight: 'bold',
  },
  postTimestamp: {
    color: '#666',
  },
  postContent: {
    marginBottom: 8,
    lineHeight: 20,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  postStat: {
    color: '#666',
  },
});

