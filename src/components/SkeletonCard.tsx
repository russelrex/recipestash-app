import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import ShimmerLoader from './ShimmerLoader';

interface SkeletonCardProps {
  hasImage?: boolean;
  lines?: number;
  style?: ViewStyle | ViewStyle[];
}

export default function SkeletonCard({
  hasImage = false,
  lines = 3,
  style,
}: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      {hasImage && (
        <ShimmerLoader
          width="100%"
          height={180}
          borderRadius={12}
          style={styles.image}
        />
      )}
      <View style={styles.content}>
        <ShimmerLoader
          width="70%"
          height={24}
          borderRadius={6}
          style={styles.title}
        />
        {Array.from({ length: lines }).map((_, idx) => (
          <ShimmerLoader
            key={idx}
            width={idx === lines - 1 ? '50%' : '90%'}
            height={16}
            borderRadius={4}
            style={styles.line}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
  title: {
    marginBottom: 4,
  },
  line: {},
});

