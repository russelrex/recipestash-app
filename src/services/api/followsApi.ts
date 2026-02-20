import apiClient from './config';

export interface Follow {
  id: string;
  followerId: string;
  followerName: string;
  followerIsPremium?: boolean;
  followingId: string;
  followingName: string;
  followingIsPremium?: boolean;
  createdAt: string;
}

export interface FollowStats {
  userId: string;
  followersCount: number;
  followingCount: number;
}

export interface SuggestedUser {
  id: string;
  name: string;
  isPremium?: boolean;
  createdAt: string;
  updatedAt: string;
  followersCount: number;
  followingCount: number;
}

class FollowsApi {
  async follow(userId: string): Promise<Follow> {
    try {
      const response = await apiClient.post(`/follows/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to follow user');
    }
  }

  async unfollow(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/follows/${userId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unfollow user');
    }
  }

  async isFollowing(userId: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/follows/check/${userId}`);
      return response.data.data.isFollowing;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check follow status');
    }
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    try {
      const response = await apiClient.get(`/follows/followers/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch followers');
    }
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    try {
      const response = await apiClient.get(`/follows/following/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch following');
    }
  }

  async getStats(userId: string): Promise<FollowStats> {
    try {
      const response = await apiClient.get(`/follows/stats/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stats');
    }
  }

  async isMutual(userId: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/follows/mutual/${userId}`);
      return response.data.data.isMutual;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check mutual follow');
    }
  }

  async getSuggestions(limit: number = 10): Promise<SuggestedUser[]> {
    try {
      const response = await apiClient.get('/follows/suggestions', {
        params: { limit },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch suggestions');
    }
  }

  async getMyFollowers(): Promise<Follow[]> {
    try {
      const response = await apiClient.get('/follows/my-followers');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your followers');
    }
  }

  async getMyFollowing(): Promise<Follow[]> {
    try {
      const response = await apiClient.get('/follows/my-following');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your following');
    }
  }

  async blockUser(userId: string): Promise<any> {
    const response = await apiClient.post(`/follows/block/${userId}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to block user');
  }

  async unblockUser(userId: string): Promise<void> {
    const response = await apiClient.delete(`/follows/block/${userId}`);
    if (!response.data.success) throw new Error(response.data.message || 'Failed to unblock user');
  }

  async getBlockedUsers(): Promise<{ id: string; name: string; blockedAt: string }[]> {
    const response = await apiClient.get('/follows/blocked');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch blocked users');
  }
}

export default new FollowsApi();
