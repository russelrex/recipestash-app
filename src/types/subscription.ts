export interface Subscription {
  isPremium: boolean;
  tier: 'free' | 'premium' | 'pro';
  status?: 'active' | 'expired' | 'cancelled';
  startDate?: string;
  expiryDate?: string;
  paymentMethod?: string;
  subscriptionId?: string;
}

export interface UserBase {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  subscription?: Subscription;
}
