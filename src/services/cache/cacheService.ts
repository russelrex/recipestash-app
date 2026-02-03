import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../api/recipesApi';

const CACHE_PREFIX = 'rs_cache:';
const RECIPES_KEY = `${CACHE_PREFIX}recipes`;
const CACHE_TIMESTAMP_KEY = `${CACHE_PREFIX}recipes_timestamp`;

class CacheService {
  /**
   * Store recipes in cache
   */
  async cacheRecipes(recipes: Recipe[]): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      await AsyncStorage.multiSet([
        [RECIPES_KEY, JSON.stringify(recipes)],
        [CACHE_TIMESTAMP_KEY, timestamp],
      ]);
      console.log(`Cached ${recipes.length} recipes at ${new Date(parseInt(timestamp)).toISOString()}`);
    } catch (error) {
      console.error('Error caching recipes:', error);
    }
  }

  /**
   * Retrieve recipes from cache
   */
  async getCachedRecipes(): Promise<Recipe[] | null> {
    try {
      const cached = await AsyncStorage.getItem(RECIPES_KEY);
      if (!cached) return null;

      const recipes = JSON.parse(cached) as Recipe[];
      console.log(`Retrieved ${recipes.length} recipes from cache`);
      return recipes;
    } catch (error) {
      console.error('Error retrieving cached recipes:', error);
      return null;
    }
  }

  /**
   * Get cache timestamp
   */
  async getCacheTimestamp(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('Error retrieving cache timestamp:', error);
      return null;
    }
  }

  /**
   * Clear all cache entries (prefixed with rs_cache:)
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Cleared ${cacheKeys.length} cache entries`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Check if cache exists
   */
  async hasCache(): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(RECIPES_KEY);
      return cached !== null;
    } catch {
      return false;
    }
  }
}

export default new CacheService();
