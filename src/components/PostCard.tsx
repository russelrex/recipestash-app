import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  Card,
  Text,
  Avatar,
  IconButton,
  Chip,
  Menu,
  TextInput,
  Button,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { authApi, postsApi, type Post, type Comment } from '../services/api';
import { Colors } from '../theme';
import CommentItem from './CommentItem';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onUpdate?: (post: Post) => void;
  showComments?: boolean;
  maxCommentsPreview?: number;
}

export default function PostCard({
  post,
  onLike,
  onDelete,
  onUpdate,
  showComments = true,
  maxCommentsPreview = 2,
}: PostCardProps) {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  useEffect(() => {
    loadCurrentUserId();
  }, []);

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const loadCurrentUserId = async () => {
    const userId = await authApi.getCurrentUserId();
    setCurrentUserId(userId);
  };

  const loadComments = async () => {
    if (commentsLoaded) return;

    try {
      setLoadingComments(true);
      const fetchedComments = await postsApi.getComments(localPost.id);
      setComments(fetchedComments);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLikePress = () => {
    const isLiked = currentUserId
      ? localPost.likes.includes(currentUserId)
      : false;

    const newLikes = isLiked
      ? localPost.likes.filter(id => id !== currentUserId)
      : [...localPost.likes, currentUserId!];

    setLocalPost({
      ...localPost,
      likes: newLikes,
      likesCount: newLikes.length,
    });

    onLike(localPost.id);
  };

  const handleCommentPress = async () => {
    if (!commentsLoaded) {
      await loadComments();
    }
    setShowCommentInput(!showCommentInput);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const newComment = await postsApi.createComment(localPost.id, {
        content: commentText.trim(),
      });

      setComments(prev => [...prev, newComment]);
      setCommentText('');
      setLocalPost({
        ...localPost,
        commentsCount: localPost.commentsCount + 1,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postsApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setLocalPost({
        ...localPost,
        commentsCount: Math.max(0, localPost.commentsCount - 1),
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete?.(localPost.id),
      },
    ]);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isOwnPost = currentUserId === localPost.userId;
  const isLiked = currentUserId
    ? localPost.likes.includes(currentUserId)
    : false;

  const visibleComments = showComments
    ? comments.slice(0, maxCommentsPreview)
    : [];
  const hasMoreComments = comments.length > maxCommentsPreview;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'UserProfile' as never,
                { userId: localPost.userId } as never,
              )
            }
            style={styles.userInfo}
          >
            <Avatar.Text
              size={40}
              label={localPost.userName.substring(0, 2).toUpperCase()}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text variant="titleMedium" style={styles.userName}>
                {localPost.userName}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                {formatTimestamp(localPost.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          {isOwnPost && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  onUpdate?.(localPost);
                }}
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

        <Text variant="bodyLarge" style={styles.content}>
          {localPost.content}
        </Text>

        {localPost.recipeId && localPost.recipeTitle && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'RecipeDetail' as never,
                { recipeId: localPost.recipeId } as never,
              )
            }
          >
            <Chip
              icon="book-open-page-variant"
              style={styles.recipeChip}
              mode="outlined"
            >
              {localPost.recipeTitle}
            </Chip>
          </TouchableOpacity>
        )}

        {localPost.imageUrl && (
          <Card.Cover source={{ uri: localPost.imageUrl }} style={styles.image} />
        )}

        {(localPost.likesCount > 0 || localPost.commentsCount > 0) && (
          <View style={styles.countsContainer}>
            {localPost.likesCount > 0 && (
              <Text variant="bodySmall" style={styles.countText}>
                {localPost.likesCount}{' '}
                {localPost.likesCount === 1 ? 'like' : 'likes'}
              </Text>
            )}
            {localPost.commentsCount > 0 && (
              <Text variant="bodySmall" style={styles.countText}>
                {localPost.commentsCount}{' '}
                {localPost.commentsCount === 1 ? 'comment' : 'comments'}
              </Text>
            )}
          </View>
        )}

        <Divider style={styles.divider} />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLikePress}
            activeOpacity={0.7}
          >
            <IconButton
              icon={isLiked ? 'heart' : 'heart-outline'}
              iconColor={isLiked ? Colors.interaction.like : Colors.text.secondary}
              size={24}
              style={styles.actionIcon}
            />
            <Text
              variant="bodyMedium"
              style={[styles.actionText, isLiked && styles.actionTextActive]}
            >
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCommentPress}
            activeOpacity={0.7}
          >
            <IconButton
              icon="comment-outline"
              iconColor={Colors.text.secondary}
              size={24}
              style={styles.actionIcon}
            />
            <Text variant="bodyMedium" style={styles.actionText}>
              Comment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(
                'PostDetail' as never,
                { postId: localPost.id } as never,
              )
            }
            activeOpacity={0.7}
          >
            <IconButton
              icon="eye-outline"
              iconColor={Colors.text.secondary}
              size={24}
              style={styles.actionIcon}
            />
            <Text variant="bodyMedium" style={styles.actionText}>
              View
            </Text>
          </TouchableOpacity>
        </View>

        <Divider style={styles.divider} />

        {showComments && commentsLoaded && (
          <View style={styles.commentsSection}>
            {visibleComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
              />
            ))}

            {hasMoreComments && (
              <TouchableOpacity
                style={styles.viewAllComments}
                onPress={() =>
                  navigation.navigate(
                    'PostDetail' as never,
                    { postId: localPost.id } as never,
                  )
                }
              >
                <Text variant="bodyMedium" style={styles.viewAllCommentsText}>
                  View all {comments.length} comments
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {loadingComments && (
          <Text variant="bodySmall" style={styles.loadingComments}>
            Loading comments...
          </Text>
        )}

        {showCommentInput && (
          <View style={styles.commentInputContainer}>
            <Avatar.Text
              size={32}
              label={
                currentUserId
                  ? localPost.userName.substring(0, 2).toUpperCase()
                  : '?'
              }
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
              disabled={submittingComment}
              dense
            />
            <IconButton
              icon="send"
              size={20}
              onPress={handleAddComment}
              disabled={submittingComment || !commentText.trim()}
              iconColor={commentText.trim() ? Colors.primary.main : Colors.text.disabled}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: Colors.primary.main,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontWeight: 'bold',
  },
  timestamp: {
    color: Colors.text.secondary,
  },
  content: {
    marginBottom: 12,
    lineHeight: 22,
  },
  recipeChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  image: {
    marginBottom: 12,
    borderRadius: 8,
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  countText: {
    color: Colors.text.secondary,
  },
  divider: {
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionIcon: {
    margin: 0,
  },
  actionText: {
    color: Colors.text.secondary,
    fontWeight: '600',
    marginLeft: -8,
  },
  actionTextActive: {
    color: Colors.interaction.like,
  },
  commentsSection: {
    marginTop: 8,
  },
  viewAllComments: {
    paddingVertical: 8,
  },
  viewAllCommentsText: {
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  loadingComments: {
    color: Colors.text.disabled,
    textAlign: 'center',
    paddingVertical: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
