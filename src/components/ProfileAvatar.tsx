import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Avatar } from 'react-native-paper';
import { Colors } from '../theme';

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export default function ProfileAvatar({
  name,
  avatarUrl,
  size = 80,
  style,
  onPress,
}: ProfileAvatarProps) {
  const initials = (name || '')
    .trim()
    .substring(0, 2)
    .toUpperCase() || '?';

  const content = avatarUrl ? (
    <Avatar.Image
      size={size}
      source={{ uri: avatarUrl }}
      style={[styles.avatarBase, style]}
    />
  ) : (
    <Avatar.Text
      size={size}
      label={initials}
      style={[styles.avatarBase, styles.avatarFallback, style]}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  avatarBase: {
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  avatarFallback: {
    backgroundColor: Colors.primary.main,
  },
});

