import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { followsApi } from '../services/api';
import { Colors } from '../theme';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ userId, onFollowChange }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkFollowStatus();
  }, [userId]);

  const checkFollowStatus = async () => {
    try {
      setChecking(true);
      const status = await followsApi.isFollowing(userId);
      setIsFollowing(status);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await followsApi.unfollow(userId);
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        await followsApi.follow(userId);
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button mode="outlined" disabled style={styles.button}>
        Loading
      </Button>
    );
  }

  return (
    <Button
      mode={isFollowing ? 'outlined' : 'contained'}
      onPress={handleToggleFollow}
      loading={loading}
      disabled={loading}
      style={styles.button}
      buttonColor={isFollowing ? undefined : Colors.secondary.main}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 100,
  },
});
