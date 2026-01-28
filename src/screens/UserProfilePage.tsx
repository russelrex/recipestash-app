import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import {
  Text,
  Card,
  Avatar,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { authApi, followsApi, postsApi, Post, FollowStats } from '../services/api';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';

const { height } = Dimensions.get('window');

export default function UserProfilePage() {
  const route = useRoute();
  const navigation = useNavigation();
  const userId = (route.params as any)?.userId as string;

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

      const [statsData, userPosts] = await Promise.all([
        followsApi.getStats(userId),
        postsApi.getUserPosts(userId),
      ]);

      // Get user name from first post or stats
      if (userPosts.length > 0) {
        setUserName(userPosts[0].userName);
      }

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
          <ActivityIndicator size="large" color="#8BC34A" />
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
              <Avatar.Text
                label={userName.charAt(0).toUpperCase()}
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
    color: '#37474F',
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
    backgroundColor: '#8BC34A',
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#37474F',
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
    backgroundColor: '#e0e0e0',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#37474F',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  postsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#37474F',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
