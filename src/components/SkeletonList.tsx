import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonCard from './SkeletonCard';

interface SkeletonListProps {
  count?: number;
  hasImage?: boolean;
  horizontal?: boolean;
}

export default function SkeletonList({
  count = 5,
  hasImage = true,
  horizontal = false,
}: SkeletonListProps) {
  return (
    <View style={[styles.container, horizontal && styles.horizontal]}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard
          key={idx}
          hasImage={hasImage}
          lines={3}
          style={horizontal && styles.horizontalCard}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  horizontal: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  horizontalCard: {
    width: 280,
    marginRight: 12,
  },
});

