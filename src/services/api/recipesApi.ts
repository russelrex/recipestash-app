import apiClient from './config';

export interface Recipe {
  id: string;
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
  imageUrl?: string;
  isFavorite?: boolean;
  rating?: number;
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
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create recipe');
    }
  }

  async getAllRecipes(): Promise<Recipe[]> {
    try {
      const response = await apiClient.get('/recipes');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipes');
    }
  }

  async getRecipe(id: string): Promise<Recipe> {
    try {
      const response = await apiClient.get(`/recipes/${id}`);
      return response.data.data;
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

  async updateRecipe(id: string, data: Partial<CreateRecipeData>): Promise<Recipe> {
    try {
      const response = await apiClient.patch(`/recipes/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update recipe');
    }
  }

  async toggleFavorite(id: string): Promise<Recipe> {
    try {
      const response = await apiClient.patch(`/recipes/${id}/favorite`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle favorite');
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      await apiClient.delete(`/recipes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete recipe');
    }
  }
}

export default new RecipesApi();


