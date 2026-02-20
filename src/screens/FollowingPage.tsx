import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, ImageBackground, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Snackbar, Text } from 'react-native-paper';
import UserCard from '../components/UserCard';
import { Follow, followsApi } from '../services/api';
import { Colors } from '../theme';

export default function FollowingPage() {
  const route = useRoute();
  const userId = (route.params as any)?.userId as string;

  const [following, setFollowing] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const loadFollowing = async () => {
    try {
      setLoading(true);
      const data = await followsApi.getFollowing(userId);
      setFollowing(data);
    } catch (error: any) {
      console.error('Error loading following:', error);
      setSnackbarType('error');
      setSnackbarMessage('Failed to load following');
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
          <ActivityIndicator size="large" color={Colors.secondary.main} />
          <Text style={styles.loadingText}>Loading following...</Text>
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
            data={following}
            renderItem={({ item }) => (
              <UserCard
                userId={item.followingId}
                userName={item.followingName}
                isPremium={item.followingIsPremium}
                showFollowButton={true}
                onFollowChange={() => loadFollowing()}
              />
            )}
            keyExtractor={(item, index) => item?.id || `following-${index}`}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  Not following anyone yet
                </Text>
              </View>
            }
          />

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
            style={[
              styles.snackbar,
              snackbarType === 'success' && styles.snackbarSuccess,
              snackbarType === 'error' && styles.snackbarError,
            ]}
          >
            {snackbarMessage}
          </Snackbar>
        </View>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  background: {
    flex: 1,
    width: '100%',
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
    color: Colors.text.primary,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.text.disabled,
    textAlign: 'center',
    paddingVertical: 40,
  },
  snackbar: {
    backgroundColor: Colors.status.info,
  },
  snackbarSuccess: {
    backgroundColor: Colors.status.success,
  },
  snackbarError: {
    backgroundColor: Colors.status.error,
  },
});
