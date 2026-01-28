import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Card,
  Chip,
  Divider,
  IconButton,
  Snackbar,
  Text,
} from 'react-native-paper';
import {
  authApi,
  followsApi,
  postsApi,
  recipesApi,
  type FollowStats,
  type Post,
  type Recipe,
} from '../services/api';

export default function ProfilePage() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredRecipe, setFeaturedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadProfileData();
      }
    }, [userId]),
  );

  const loadUserData = async () => {
    try {
      const name = await authApi.getCurrentUserName();
      const id = await authApi.getCurrentUserId();

      if (name && id) {
        setUserName(name);
        setUserId(id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);

      const [stats, userRecipes, userPosts] = await Promise.all([
        followsApi.getStats(userId),
        recipesApi.getAllRecipes(),
        postsApi.getUserPosts(userId),
      ]);

      setFollowStats(stats);
      setRecipes(userRecipes);
      setPosts(userPosts);

      const recipeWithImage = userRecipes.find(r => r.imageUrl);
      setFeaturedRecipe(recipeWithImage || userRecipes[0] || null);
    } catch (error: any) {
      console.error('Error loading profile data:', error);
      setSnackbarMessage('Failed to load profile data');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Avatar.Text
                size={80}
                label={userName.substring(0, 2).toUpperCase()}
                style={styles.avatar}
              />
              <IconButton
                icon="cog"
                size={24}
                onPress={() => navigation.navigate('Settings' as never)}
                style={styles.settingsButton}
              />
            </View>

            <Text variant="headlineSmall" style={styles.name}>
              {userName}
            </Text>
            <Text variant="bodyMedium" style={styles.bio}>
              Recipe Enthusiast 👨‍🍳
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>
                  {recipes.length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Recipes
                </Text>
              </View>

              <View style={styles.statDivider} />

              <TouchableOpacity
                style={styles.statItem}
                onPress={() =>
                  navigation.navigate('Followers' as never, { userId } as never)
                }
              >
                <Text variant="titleLarge" style={styles.statNumber}>
                  {followStats?.followersCount || 0}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Followers
                </Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <TouchableOpacity
                style={styles.statItem}
                onPress={() =>
                  navigation.navigate('Following' as never, { userId } as never)
                }
              >
                <Text variant="titleLarge" style={styles.statNumber}>
                  {followStats?.followingCount || 0}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Following
                </Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statNumber}>
                  {posts.length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Posts
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {featuredRecipe && (
          <Card style={styles.featuredCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  ⭐ Featured Recipe
                </Text>
              </View>
            </Card.Content>
            {featuredRecipe.imageUrl && (
              <Card.Cover
                source={{ uri: featuredRecipe.imageUrl }}
                style={styles.featuredImage}
              />
            )}
            <Card.Content>
              <Text variant="titleMedium" style={styles.featuredTitle}>
                {featuredRecipe.title}
              </Text>
              <Text variant="bodyMedium" style={styles.featuredDescription}>
                {featuredRecipe.description}
              </Text>
              <View style={styles.featuredMeta}>
                <Chip
                  icon={getRecipeIcon(featuredRecipe.category)}
                  style={styles.chip}
                >
                  {featuredRecipe.category}
                </Chip>
                <Chip icon="clock-outline" style={styles.chip}>
                  {featuredRecipe.prepTime + featuredRecipe.cookTime} mins
                </Chip>
                <Chip icon="fire" style={styles.chip}>
                  {featuredRecipe.difficulty}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.recipesCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                My Recipes ({recipes.length})
              </Text>
              <IconButton
                icon="plus-circle"
                size={28}
                onPress={() => navigation.navigate('AddRecipe' as never)}
              />
            </View>

            {recipes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No recipes yet
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Start building your recipe collection!
                </Text>
              </View>
            ) : (
              <View style={styles.recipeGrid}>
                {recipes.slice(0, 6).map(recipe => (
                  <TouchableOpacity
                    key={recipe._id}
                    style={styles.recipeGridItem}
                    onPress={() =>
                      navigation.navigate(
                        'RecipeDetail' as never,
                        { recipeId: recipe._id } as never,
                      )
                    }
                  >
                    {recipe.imageUrl ? (
                      <Card.Cover
                        source={{ uri: recipe.imageUrl }}
                        style={styles.recipeGridImage}
                      />
                    ) : (
                      <View style={styles.recipeGridPlaceholder}>
                        <Avatar.Icon
                          icon={getRecipeIcon(recipe.category)}
                          size={40}
                          style={styles.recipePlaceholderIcon}
                        />
                      </View>
                    )}
                    <View style={styles.recipeGridOverlay}>
                      <Text
                        variant="bodySmall"
                        style={styles.recipeGridTitle}
                        numberOfLines={2}
                      >
                        {recipe.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {recipes.length > 6 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Recipes' as never)}
              >
                <Text variant="titleMedium" style={styles.viewAllText}>
                  View All Recipes →
                </Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.postsCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Recent Posts ({posts.length})
              </Text>
            </View>

            {posts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No posts yet
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Share your cooking journey!
                </Text>
              </View>
            ) : (
              <View>
                {posts.slice(0, 3).map(post => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.postItem}
                    onPress={() =>
                      navigation.navigate(
                        'PostDetail' as never,
                        { postId: post.id } as never,
                      )
                    }
                  >
                    <Text
                      variant="bodyMedium"
                      numberOfLines={2}
                      style={styles.postContent}
                    >
                      {post.content}
                    </Text>
                    <View style={styles.postMeta}>
                      <View style={styles.postStats}>
                        <Text variant="bodySmall" style={styles.postStat}>
                          ❤️ {post.likesCount}
                        </Text>
                        <Text variant="bodySmall" style={styles.postStat}>
                          💬 {post.commentsCount}
                        </Text>
                      </View>
                      {post.recipeTitle && (
                        <Chip
                          icon="book-open-page-variant"
                          style={styles.postRecipeChip}
                        >
                          {post.recipeTitle}
                        </Chip>
                      )}
                    </View>
                    <Divider style={styles.postDivider} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {posts.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Newsfeed' as never)}
              >
                <Text variant="titleMedium" style={styles.viewAllText}>
                  View All Posts →
                </Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>
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
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: '#d84315',
  },
  settingsButton: {
    margin: 0,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  bio: {
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#d84315',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
    fontSize: 12,
  },
  featuredCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  featuredImage: {
    height: 200,
  },
  featuredTitle: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  featuredDescription: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  featuredMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  postsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#bbb',
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  recipeGridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  recipeGridImage: {
    width: '100%',
    height: '100%',
  },
  recipeGridPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  recipePlaceholderIcon: {
    backgroundColor: '#d84315',
  },
  recipeGridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  recipeGridTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#d84315',
    fontWeight: 'bold',
  },
  postItem: {
    marginBottom: 4,
  },
  postContent: {
    marginBottom: 8,
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  postStat: {
    color: '#666',
  },
  postRecipeChip: {
    height: 28,
  },
  postDivider: {
    marginTop: 8,
  },
  chip: {
    height: 32,
  },
});

