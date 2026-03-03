import apiClient from './config';

export type SubscriptionPlan = 'free' | 'premium';

export type SubscriptionLifecycleStatus =
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'inactive';

export interface SubscriptionSummary {
  plan: SubscriptionPlan | null | undefined;
  subscriptionEndsAt: string | null;
  subscriptionStatus: SubscriptionLifecycleStatus | string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface SubscriptionPayment {
  id: string;
  userId: string;
  provider: string;
  checkoutSessionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  purpose: string;
  createdAt: string;
  paidAt?: string;
}

export interface SubscriptionResponse {
  subscription: SubscriptionSummary | null;
  payments: SubscriptionPayment[];
}

export interface CheckoutResponse {
  checkoutUrl: string;
  paymentId: string;
}

export interface RecipeLimitCheckResponse {
  allowed: boolean;
  message?: string;
}

class SubscriptionApi {
  async getSubscription(): Promise<SubscriptionResponse> {
    try {
      const response = await apiClient.get('/subscriptions');
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Get subscription failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message || 'Failed to fetch subscription',
      );
    }
  }

  async canCreateRecipe(): Promise<RecipeLimitCheckResponse> {
    try {
      const response = await apiClient.get(
        '/subscriptions/can-create-recipe',
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Recipe limit check failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const allowedFromResponse = error.response?.data?.allowed;
      if (typeof allowedFromResponse === 'boolean') {
        return {
          allowed: allowedFromResponse,
          message: error.response?.data?.message,
        };
      }
      return {
        allowed: true,
        message:
          error.response?.data?.message ||
          'Unable to verify recipe creation limit',
      };
    }
  }

  async createCheckout(plan: 'monthly' | 'yearly'): Promise<CheckoutResponse> {
    try {
      const response = await apiClient.post('/subscriptions/checkout', {
        plan,
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Create checkout failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message || 'Failed to create checkout',
      );
    }
  }
}

export default new SubscriptionApi();

