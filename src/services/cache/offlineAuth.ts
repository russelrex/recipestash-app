import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const OFFLINE_EMAIL_KEY = 'rs_offline_email';
const OFFLINE_PASSWORD_HASH_KEY = 'rs_offline_password_hash';

/**
 * Hash a password using SHA-256
 * Uses expo-crypto for React Native compatibility
 */
async function hashPassword(password: string): Promise<string> {
  try {
    // Use expo-crypto for SHA-256 hashing
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

class OfflineAuth {
  /**
   * Store offline credentials (email + password hash)
   */
  async storeOfflineCredentials(email: string, password: string): Promise<void> {
    try {
      const hash = await hashPassword(password);
      await AsyncStorage.multiSet([
        [OFFLINE_EMAIL_KEY, email.toLowerCase().trim()],
        [OFFLINE_PASSWORD_HASH_KEY, hash],
      ]);
      console.log('Stored offline credentials for:', email);
    } catch (error) {
      console.error('Error storing offline credentials:', error);
      throw error;
    }
  }

  /**
   * Verify offline login credentials
   */
  async verifyOfflineLogin(email: string, password: string): Promise<boolean> {
    try {
      const [storedEmail, storedHash] = await AsyncStorage.multiGet([
        OFFLINE_EMAIL_KEY,
        OFFLINE_PASSWORD_HASH_KEY,
      ]);

      if (!storedEmail[1] || !storedHash[1]) {
        return false;
      }

      // Check email matches
      if (storedEmail[1].toLowerCase().trim() !== email.toLowerCase().trim()) {
        return false;
      }

      // Hash provided password and compare
      const providedHash = await hashPassword(password);
      return providedHash === storedHash[1];
    } catch (error) {
      console.error('Error verifying offline login:', error);
      return false;
    }
  }

  /**
   * Clear offline credentials
   */
  async clearOfflineCredentials(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([OFFLINE_EMAIL_KEY, OFFLINE_PASSWORD_HASH_KEY]);
      console.log('Cleared offline credentials');
    } catch (error) {
      console.error('Error clearing offline credentials:', error);
    }
  }

  /**
   * Check if offline credentials exist
   */
  async hasOfflineCredentials(): Promise<boolean> {
    try {
      const email = await AsyncStorage.getItem(OFFLINE_EMAIL_KEY);
      const hash = await AsyncStorage.getItem(OFFLINE_PASSWORD_HASH_KEY);
      return email !== null && hash !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get stored email (for pre-filling login form)
   */
  async getStoredEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(OFFLINE_EMAIL_KEY);
    } catch {
      return null;
    }
  }
}

export default new OfflineAuth();
