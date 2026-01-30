import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import FollowButton from './FollowButton';
import { authApi } from '../services/api';
import { Colors } from '../theme';

interface UserCardProps {
  userId: string;
  userName: string;
  followersCount?: number;
  followingCount?: number;
  showFollowButton?: boolean;
  onFollowChange?: () => void;
}

export default function UserCard({
  userId,
  userName,
  followersCount,
  followingCount,
  showFollowButton = true,
  onFollowChange,
}: UserCardProps) {
  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadCurrentUserId();
  }, []);

  const loadCurrentUserId = async () => {
    const id = await authApi.getCurrentUserId();
    setCurrentUserId(id);
  };

  const isOwnProfile = currentUserId === userId;

  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() =>
              navigation.navigate('UserProfile' as never, { userId } as never)
            }
          >
            <Avatar.Text
              label={userName.charAt(0).toUpperCase()}
              size={48}
              style={styles.avatar}
            />
            <View style={styles.details}>
              <Text variant="titleMedium" style={styles.name}>
                {userName}
              </Text>
              {(followersCount !== undefined || followingCount !== undefined) && (
                <View style={styles.stats}>
                  {followersCount !== undefined && (
                    <Text variant="bodySmall" style={styles.stat}>
                      {followersCount} followers
                    </Text>
                  )}
                  {followingCount !== undefined && (
                    <Text variant="bodySmall" style={styles.stat}>
                      • {followingCount} following
                    </Text>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
          {showFollowButton && !isOwnProfile && (
            <FollowButton userId={userId} onFollowChange={onFollowChange} />
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    elevation: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: Colors.secondary.main,
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  stat: {
    color: Colors.text.secondary,
    marginRight: 8,
  },
});
