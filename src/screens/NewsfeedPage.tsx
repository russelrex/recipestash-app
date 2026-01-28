import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { FAB, ActivityIndicator, Text, Snackbar } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PostCard from '../components/PostCard';
import { authApi, postsApi, type Post } from '../services/api';

export default function NewsfeedPage() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadPosts(1);
    }, []),
  );

  const loadPosts = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await postsApi.getPosts(pageNum, 20);

      if (pageNum === 1) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      setSnackbarMessage('Failed to load posts');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts(1);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const updatedPost = await postsApi.toggleLike(postId);
      setPosts(prev =>
        prev.map(post => (post.id === postId ? updatedPost : post)),
      );
    } catch (error: any) {
      console.error('Error toggling like:', error);
      if (error?.message === 'Authentication required') {
        await authApi.logout();
        setSnackbarMessage('Session expired. Please log in again.');
        setSnackbarVisible(true);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      } else {
        setSnackbarMessage('Failed to update like');
        setSnackbarVisible(true);
      }
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await postsApi.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      setSnackbarMessage('Post deleted successfully');
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      setSnackbarMessage('Failed to delete post');
      setSnackbarVisible(true);
    }
  };

  const handleUpdate = (post: Post) => {
    navigation.navigate('CreatePost' as never, { post } as never);
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text variant="displaySmall" style={styles.emptyIcon}>
          📱
        </Text>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No posts yet
        </Text>
        <Text variant="bodyLarge" style={styles.emptyText}>
          Be the first to share your cooking journey!
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading newsfeed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            showComments={true}
            maxCommentsPreview={2}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      <FAB
        icon="plus"
        label="Post"
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost' as never)}
      />

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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#d84315',
  },
});
