import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  ActivityIndicator,
  Text,
  Snackbar,
  IconButton,
  Avatar,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import PostCard from '../components/PostCard';
import CommentItem from '../components/CommentItem';
import { authApi, postsApi, type Post, type Comment } from '../services/api';
import { Colors } from '../theme';

export default function PostDetailPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const postId = (route.params as any)?.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    loadPostAndComments();
    loadUserName();
  }, [postId]);

  const loadUserName = async () => {
    const name = await authApi.getCurrentUserName();
    if (name) setCurrentUserName(name);
  };

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
      // Do NOT auto-logout on auth errors here; just show feedback.
      setSnackbarMessage(error?.message || 'Failed to update like');
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

      if (post) {
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }

      setSnackbarMessage('Comment added! 💬');
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

      if (post) {
        setPost({
          ...post,
          commentsCount: Math.max(0, post.commentsCount - 1),
        });
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall" style={styles.errorText}>
          Post not found
        </Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <PostCard
            post={post}
            onLike={handleLike}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            showComments={false}
          />

          <View style={styles.commentsSection}>
            <Text variant="titleLarge" style={styles.commentsTitle}>
              Comments ({comments.length})
            </Text>

            {comments.length === 0 ? (
              <View style={styles.noCommentsContainer}>
                <Text variant="displaySmall" style={styles.noCommentsIcon}>
                  💬
                </Text>
                <Text variant="bodyLarge" style={styles.noComments}>
                  No comments yet
                </Text>
                <Text variant="bodyMedium" style={styles.noCommentsSubtext}>
                  Be the first to comment!
                </Text>
              </View>
            ) : (
              comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onDelete={handleDeleteComment}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <Avatar.Text
          size={36}
          label={currentUserName.substring(0, 2).toUpperCase()}
          style={styles.commentAvatar}
        />
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Write a comment..."
          mode="outlined"
          style={styles.commentInput}
          multiline
          maxLength={500}
          disabled={submitting}
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleAddComment}
          disabled={submitting || !commentText.trim()}
          loading={submitting}
          iconColor={commentText.trim() ? Colors.primary.main : Colors.text.disabled}
        />
      </View>

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
    marginBottom: 16,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noComments: {
    color: Colors.text.disabled,
    marginBottom: 4,
  },
  noCommentsSubtext: {
    color: '#bbb',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.border.main,
    gap: 8,
  },
  commentAvatar: {
    backgroundColor: Colors.primary.main,
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
  },
});
