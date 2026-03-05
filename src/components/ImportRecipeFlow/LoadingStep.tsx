import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/modernStyles';

interface LoadingStepProps {
  url: string;
}

export default function LoadingStep({ url }: LoadingStepProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseValue, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: spin }, { scale: pulseValue }],
            },
          ]}
        >
          <Icon name="cloud-download" size={80} color={COLORS.primary} />
        </Animated.View>

        <Text style={styles.title}>Importing Recipe...</Text>
        <Text style={styles.description}>
          Extracting recipe data from the website.
        </Text>

        <View style={styles.urlContainer}>
          <Icon name="link-variant" size={16} color={COLORS.textSecondary} />
          <Text style={styles.urlText} numberOfLines={2}>
            {url}
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <LoadingRow text="Fetching page content" />
          <LoadingRow text="Detecting recipe schema" />
          <LoadingRow text="Extracting ingredients" />
          <LoadingRow text="Parsing instructions" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function LoadingRow({ text }: { text: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepDot} />
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...(TYPOGRAPHY.h2 as object),
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    ...(TYPOGRAPHY.body as object),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: SPACING.lg,
    maxWidth: '100%',
  },
  urlText: {
    flex: 1,
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textSecondary,
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  stepText: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.textSecondary,
  },
});

