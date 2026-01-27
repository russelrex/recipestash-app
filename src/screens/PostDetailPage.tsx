import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Dimensions } from 'react-native';
import {
  TextInput,
  Button,
  ActivityIndicator,
  Text,
  Snackbar,
  IconButton,
  Surface,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import PostCard from '../components/PostCard';
import CommentItem from '../components/CommentItem';
import { postsApi, Post, Comment } from '../services/api';

const { height } = Dimensions.get('window');

export default function PostDetailPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const postId = (route.params as any)?.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadPostAndComments();
  }, [postId]);

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      const [postData, commentsData] = await Promise.all([
        postsApi.getPost(postId),
        postsApi.getComments(postId),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (error: any) {
      console.error('Error loading post:', error);
      setSnackbarMessage('Failed to load post');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      const updatedPost = await postsApi.toggleLike(post.id);
      setPost(updatedPost);
    } catch (error: any) {
      console.error('Error toggling like:', error);
      setSnackbarMessage('Failed to update like');
      setSnackbarVisible(true);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await postsApi.deletePost(postId);
      setSnackbarMessage('Post deleted successfully');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      setSnackbarMessage('Failed to delete post');
      setSnackbarVisible(true);
    }
  };

  const handleUpdate = (post: Post) => {
    navigation.navigate('CreatePost' as never, { post } as never);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setSnackbarMessage('Please write a comment');
      setSnackbarVisible(true);
      return;
    }

    try {
      setSubmitting(true);
      const newComment = await postsApi.createComment(postId, {
        content: commentText.trim(),
      });
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      
      // Update post comments count
      if (post) {
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }
      
      setSnackbarMessage('Comment added!');
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      setSnackbarMessage('Failed to add comment');
      setSnackbarVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postsApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      // Update post comments count
      if (post) {
        setPost({ ...post, commentsCount: post.commentsCount - 1 });
      }
      
      setSnackbarMessage('Comment deleted');
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      setSnackbarMessage('Failed to delete comment');
      setSnackbarVisible(true);
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/images/dashboard_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (!post) {
    return (
      <ImageBackground
        source={require('../../assets/images/dashboard_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.errorOverlay}>
          <Text variant="titleLarge">Post not found</Text>
          <Button onPress={() => navigation.goBack()}>Go Back</Button>
        </View>
      </ImageBackground>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ImageBackground
        source={require('../../assets/images/dashboard_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            <PostCard
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />

            <Surface style={styles.commentsSurface} elevation={2}>
              <Text variant="titleLarge" style={styles.commentsTitle}>
                Comments ({comments.length})
              </Text>

              {comments.length === 0 ? (
                <Text variant="bodyMedium" style={styles.noComments}>
                  No comments yet. Be the first to comment!
                </Text>
              ) : (
                comments.map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onDelete={handleDeleteComment}
                  />
                ))
              )}
            </Surface>
          </ScrollView>

          <Surface style={[styles.commentInputContainer, { bottom: insets.bottom }]} elevation={4}>
            <TextInput
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
              mode="outlined"
              style={styles.commentInput}
              multiline
              right={
                <TextInput.Icon
                  icon="send"
                  onPress={handleAddComment}
                  disabled={!commentText.trim() || submitting}
                />
              }
            />
          </Surface>
        </View>
      </ImageBackground>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: '100%',
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
  },
  errorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#37474F',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  commentsSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  commentsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#37474F',
  },
  noComments: {
    color: '#37474F',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  commentInputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
  },
  commentInput: {
    backgroundColor: 'transparent',
  },
});
