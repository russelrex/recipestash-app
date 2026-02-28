import apiClient from './config';
import { Subscription } from '../types/subscription';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  recipeId?: string;
  recipeTitle?: string;
  recipeImages?: string[];
  imageUrl?: string;
  likes: string[];
  likesCount: number;
  commentsCount: number;
  /** When true, backend indicates current user liked this post (used when likes array not populated on list). */
  isLiked?: boolean;
  userIsPremium?: boolean; // Legacy support
  userSubscription?: Subscription; // New subscription-based
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userIsPremium?: boolean; // Legacy support
  userSubscription?: Subscription; // New subscription-based
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
  total?: number;
  hasMore: boolean;
  page?: number;
  totalCount?: number;
}

class PostsApi {
  /** Normalize likes to string[] whether backend sends IDs or objects; ensures likes survive refresh. */
  private normalizeLikes(raw: any): string[] {
    const arr = raw?.likes ?? raw?.likedBy ?? raw?.likeIds;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item: any) => {
        if (item == null) return null;
        if (typeof item === 'string') return item;
        return item._id ?? item.id ?? item.userId ?? null;
      })
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
  }

  private normalizePost(raw: any): Post {
    const id = raw?.id ?? raw?._id;
    const userId = raw?.userId ?? raw?.user?._id ?? raw?.user?.id ?? raw?.author?._id ?? raw?.author?.id;
    const userName = raw?.userName ?? raw?.user?.name ?? raw?.author?.name;
    const userIsPremium =
      raw?.userIsPremium === true ||
      raw?.isPremium === true ||
      raw?.user?.isPremium === true ||
      raw?.author?.isPremium === true;
    // Extract subscription from various possible locations
    const userSubscription =
      raw?.userSubscription ||
      raw?.user?.subscription ||
      raw?.author?.subscription ||
      (raw?.userIsPremium || raw?.isPremium || raw?.user?.isPremium || raw?.author?.isPremium
        ? { isPremium: true, tier: 'premium' as const }
        : undefined);
    const likes = this.normalizeLikes(raw);
    const likesCount =
      typeof raw?.likesCount === 'number' ? raw.likesCount : likes.length;
    const isLiked = raw?.isLiked === true;
    return {
      ...raw,
      id,
      userId,
      userName,
      userIsPremium: userIsPremium || undefined,
      userSubscription: userSubscription,
      likes,
      likesCount,
      isLiked,
      commentsCount: typeof raw?.commentsCount === 'number' ? raw.commentsCount : 0,
    } as Post;
  }

  private normalizeComment(raw: any): Comment {
    const id = raw?.id ?? raw?._id;
    const postId = raw?.postId ?? raw?.post ?? raw?.post?._id ?? raw?.post?.id;
    const userIsPremium =
      raw?.userIsPremium === true ||
      raw?.isPremium === true ||
      raw?.user?.isPremium === true ||
      raw?.author?.isPremium === true;
    const userSubscription =
      raw?.userSubscription ||
      raw?.user?.subscription ||
      raw?.author?.subscription ||
      (userIsPremium ? { isPremium: true, tier: 'premium' as const } : undefined);
    return {
      ...raw,
      id,
      postId,
      userIsPremium: userIsPremium || undefined,
      userSubscription: userSubscription,
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
      // Backend may return { posts, hasMore, page, totalCount } at top level or under .data
      const payload = response.data?.data ?? response.data;
      const rawPosts = Array.isArray(payload?.posts) ? payload.posts : [];
      const posts = rawPosts.map((p: any) => this.normalizePost(p));
      return {
        posts,
        hasMore: typeof payload?.hasMore === 'boolean' ? payload.hasMore : false,
        total: payload?.totalCount ?? payload?.total,
        page: payload?.page ?? page,
        totalCount: payload?.totalCount ?? payload?.total,
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
      const raw = response.data?.data ?? response.data;
      return this.normalizePost(raw);
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
      const data = response.data?.data ?? response.data;
      if (data && typeof data === 'object') {
        return this.normalizePost(data);
      }
      throw new Error('Invalid response from like toggle');
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
