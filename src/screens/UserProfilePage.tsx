import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ActivityIndicator,
  Card,
  Text
} from 'react-native-paper';
import FollowButton from '../components/FollowButton';
import PostCard from '../components/PostCard';
import ProfileAvatar from '../components/ProfileAvatar';
import {
  authApi,
  followsApi,
  type FollowStats,
  type Post,
  postsApi,
  type UserProfile,
} from '../services/api';
import { Colors } from '../theme';

const { height } = Dimensions.get('window');

export default function UserProfilePage() {
  const route = useRoute();
  const navigation = useNavigation();
  const userId = (route.params as any)?.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<FollowStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
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

      const [profileData, statsData, userPosts] = await Promise.all([
        authApi.getUserProfile(userId),
        followsApi.getStats(userId),
        postsApi.getUserPosts(userId),
      ]);

      setProfile(profileData);

      // Prefer profile name; fall back to first post's userName if needed
      const derivedName =
        profileData?.name || (userPosts.length > 0 ? userPosts[0].userName : '');
      setUserName(derivedName);

      setStats(statsData);
      setPosts(userPosts);
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

  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/images/dashboard_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary.main} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/dashboard_bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView style={styles.container}>
          <Card style={styles.profileCard} elevation={4}>
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
  background: {
    width: '100%',
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.text.primary,
  },
  profileCard: {
    margin: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
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
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text.primary,
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
    backgroundColor: Colors.border.main,
  },
  statNumber: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statLabel: {
    color: Colors.text.secondary,
    marginTop: 4,
  },
  postsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.text.primary,
  },
  emptyText: {
    color: Colors.text.disabled,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
