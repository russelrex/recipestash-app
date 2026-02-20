import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Subscription } from '../types/subscription';
import { COLORS } from '../styles/modernStyles';

interface PremiumBadgeProps {
  subscription?: Subscription;
  isPremium?: boolean; // Backward compatibility
  size?: number;
  style?: ViewStyle;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  subscription,
  isPremium,
  size = 16,
  style,
}) => {
  // Check if user is premium (from subscription or legacy boolean)
  const userIsPremium =
    subscription?.isPremium === true || isPremium === true;

  // Don't render if not premium
  if (!userIsPremium) {
    return null;
  }

  // Get tier (default to 'premium' if using legacy boolean)
  const tier = subscription?.tier || 'premium';

  // Different icons for different tiers
  const getIconName = () => {
    switch (tier) {
      case 'pro':
        return 'crown'; // 👑 Crown for Pro tier
      case 'premium':
        return 'check-decagram'; // ⭐ Checkmark for Premium
      default:
        return 'check-decagram';
    }
  };

  // Different colors for different tiers
  const getIconColor = () => {
    switch (tier) {
      case 'pro':
        return '#FFD700'; // Gold for Pro
      case 'premium':
        return COLORS.primary; // Brand color for Premium
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={[styles.badge, style]}>
      <Icon name={getIconName()} size={size} color={getIconColor()} />
    </View>
  );
};

export const PremiumBadgeSolid: React.FC<PremiumBadgeProps> = ({
  subscription,
  isPremium,
  size = 16,
  style,
}) => {
  const userIsPremium =
    subscription?.isPremium === true || isPremium === true;
  if (!userIsPremium) return null;

  const tier = subscription?.tier || 'premium';
  const iconName = tier === 'pro' ? 'crown' : 'check-decagram';

  return (
    <View style={[styles.badgeSolid, style]}>
      <Icon name={iconName} size={size} color="#fff" />
    </View>
  );
};

export const PremiumBadgeGold: React.FC<PremiumBadgeProps> = ({
  subscription,
  isPremium,
  size = 16,
  style,
}) => {
  const userIsPremium =
    subscription?.isPremium === true || isPremium === true;
  if (!userIsPremium) return null;

  return (
    <View style={[styles.badge, style]}>
      <Icon name="check-decagram" size={size} color="#FFD700" />
    </View>
  );
};

// Helper function to check if user is premium
export const isPremiumUser = (subscription?: Subscription): boolean => {
  return subscription?.isPremium === true;
};

const styles = StyleSheet.create({
  badge: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSolid: {
    marginLeft: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
