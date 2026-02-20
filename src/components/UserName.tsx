import React from 'react';
import { View, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { PremiumBadge } from './PremiumBadge';
import { Subscription } from '../types/subscription';

interface UserNameProps {
  name: string;
  subscription?: Subscription;
  isPremium?: boolean; // Backward compatibility
  style?: TextStyle;
  badgeSize?: number;
  containerStyle?: ViewStyle;
  numberOfLines?: number;
  variant?: 'titleSmall' | 'titleMedium' | 'headlineSmall' | 'bodySmall' | 'bodyMedium';
}

export const UserName: React.FC<UserNameProps> = ({
  name,
  subscription,
  isPremium,
  style,
  badgeSize = 16,
  containerStyle,
  numberOfLines = 1,
  variant,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text variant={variant} style={style} numberOfLines={numberOfLines}>
        {name}
      </Text>
      <PremiumBadge subscription={subscription} isPremium={isPremium} size={badgeSize} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
