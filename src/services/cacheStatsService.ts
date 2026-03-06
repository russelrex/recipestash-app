import AsyncStorage from '@react-native-async-storage/async-storage';
import imageCacheService from './imageCacheService';
import cacheManager from './cache/cacheManager';
import cacheService from './cache/cacheService';

const RS_CACHE_PREFIX = 'rs_cache:';

export interface CacheStats {
  images: { size: number; count: number };
  data: { size: number; count: number };
  total: { size: number; sizeFormatted: string };
}

/**
 * Get byte size of AsyncStorage keys with a given prefix
 */
async function getAsyncStorageSizeByPrefix(prefix: string): Promise<{ size: number; count: number }> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keys = allKeys.filter(k => k.startsWith(prefix));
    let size = 0;
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) size += new Blob([value]).size;
    }
    return { size, count: keys.length };
  } catch (error) {
    return { size: 0, count: 0 };
  }
}

class CacheStatsService {
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  async getStats(): Promise<CacheStats> {
    try {
      const [imageSize, imageCount, dataStats, rsStats] = await Promise.all([
        imageCacheService.getCacheSize(),
        imageCacheService.getCacheFileCount(),
        cacheManager.getStats(),
        getAsyncStorageSizeByPrefix(RS_CACHE_PREFIX),
      ]);

      const dataSize = dataStats.size + rsStats.size;
      const dataCount = dataStats.count + rsStats.count;
      const totalSize = imageSize + dataSize;

      return {
        images: { size: imageSize, count: imageCount },
        data: { size: dataSize, count: dataCount },
        total: {
          size: totalSize,
          sizeFormatted: this.formatBytes(totalSize),
        },
      };
    } catch (error) {
      return {
        images: { size: 0, count: 0 },
        data: { size: 0, count: 0 },
        total: { size: 0, sizeFormatted: '0 Bytes' },
      };
    }
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      imageCacheService.clearCache(),
      cacheManager.clear(),
      cacheService.clearCache(),
    ]);
  }
}

export default new CacheStatsService();
