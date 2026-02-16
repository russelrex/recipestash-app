import cacheService from '../cache/cacheService';
import apiClient from './config';

export interface Recipe {
  _id: string;
  userId: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  featuredImage?: string; // Base64 encoded or URL
  images?: string[]; // Array of base64 encoded images or URLs
  isFavorite: boolean;
  featured?: boolean; // Whether this recipe is featured on profile
  rating?: number;
  createdAt: string;
  updatedAt: string;
  // Author info (populated when fetching public recipes)
  author?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

export interface CreateRecipeData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ownerId: string; // User ID of the recipe owner
  ownerName: string; // Name of the recipe owner
  featuredImage?: string; // Base64 encoded or URL
  images?: string[]; // Array of base64 encoded images or URLs
  featured?: boolean; // Whether this recipe should be featured on profile
}

export interface UpdateRecipeData {
  title?: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  category?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  featuredImage?: string; // Base64 encoded or URL
  images?: string[]; // Array of base64 encoded images or URLs
  featured?: boolean; // Whether this recipe should be featured on profile
}

export interface RecipeStats {
  totalRecipes: number;
  favoriteRecipes: number;
  categoryCounts: Record<string, number>;
}

class RecipesApi {
  async createRecipe(data: CreateRecipeData): Promise<Recipe> {
    try {
      const response = await apiClient.post('/recipes', data);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create recipe');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create recipe');
    }
  }

  async getAllRecipes(): Promise<Recipe[]> {
    try {
      const response = await apiClient.get('/recipes');
      if (response.data.success) {
        const recipes = response.data.data;
        // Cache recipes after successful fetch
        await cacheService.cacheRecipes(recipes);
        return recipes;
      } else {
        throw new Error(response.data.message || 'Failed to fetch recipes');
      }
    } catch (error: any) {
      // If network error, try to serve from cache
      if (!error.response && error.request) {
        console.warn('Network error, attempting to load from cache...');
        const cached = await cacheService.getCachedRecipes();
        if (cached) {
          console.log('Serving recipes from cache');
          return cached;
        }
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch recipes');
    }
  }

  // NEW: Get all public recipes from all users
  async getAllPublicRecipes(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<Recipe[]> {
    try {
      console.log('🌐 [API] Fetching all public recipes', params);
      const response = await apiClient.get('/recipes/public', { params });
      console.log('✅ [API] Received', response.data?.data?.length || 0, 'recipes');
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch public recipes');
      }
    } catch (error: any) {
      console.error('❌ [API] Error fetching public recipes:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch public recipes');
    }
  }

  async getRecipe(id: string): Promise<Recipe> {
    try {
      const response = await apiClient.get(`/recipes/${id}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch recipe');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipe');
    }
  }

  async getStats(): Promise<RecipeStats> {
    try {
      const response = await apiClient.get('/recipes/stats');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stats');
    }
  }

  async getFavorites(): Promise<Recipe[]> {
    try {
      const response = await apiClient.get('/recipes/favorites');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch favorites');
    }
  }

  async getByCategory(category: string): Promise<Recipe[]> {
    try {
      const response = await apiClient.get(`/recipes/category/${category}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipes by category');
    }
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      const response = await apiClient.get('/recipes/search', {
        params: { q: query },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search recipes');
    }
  }

  async updateRecipe(id: string, data: UpdateRecipeData): Promise<Recipe> {
    try {
      console.log(`Updating recipe ${id} with data:`, {
        ...data,
        featuredImage: data.featuredImage ? `${data.featuredImage.substring(0, 50)}...` : undefined,
        images: data.images?.length || 0,
      });
      
      const response = await apiClient.patch(`/recipes/${id}`, data);
      
      console.log('Update response:', {
        success: response.data.success,
        hasData: !!response.data.data,
        message: response.data.message,
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        const errorMsg = response.data.message || 'Failed to update recipe';
        console.error('Update failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Update recipe error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      throw new Error(error.response?.data?.message || error.message || 'Failed to update recipe');
    }
  }

  async toggleFavorite(id: string): Promise<Recipe> {
    try {
      const response = await apiClient.patch(`/recipes/${id}/favorite`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to toggle favorite');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle favorite');
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/recipes/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete recipe');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete recipe');
    }
  }

  async importRecipes(recipes: Array<{
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    category: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>): Promise<any[]> {
    const response = await apiClient.post('/recipes/import', { recipes });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Import failed');
  }
}

export default new RecipesApi();


