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
  Button,
  Card,
  Snackbar,
  Text
} from 'react-native-paper';
import ProfileAvatar from '../components/ProfileAvatar';
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
import { isOfflineMode } from '../services/cache/offlineUtils';
import { Colors } from '../theme';
import EditProfileModal from './EditProfileModal';

export default function ProfilePage() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkOfflineMode();
      if (userId) {
        loadProfileData();
      }
    }, [userId]),
  );

  const checkOfflineMode = async () => {
    const offlineMode = await isOfflineMode();
    setOffline(offlineMode);
  };

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

      const [profileData, stats, userRecipes, userPosts] = await Promise.all([
        authApi.getProfile(),
        followsApi.getStats(userId),
        recipesApi.getAllRecipes(),
        postsApi.getUserPosts(userId),
      ]);

      setProfile(profileData);
      setUserName(profileData.name);
      setFollowStats(stats);
      setRecipes(userRecipes);
      setPosts(userPosts);
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

  const handleProfileSaved = (updated: UserProfile) => {
    setProfile(updated);
    setUserName(updated.name);
    setSnackbarMessage('Profile updated successfully');
    setSnackbarVisible(true);
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
              <ProfileAvatar
                name={profile?.name || userName}
                avatarUrl={profile?.avatarUrl}
                size={80}
                style={styles.avatar}
              />
              {/* <IconButton
                icon="cog"
                size={24}
                onPress={() => navigation.navigate('Settings' as never)}
                style={styles.settingsButton}
              /> */}
            </View>

            <Text variant="headlineSmall" style={styles.name}>
              {userName}
            </Text>

            {profile?.bio
              ? <Text variant="bodyMedium" style={styles.bio}>{profile.bio}</Text>
              : <Text variant="bodyMedium" style={styles.bioPlaceholder}>No bio yet</Text>
            }

            {!offline && (
              <Button
                mode="outlined"
                onPress={() => setEditModalVisible(true)}
                style={styles.editButton}
                icon="pencil"
                textColor={Colors.primary.main}
              >
                Edit Profile
              </Button>
            )}
            {offline && (
              <Text variant="bodySmall" style={styles.offlineBadge}>
                📱 Offline Mode - Profile editing disabled
              </Text>
            )}

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

        <Card style={styles.recipesCard}>
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
                    No featured recipes yet. Set recipes as featured when creating or editing them.
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

        <Card style={styles.postsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Recent Posts</Text>
            {posts.length === 0
              ? <Text variant="bodyMedium" style={styles.emptyText}>No posts yet</Text>
              : posts.slice(0, 3).map((post: Post) => (
                  <View key={post.id} style={styles.postPreview}>
                    <Text variant="bodyMedium" style={styles.postContent} numberOfLines={2}>
                      {post.content}
                    </Text>
                    <Text variant="bodySmall" style={styles.postMeta}>
                      {post.likesCount || 0} likes · {post.commentsCount || 0} comments
                    </Text>
                  </View>
                ))
            }
          </Card.Content>
        </Card>
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleProfileSaved}
        currentProfile={profile}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={styles.snackbar}
      >
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
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  settingsButton: {
    margin: 0,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  bio: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  bioPlaceholder: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  editButton: {
    marginBottom: 16,
    borderColor: Colors.primary.main,
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
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
    color: Colors.primary.main,
  },
  statLabel: {
    color: Colors.text.secondary,
    marginTop: 4,
    fontSize: 12,
  },
  featuredCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    borderRadius: 16,
  },
  featuredImage: {
    height: 180,
  },
  featuredTitle: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  featuredDescription: {
    color: Colors.text.secondary,
    marginTop: 4,
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  recipesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  postsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 3,
    borderRadius: 16,
  },
  postPreview: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingVertical: 10,
  },
  postContent: {
    color: '#333',
  },
  postMeta: {
    color: Colors.text.secondary,
    marginTop: 4,
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
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  seeAll: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 14,
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
    backgroundColor: '#eee',
  },
  recipeThumb: {
    width: '100%',
    height: '100%',
  },
  recipeThumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.default,
  },
  recipeThumbIcon: {
    fontSize: 28,
  },
  recipeGridTitle: {
    marginTop: 6,
    textAlign: 'center',
    color: '#333',
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
  chip: {
    backgroundColor: Colors.background.default,
  },
  snackbar: {
    backgroundColor: Colors.primary.main,
  },
  offlineBadge: {
    color: Colors.status.warning || '#FF9800',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
});

