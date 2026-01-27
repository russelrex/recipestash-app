import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Avatar, IconButton } from 'react-native-paper';
import { Comment } from '../services/api/postsApi';
import { authApi } from '../services/api';

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
}

export default function CommentItem({ comment, onDelete }: CommentItemProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUserId();
  }, []);

  const loadCurrentUserId = async () => {
    const userId = await authApi.getCurrentUserId();
    setCurrentUserId(userId);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(comment.id),
        },
      ]
    );
  };

  const isOwnComment = currentUserId === comment.userId;

  return (
    <View style={styles.container}>
      <Avatar.Text
        label={comment.userName.charAt(0).toUpperCase()}
        size={32}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="bodyMedium" style={styles.userName}>
            {comment.userName}
          </Text>
          {isOwnComment && (
            <IconButton
              icon="delete-outline"
              size={18}
              onPress={handleDelete}
            />
          )}
        </View>
        <Text variant="bodyMedium">{comment.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: '#8BC34A',
  },
  content: {
    flex: 1,
    marginLeft: 12,
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
});
