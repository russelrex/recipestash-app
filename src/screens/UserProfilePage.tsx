import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ActivityIndicator,
  Card,
  Text
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import FollowButton from '../components/FollowButton';
import PostCard from '../components/PostCard';
import ProfileAvatar from '../components/ProfileAvatar';
import {
  PostListSkeleton,
  ProfileCardSkeleton,
  RecipeListSkeleton,
} from '../components/Loading/LoadingComponents';
import {
  authApi,
  followsApi,
  postsApi,
  recipesApi,
  type FollowStats,
  type Post,
  type Recipe,
  type UserProfile,
} from '../services/api';
import { CARD_STYLES, COLORS, SPACING, TYPOGRAPHY } from '../styles/modernStyles';
import { Colors } from '../theme';

export default function UserProfilePage() {
  const route = useRoute();
  const navigation = useNavigation();
  const userId = (route.params as any)?.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<FollowStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const currentId = await authApi.getCurrentUserId();
      setCurrentUserId(currentId);

      const [profileData, statsData, userPosts, allRecipes] = await Promise.all([
        authApi.getUserProfile(userId),
        followsApi.getStats(userId),
        postsApi.getUserPosts(userId),
        recipesApi.getAllRecipes(),
      ]);

      // Filter recipes by userId (ownerId might also be used)
      const userRecipes = allRecipes.filter(
        (recipe: Recipe) => recipe.userId === userId || (recipe as any).ownerId === userId
      );

      setProfile(profileData);

      // Prefer profile name; fall back to first post's userName if needed
      const derivedName =
        profileData?.name || (userPosts.length > 0 ? userPosts[0].userName : '');
      setUserName(derivedName);

      setStats(statsData);
      setPosts(userPosts);
      setRecipes(userRecipes);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const updatedPost = await postsApi.toggleLike(postId);
      setPosts(prev =>
        prev.map(post => (post.id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await postsApi.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const bgImage = require('../../assets/images/placeholder_bg.jpg');

  const isOwnProfile = currentUserId === userId;

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.loadingScroll}>
          <ProfileCardSkeleton />
          <View style={styles.loadingSectionCard}>
            <RecipeListSkeleton count={2} />
          </View>
          <View style={styles.loadingSectionCard}>
            <PostListSkeleton count={2} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <ScrollView style={styles.container}>
          <Card style={[styles.profileCard, CARD_STYLES.elevated]} elevation={0}>
            <Card.Content style={styles.profileContent}>
              <ProfileAvatar
                name={userName}
                avatarUrl={profile?.avatarUrl}
                size={80}
                style={styles.avatar}
              />
              <Text variant="headlineSmall" style={styles.name}>
                {userName}
              </Text>

              <View style={styles.statsContainer}>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() =>
                    navigation.navigate('Followers' as never, { userId } as never)
                  }
                >
                  <Text variant="headlineSmall" style={styles.statNumber}>
                    {posts.length}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Posts
                  </Text>
                </TouchableOpacity>

                <View style={styles.statDivider} />

                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() =>
                    navigation.navigate('Followers' as never, { userId } as never)
                  }
                >
                  <Text variant="headlineSmall" style={styles.statNumber}>
                    {stats?.followersCount || 0}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
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
                  <Text variant="headlineSmall" style={styles.statNumber}>
                    {stats?.followingCount || 0}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Following
                  </Text>
                </TouchableOpacity>
              </View>

              {!isOwnProfile && (
                <FollowButton
                  userId={userId}
                  onFollowChange={() => loadUserProfile()}
                />
              )}
            </Card.Content>
          </Card>

          {/* Featured Recipes Section */}
          <Card style={[styles.glassCard, CARD_STYLES.standard]} elevation={0}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Featured Recipes
                </Text>
              </View>
              {(() => {
                const featuredRecipes = recipes.filter((r: Recipe) => r.featured === true).slice(0, 3);
                return featuredRecipes.length === 0
                  ? <Text variant="bodyMedium" style={styles.emptyText}>
                      No featured recipes yet
                    </Text>
                  : (
                    <View style={styles.recipeGrid}>
                      {featuredRecipes.map((recipe: Recipe) => (
                        <TouchableOpacity
                          key={recipe._id}
                          style={styles.recipeGridItem}
                          onPress={() => navigation.navigate('RecipeDetail' as never,
                            { recipeId: recipe._id } as never)}
                        >
                          {recipe.featuredImage
                            ? <View style={styles.recipeThumbWrapper}>
                                <Card.Cover source={{ uri: recipe.featuredImage }} style={styles.recipeThumb} />
                              </View>
                            : <View style={[styles.recipeThumbWrapper, styles.recipeThumbPlaceholder]}>
                                <Text style={styles.recipeThumbIcon}>
                                  {getRecipeIcon(recipe.category) === 'coffee' ? '☕' : '🍽'}
                                </Text>
                              </View>
                          }
                          <Text variant="bodySmall" style={styles.recipeGridTitle} numberOfLines={1}>
                            {recipe.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
              })()}
            </Card.Content>
          </Card>

          <View style={styles.postsSection}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Posts
            </Text>
            {posts.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No posts yet
              </Text>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    flex: 1,
    paddingTop: 24,
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingScroll: {
    flexGrow: 1,
    padding: SPACING.md,
    paddingBottom: 100,
    backgroundColor: COLORS.background,
  },
  loadingSectionCard: {
    marginTop: SPACING.md,
  },
  glassCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  profileCard: {
    margin: SPACING.md,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: Colors.secondary.main,
    marginBottom: 16,
  },
  name: {
    ...(TYPOGRAPHY.h2 as object),
    marginBottom: 16,
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statNumber: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  postsSection: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...(TYPOGRAPHY.h3 as object),
    marginBottom: 12,
    color: COLORS.text,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recipeGridItem: {
    width: '30%',
    alignItems: 'center',
  },
  recipeThumbWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBackgroundAlt,
  },
  recipeThumb: {
    width: '100%',
    height: '100%',
  },
  recipeThumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recipeThumbIcon: {
    fontSize: 28,
  },
  recipeGridTitle: {
    marginTop: 6,
    textAlign: 'center',
    color: COLORS.text,
  },
});
