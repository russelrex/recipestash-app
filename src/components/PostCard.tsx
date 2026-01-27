import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, IconButton, Chip, Menu, Surface } from 'react-native-paper';
import { Post } from '../services/api/postsApi';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../services/api';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onUpdate?: (post: Post) => void;
}

export default function PostCard({ post, onLike, onDelete, onUpdate }: PostCardProps) {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUserId();
  }, []);

  const loadCurrentUserId = async () => {
    const userId = await authApi.getCurrentUserId();
    setCurrentUserId(userId);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(post.id),
        },
      ]
    );
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

  const isOwnPost = currentUserId === post.userId;
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;

  return (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Text
              label={post.userName.charAt(0).toUpperCase()}
              size={40}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text variant="titleMedium" style={styles.userName}>
                {post.userName}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                {formatTimestamp(post.createdAt)}
              </Text>
            </View>
          </View>

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
                  onUpdate?.(post);
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

        {/* Content */}
        <Text variant="bodyLarge" style={styles.postContent}>
          {post.content}
        </Text>

        {/* Linked Recipe */}
        {post.recipeId && post.recipeTitle && (
          <TouchableOpacity
            onPress={() => {
              // Navigate to recipe detail (implement later)
              console.log('Navigate to recipe:', post.recipeId);
            }}
          >
            <Chip icon="book-open-page-variant" style={styles.recipeChip}>
              {post.recipeTitle}
            </Chip>
          </TouchableOpacity>
        )}

        {/* Image */}
        {post.imageUrl && (
          <Surface style={styles.imageContainer} elevation={1}>
            <View style={styles.imageWrapper}>
              <Text style={styles.imagePlaceholder}>Image: {post.imageUrl}</Text>
            </View>
          </Surface>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(post.id)}
          >
            <IconButton
              icon={isLiked ? 'heart' : 'heart-outline'}
              iconColor={isLiked ? '#e91e63' : '#37474F'}
              size={24}
              onPress={() => {}}
            />
            <Text style={styles.actionText}>{post.likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PostDetail' as never, { postId: post.id } as never)}
          >
            <IconButton icon="comment-outline" size={24} iconColor="#37474F" onPress={() => {}} />
            <Text style={styles.actionText}>{post.commentsCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
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
    backgroundColor: '#8BC34A',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontWeight: 'bold',
    color: '#37474F',
  },
  timestamp: {
    color: '#666',
  },
  postContent: {
    marginBottom: 12,
    lineHeight: 22,
    color: '#37474F',
  },
  recipeChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  imageWrapper: {
    padding: 16,
    alignItems: 'center',
  },
  imagePlaceholder: {
    color: '#37474F',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    color: '#37474F',
    marginLeft: 4,
  },
});
