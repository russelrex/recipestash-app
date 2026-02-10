import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

// ============================================================================
// PULSE ANIMATION
// ============================================================================

interface PulseProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const Pulse: React.FC<PulseProps> = ({ style, children }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [pulseAnim]);

  return (
    <Animated.View style={[style, { opacity: pulseAnim }]}>
      {children}
    </Animated.View>
  );
};

// ============================================================================
// SHIMMER ANIMATION
// ============================================================================

interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.shimmerContainer,
        { width, height, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerGradient,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

// Skeleton Circle (for avatars)
interface SkeletonCircleProps {
  size: number;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({ size }) => (
  <Pulse>
    <View
      style={[
        styles.skeleton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  </Pulse>
);

// Skeleton Rectangle (for text lines, images, etc.)
interface SkeletonRectangleProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonRectangle: React.FC<SkeletonRectangleProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => (
  <Pulse>
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        style,
      ]}
    />
  </Pulse>
);

// Skeleton Text Line
interface SkeletonTextProps {
  width?: number | string;
  lines?: number;
  gap?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  width = '100%',
  lines = 1,
  gap = 8,
}) => (
  <View style={{ gap }}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonRectangle
        key={index}
        width={index === lines - 1 ? '80%' : width}
        height={16}
      />
    ))}
  </View>
);

// ============================================================================
// PAGE-SPECIFIC LOADING SKELETONS
// ============================================================================

// Profile Card Skeleton
export const ProfileCardSkeleton: React.FC = () => (
  <Pulse>
    <View style={styles.card}>
      {/* Avatar */}
      <View style={styles.centerContent}>
        <SkeletonCircle size={100} />
      </View>

      {/* Name */}
      <View style={[styles.centerContent, { marginTop: 16 }]}>
        <SkeletonRectangle width={150} height={24} />
      </View>

      {/* Bio */}
      <View style={[styles.centerContent, { marginTop: 8 }]}>
        <SkeletonRectangle width={100} height={14} />
      </View>

      {/* Edit Button */}
      <View style={[styles.centerContent, { marginTop: 16 }]}>
        <SkeletonRectangle width={120} height={40} borderRadius={20} />
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { marginTop: 20 }]}>
        <SkeletonRectangle width={60} height={50} />
        <SkeletonRectangle width={60} height={50} />
        <SkeletonRectangle width={60} height={50} />
        <SkeletonRectangle width={60} height={50} />
      </View>
    </View>
  </Pulse>
);

// Recipe Card Skeleton
export const RecipeCardSkeleton: React.FC = () => (
  <Pulse>
    <View style={styles.card}>
      <View style={styles.recipeCardRow}>
        {/* Image */}
        <SkeletonRectangle width={120} height={120} borderRadius={12} />

        {/* Content */}
        <View style={styles.recipeCardContent}>
          <SkeletonRectangle width="100%" height={20} />
          <SkeletonRectangle width="80%" height={16} style={{ marginTop: 8 }} />
          <SkeletonRectangle width="60%" height={16} style={{ marginTop: 8 }} />

          {/* Tags */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <SkeletonRectangle width={60} height={24} borderRadius={12} />
            <SkeletonRectangle width={80} height={24} borderRadius={12} />
          </View>
        </View>
      </View>
    </View>
  </Pulse>
);

// Post Card Skeleton
export const PostCardSkeleton: React.FC = () => (
  <Pulse>
    <View style={styles.card}>
      {/* Header with avatar and name */}
      <View style={styles.postHeader}>
        <SkeletonCircle size={40} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonRectangle width={120} height={16} />
          <SkeletonRectangle width={80} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Content */}
      <View style={{ marginTop: 16 }}>
        <SkeletonText lines={3} gap={8} />
      </View>

      {/* Footer actions */}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
        <SkeletonRectangle width={60} height={30} borderRadius={15} />
        <SkeletonRectangle width={60} height={30} borderRadius={15} />
      </View>
    </View>
  </Pulse>
);

// List of Recipe Cards
interface RecipeListSkeletonProps {
  count?: number;
}

export const RecipeListSkeleton: React.FC<RecipeListSkeletonProps> = ({
  count = 3,
}) => (
  <View style={{ gap: 12 }}>
    {Array.from({ length: count }).map((_, index) => (
      <RecipeCardSkeleton key={index} />
    ))}
  </View>
);

// List of Post Cards
interface PostListSkeletonProps {
  count?: number;
}

export const PostListSkeleton: React.FC<PostListSkeletonProps> = ({
  count = 3,
}) => (
  <View style={{ gap: 12 }}>
    {Array.from({ length: count }).map((_, index) => (
      <PostCardSkeleton key={index} />
    ))}
  </View>
);

// Full Page Loading Spinner
export const FullPageLoader: React.FC = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.fullPageLoader}>
      <Animated.View
        style={[
          styles.spinner,
          {
            transform: [{ rotate }],
          },
        ]}
      />
    </View>
  );
};

// Small Inline Spinner
export const InlineLoader: React.FC<{ size?: number }> = ({ size = 24 }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.inlineSpinner,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: size / 8,
          transform: [{ rotate }],
        },
      ]}
    />
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  shimmerContainer: {
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },

  shimmerGradient: {
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },

  skeleton: {
    backgroundColor: '#E5E7EB',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  centerContent: {
    alignItems: 'center',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  recipeCardRow: {
    flexDirection: 'row',
  },

  recipeCardContent: {
    flex: 1,
    marginLeft: 12,
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  fullPageLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },

  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    borderTopColor: '#B15912',
  },

  inlineSpinner: {
    borderColor: '#E5E7EB',
    borderTopColor: '#B15912',
  },
});

