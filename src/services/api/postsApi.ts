import apiClient from './config';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  recipeId?: string;
  recipeTitle?: string;
  imageUrl?: string;
  likes: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  recipeId?: string;
  imageUrl?: string;
}

export interface CreateCommentData {
  content: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  hasMore: boolean;
}

class PostsApi {
  async createPost(data: CreatePostData): Promise<Post> {
    try {
      const response = await apiClient.post('/posts', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create post');
    }
  }

  async getPosts(page: number = 1, limit: number = 20): Promise<PostsResponse> {
    try {
      const response = await apiClient.get('/posts', {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch posts');
    }
  }

  async getMyPosts(): Promise<Post[]> {
    try {
      const response = await apiClient.get('/posts/my-posts');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your posts');
    }
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const response = await apiClient.get(`/posts/user/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }

  async getPostsByRecipe(recipeId: string): Promise<Post[]> {
    try {
      const response = await apiClient.get(`/posts/recipe/${recipeId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipe posts');
    }
  }

  async getPost(id: string): Promise<Post> {
    try {
      const response = await apiClient.get(`/posts/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch post');
    }
  }

  async updatePost(id: string, data: Partial<CreatePostData>): Promise<Post> {
    try {
      const response = await apiClient.patch(`/posts/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update post');
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      await apiClient.delete(`/posts/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete post');
    }
  }

  async toggleLike(postId: string): Promise<Post> {
    try {
      const response = await apiClient.patch(`/posts/${postId}/like`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle like');
    }
  }

  // Comments
  async createComment(postId: string, data: CreateCommentData): Promise<Comment> {
    try {
      const response = await apiClient.post(`/posts/${postId}/comments`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add comment');
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    try {
      const response = await apiClient.get(`/posts/${postId}/comments`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/posts/comments/${commentId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete comment');
    }
  }
}

export default new PostsApi();
