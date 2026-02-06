import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerLoader from './ShimmerLoader';

export default function SkeletonProfileHeader() {
  return (
    <View style={styles.container}>
      <ShimmerLoader width={100} height={100} borderRadius={50} style={styles.avatar} />

      <ShimmerLoader width={150} height={24} borderRadius={6} style={styles.name} />

      <ShimmerLoader width="80%" height={16} borderRadius={4} style={styles.bio} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <ShimmerLoader width={40} height={28} borderRadius={6} />
          <ShimmerLoader width={60} height={14} borderRadius={4} style={styles.statLabel} />
        </View>
        <View style={styles.stat}>
          <ShimmerLoader width={40} height={28} borderRadius={6} />
          <ShimmerLoader width={60} height={14} borderRadius={4} style={styles.statLabel} />
        </View>
        <View style={styles.stat}>
          <ShimmerLoader width={40} height={28} borderRadius={6} />
          <ShimmerLoader width={60} height={14} borderRadius={4} style={styles.statLabel} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 8,
  },
  bio: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 32,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    marginTop: 4,
  },
});

