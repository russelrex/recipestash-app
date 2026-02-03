import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Check if the current session is in offline mode
 */
export async function isOfflineMode(): Promise<boolean> {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token === 'offline';
  } catch {
    return false;
  }
}
