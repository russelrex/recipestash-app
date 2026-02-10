import { Platform, StyleSheet } from 'react-native';

// Modern iOS-inspired color palette
export const COLORS = {
  // Backgrounds
  background: '#F5F7FA', // Light gray background
  backgroundLight: '#FAFBFC', // Even lighter

  // Cards
  cardBackground: '#FFFFFF', // Pure white cards
  cardBackgroundAlt: '#F8F9FA', // Slightly tinted

  // Primary colors (brown/orange theme)
  primary: '#B15912', // Main orange-brown
  primaryLight: '#D4793C', // Lighter variant
  primaryDark: '#8B4510', // Darker variant
  primaryAlpha10: 'rgba(177, 89, 18, 0.1)',
  primaryAlpha20: 'rgba(177, 89, 18, 0.2)',

  // Greens
  green: '#517831', // Green accent
  greenLight: '#6B9F4A',
  greenAlpha10: 'rgba(81, 120, 49, 0.1)',

  // Neutrals
  text: '#1A1A1A', // Almost black
  textSecondary: '#6B7280', // Medium gray
  textLight: '#9CA3AF', // Light gray

  // Borders and separators
  border: '#E5E7EB', // Light gray border
  borderDark: '#D1D5DB', // Slightly darker border

  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

// Modern shadow system (iOS-inspired)
export const SHADOWS = {
  // Subtle shadow for cards
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),

  // Medium shadow for elevated cards
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),

  // Larger shadow for floating elements
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),

  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// Modern card styles
export const CARD_STYLES = StyleSheet.create({
  // Standard card (most common)
  standard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    ...(SHADOWS.small as object),
  },

  // Elevated card (more prominent)
  elevated: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    ...(SHADOWS.medium as object),
  },

  // Flat card (no shadow, just border)
  flat: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Compact card (less padding)
  compact: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    ...(SHADOWS.small as object),
  },

  // Tinted card (slightly colored background)
  tinted: {
    backgroundColor: COLORS.cardBackgroundAlt,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

// Modern typography
export const TYPOGRAPHY = StyleSheet.create({
  // Headers
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },

  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },

  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 24,
  },

  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },

  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // Captions
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textLight,
  },
});

// Spacing system
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Modern button styles
export const BUTTON_STYLES = StyleSheet.create({
  // Primary button
  primary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(SHADOWS.small as object),
  },

  primaryText: {
    ...(TYPOGRAPHY.label as object),
    color: '#fff',
  },

  // Outline button
  outline: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  outlineText: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.primary,
  },

  // Subtle button
  subtle: {
    backgroundColor: COLORS.primaryAlpha10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subtleText: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.primary,
  },

  // Icon button
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...(SHADOWS.small as object),
  },
});

