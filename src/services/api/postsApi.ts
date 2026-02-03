import apiClient from './config';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  recipeId?: string;
  recipeTitle?: string;
  recipeImages?: string[]; // Add this - will store up to 3 images from recipe
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
  private normalizePost(raw: any): Post {
    const id = raw?.id ?? raw?._id;
    return {
      ...raw,
      id,
      likes: Array.isArray(raw?.likes) ? raw.likes : [],
      likesCount:
        typeof raw?.likesCount === 'number'
          ? raw.likesCount
          : Array.isArray(raw?.likes)
            ? raw.likes.length
            : 0,
      commentsCount: typeof raw?.commentsCount === 'number' ? raw.commentsCount : 0,
    } as Post;
  }

  private normalizeComment(raw: any): Comment {
    const id = raw?.id ?? raw?._id;
    const postId = raw?.postId ?? raw?.post ?? raw?.post?._id ?? raw?.post?.id;
    return {
      ...raw,
      id,
      postId,
    } as Comment;
  }

  private assertId(id: string | undefined | null, label: string): asserts id is string {
    if (!id || id === 'null' || id.trim?.() === '') {
      throw new Error(`${label} is missing`);
    }
  }

  async createPost(data: CreatePostData): Promise<Post> {
    try {
      const response = await apiClient.post('/posts', data);
      return this.normalizePost(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create post');
    }
  }

  async getPosts(page: number = 1, limit: number = 20): Promise<PostsResponse> {
    try {
      const response = await apiClient.get('/posts', {
        params: { page, limit },
      });
      const data = response.data.data;
      return {
        ...data,
        posts: Array.isArray(data?.posts) ? data.posts.map((p: any) => this.normalizePost(p)) : [],
      } as PostsResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch posts');
    }
  }

  async getMyPosts(): Promise<Post[]> {
    try {
      const response = await apiClient.get('/posts/my-posts');
      return Array.isArray(response.data.data)
        ? response.data.data.map((p: any) => this.normalizePost(p))
        : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your posts');
    }
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const response = await apiClient.get(`/posts/user/${userId}`);
      return Array.isArray(response.data.data)
        ? response.data.data.map((p: any) => this.normalizePost(p))
        : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }

  async getPostsByRecipe(recipeId: string): Promise<Post[]> {
    try {
      const response = await apiClient.get(`/posts/recipe/${recipeId}`);
      return Array.isArray(response.data.data)
        ? response.data.data.map((p: any) => this.normalizePost(p))
        : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipe posts');
    }
  }

  async getPost(id: string): Promise<Post> {
    try {
      const response = await apiClient.get(`/posts/${id}`);
      return this.normalizePost(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch post');
    }
  }

  async updatePost(id: string, data: Partial<CreatePostData>): Promise<Post> {
    try {
      const response = await apiClient.patch(`/posts/${id}`, data);
      return this.normalizePost(response.data.data);
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
      this.assertId(postId, 'postId');
      const response = await apiClient.patch(`/posts/${postId}/like`);
      return this.normalizePost(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle like');
    }
  }

  // Comments
  async createComment(postId: string, data: CreateCommentData): Promise<Comment> {
    try {
      this.assertId(postId, 'postId');
      const response = await apiClient.post(`/posts/${postId}/comments`, data);
      return this.normalizeComment(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add comment');
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    try {
      this.assertId(postId, 'postId');
      const response = await apiClient.get(`/posts/${postId}/comments`);
      return Array.isArray(response.data.data)
        ? response.data.data.map((c: any) => this.normalizeComment(c))
        : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      this.assertId(commentId, 'commentId');
      await apiClient.delete(`/posts/comments/${commentId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete comment');
    }
  }
}

export default new PostsApi();
