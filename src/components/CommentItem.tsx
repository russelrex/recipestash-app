import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Avatar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { authApi, type Comment } from '../services/api';
import { Colors } from '../theme';

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
}

export default function CommentItem({ comment, onDelete }: CommentItemProps) {
  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUserId();
  }, []);

  const loadCurrentUserId = async () => {
    const userId = await authApi.getCurrentUserId();
    setCurrentUserId(userId);
  };

  const handleDelete = () => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete?.(comment.id),
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
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const isOwnComment = currentUserId === comment.userId;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('UserProfile' as never, { userId: comment.userId } as never)
        }
      >
        <Avatar.Text
          size={32}
          label={comment.userName.substring(0, 2).toUpperCase()}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.commentBubble}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('UserProfile' as never, { userId: comment.userId } as never)
              }
            >
              <Text variant="titleSmall" style={styles.userName}>
                {comment.userName}
              </Text>
            </TouchableOpacity>
            {isOwnComment && (
              <IconButton icon="delete-outline" size={16} onPress={handleDelete} />
            )}
          </View>
          <Text variant="bodyMedium" style={styles.commentText}>
            {comment.content}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.timestamp}>
          {formatTimestamp(comment.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  avatar: {
    backgroundColor: Colors.primary.main,
  },
  content: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: Colors.border.light,
    borderRadius: 12,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
  },
  commentText: {
    lineHeight: 20,
  },
  timestamp: {
    color: Colors.text.disabled,
    marginTop: 4,
    marginLeft: 12,
  },
});
