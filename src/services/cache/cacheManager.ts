import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@cache:';
const CACHE_EXPIRY_PREFIX = '@cache_expiry:';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
}

class CacheManager {
  async set(key: string, value: unknown, options?: CacheOptions): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const data = JSON.stringify(value);
      await AsyncStorage.setItem(cacheKey, data);

      if (options?.ttl) {
        const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`;
        const expiryTime = Date.now() + options.ttl;
        await AsyncStorage.setItem(expiryKey, expiryTime.toString());
      }
    } catch (error) {
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`;

      const expiryTime = await AsyncStorage.getItem(expiryKey);
      if (expiryTime && Date.now() > parseInt(expiryTime, 10)) {
        await this.delete(key);
        return null;
      }

      const data = await AsyncStorage.getItem(cacheKey);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`;
      await AsyncStorage.multiRemove([cacheKey, expiryKey]);
    } catch (error) {
    }
  }

  async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(
        k => k.startsWith(CACHE_PREFIX) || k.startsWith(CACHE_EXPIRY_PREFIX),
      );
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
    }
  }

  async getSize(): Promise<number> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(k => k.startsWith(CACHE_PREFIX));

      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  async getStats(): Promise<{ count: number; size: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(k => k.startsWith(CACHE_PREFIX));
      const size = await this.getSize();
      return { count: cacheKeys.length, size };
    } catch (error) {
      return { count: 0, size: 0 };
    }
  }
}

export default new CacheManager();
