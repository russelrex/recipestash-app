import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, ImageBackground, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Snackbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EditPostModal } from '../components/EditPostModal';
import { PostListSkeleton } from '../components/Loading/LoadingComponents';
import PostCard from '../components/PostCard';
import { authApi, postsApi, type Post } from '../services/api';
import { COLORS, SPACING, TYPOGRAPHY } from '../styles/modernStyles';
import { Colors } from '../theme';

const POSTS_PAGE_SIZE = 10;

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadCurrentUserId = useCallback(async () => {
    let id: string | null = null;
    try {
      id = await authApi.getCurrentUserId();
      if (!id || String(id).trim() === '') {
        const profile = await authApi.getProfile();
        const profileId = profile?.id ?? (profile as any)?._id ?? null;
        if (profileId && String(profileId).trim()) {
          id = String(profileId).trim();
          await AsyncStorage.setItem('userId', id);
        }
      }
      if (id) setCurrentUserId(id);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  useEffect(() => {
    loadCurrentUserId();
  }, [loadCurrentUserId]);

  useFocusEffect(
    useCallback(() => {
      loadCurrentUserId();
      loadPosts(1);
    }, [loadCurrentUserId]),
  );

  const loadPosts = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await postsApi.getPosts(pageNum, POSTS_PAGE_SIZE);

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
      setLoadingMore(true);
      loadPosts(page + 1);
    }
  };

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    // Use backend isLiked when present (e.g. after refresh with empty likes array) so unlike works
    const wasLiked =
      post.isLiked === true ||
      (currentUserId != null && (post.likes ?? []).includes(currentUserId));
    const nextLikes = wasLiked
      ? (post.likes ?? []).filter(id => id !== currentUserId)
      : [...(post.likes ?? []), currentUserId!];
    const nextCount = Math.max(0, nextLikes.length);

    // Optimistic update for instant UI feedback
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, likes: nextLikes, likesCount: nextCount, isLiked: !wasLiked }
          : p,
      ),
    );

    try {
      const updatedPost = await postsApi.toggleLike(postId);
      // Sync with server response so like state and count persist after refresh
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                likes: updatedPost.likes ?? [],
                likesCount:
                  typeof updatedPost.likesCount === 'number'
                    ? updatedPost.likesCount
                    : (updatedPost.likes ?? []).length,
                isLiked: updatedPost.isLiked === true,
              }
            : p,
        ),
      );
    } catch (error: any) {
      // Revert optimistic update on error
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                likes: post.likes ?? [],
                likesCount: post.likesCount ?? 0,
                isLiked: post.isLiked,
              }
            : p,
        ),
      );
      setSnackbarMessage(error?.message || 'Failed to update like');
      setSnackbarVisible(true);
    }
  };

  const handleDeletePress = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setPostToDelete(post);
      setDeleteModalVisible(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      setDeleteLoading(true);
      await postsApi.deletePost(postToDelete.id);
      setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
      setDeleteModalVisible(false);
      setPostToDelete(null);
      setSnackbarMessage('Post deleted successfully');
      setSnackbarVisible(true);
    } catch (error: any) {
      setSnackbarMessage(error?.message || 'Failed to delete post');
      setSnackbarVisible(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setPostToDelete(null);
  };

  const handleEditPress = (post: Post) => {
    setPostToEdit(post);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (newContent: string) => {
    if (!postToEdit) return;
    try {
      setEditLoading(true);
      const updated = await postsApi.updatePost(postToEdit.id, {
        content: newContent,
      });
      setPosts(prev =>
        prev.map(p => (p.id === postToEdit.id ? { ...p, ...updated } : p)),
      );
      setEditModalVisible(false);
      setPostToEdit(null);
      setSnackbarMessage('Post updated successfully');
      setSnackbarVisible(true);
    } catch (error: any) {
      setSnackbarMessage(error?.message || 'Failed to update post');
      setSnackbarVisible(true);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setPostToEdit(null);
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Loading more posts...</Text>
      </View>
    );
  };

  const bgImage = require('../../assets/images/placeholder_bg.jpg');

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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <PostListSkeleton count={6} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onDelete={handleDeletePress}
            onUpdate={handleEditPress}
            showComments={true}
            maxCommentsPreview={2}
            currentUserIdFromParent={currentUserId}
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

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
          >
            {snackbarMessage}
          </Snackbar>

          <EditPostModal
            visible={editModalVisible}
            post={postToEdit ? { id: postToEdit.id, content: postToEdit.content } : null}
            loading={editLoading}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />

          <ConfirmationModal
            visible={deleteModalVisible}
            title="Delete Post"
            message={
              postToDelete
                ? `Are you sure you want to delete this post? "${(postToDelete.content || '').substring(0, 50)}${postToDelete.content && postToDelete.content.length > 50 ? '...' : ''}"`
                : ''
            }
            confirmText="Delete"
            cancelText="Cancel"
            confirmButtonColor={COLORS.error}
            loading={deleteLoading}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            type="danger"
          />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    paddingTop: 24,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.text.secondary,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra padding for bottom navigation
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
    color: Colors.text.disabled,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.md,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
