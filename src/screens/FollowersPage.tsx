import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { followsApi, Follow } from '../services/api';
import UserCard from '../components/UserCard';

const { height } = Dimensions.get('window');

export default function FollowersPage() {
  const route = useRoute();
  const userId = (route.params as any)?.userId as string;

  const [followers, setFollowers] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadFollowers();
  }, [userId]);

  const loadFollowers = async () => {
    try {
      setLoading(true);
      const data = await followsApi.getFollowers(userId);
      setFollowers(data);
    } catch (error: any) {
      console.error('Error loading followers:', error);
      setSnackbarMessage('Failed to load followers');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/images/dashboard_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8BC34A" />
          <Text style={styles.loadingText}>Loading followers...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/dashboard_bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <FlatList
          data={followers}
          renderItem={({ item }) => (
            <UserCard
              userId={item.followerId}
              userName={item.followerName}
              showFollowButton={true}
              onFollowChange={() => loadFollowers()}
            />
          )}
          keyExtractor={(item, index) => item?.id || `follower-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No followers yet
              </Text>
            </View>
          }
        />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
  },
  loadingText: {
    marginTop: 10,
    color: '#37474F',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
  },
});
