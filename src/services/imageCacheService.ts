import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.cacheDirectory ?? ''}images/`;

class ImageCacheService {
  /**
   * Initialize cache directory
   */
  async initialize(): Promise<void> {
    try {
      if (!FileSystem.cacheDirectory) return;
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }
    } catch (error) {
    }
  }

  private getCacheKey(url: string): string {
    return url.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private getCachePath(url: string): string {
    return `${CACHE_DIR}${this.getCacheKey(url)}`;
  }

  async isCached(url: string): Promise<boolean> {
    if (!url || !FileSystem.cacheDirectory) return false;
    try {
      const cachePath = this.getCachePath(url);
      const fileInfo = await FileSystem.getInfoAsync(cachePath);
      return fileInfo.exists;
    } catch {
      return false;
    }
  }

  async getImageUri(url: string): Promise<string> {
    if (!url) return '';
    const isCached = await this.isCached(url);
    if (isCached) return this.getCachePath(url);
    return url;
  }

  async cacheImage(url: string): Promise<string> {
    if (!url || !FileSystem.cacheDirectory) return url;
    try {
      const cachePath = this.getCachePath(url);
      if (await this.isCached(url)) return cachePath;
      const downloadResult = await FileSystem.downloadAsync(url, cachePath);
      return downloadResult.uri;
    } catch (error) {
      return url;
    }
  }

  async prefetchImages(urls: string[]): Promise<void> {
    const valid = urls.filter(Boolean);
    await Promise.all(valid.map(url => this.cacheImage(url)));
  }

  async getCacheSize(): Promise<number> {
    try {
      if (!FileSystem.cacheDirectory) return 0;
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) return 0;

      const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
      let totalSize = 0;

      for (const file of files) {
        const filePath = `${CACHE_DIR}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath, { size: true });
        if (fileInfo.exists && 'size' in fileInfo && typeof fileInfo.size === 'number') {
          totalSize += fileInfo.size;
        }
      }

      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  async clearCache(): Promise<void> {
    try {
      if (!FileSystem.cacheDirectory) return;
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
        await this.initialize();
      }
    } catch (error) {
    }
  }

  async getCacheFileCount(): Promise<number> {
    try {
      if (!FileSystem.cacheDirectory) return 0;
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) return 0;
      const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
      return files.length;
    } catch (error) {
      return 0;
    }
  }
}

export default new ImageCacheService();
