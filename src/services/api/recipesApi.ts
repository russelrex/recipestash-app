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
  rating?: number;
  createdAt: string;
  updatedAt: string;
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
  featuredImage?: string; // Base64 encoded or URL
  images?: string[]; // Array of base64 encoded images or URLs
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
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch recipes');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipes');
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
}

export default new RecipesApi();


