import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShimmerLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export default function ShimmerLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: ShimmerLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    const delay = Math.random() * 200;

    const startAnimation = () => {
      if (!isMounted) return;

      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      );

      animation.start();

      return animation;
    };

    let animation: Animated.CompositeAnimation | undefined;
    const timeoutId = setTimeout(() => {
      animation = startAnimation();
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (animation) {
        animation.stop();
      }
    };
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width, height, borderRadius },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.08)',
          'rgba(255, 255, 255, 0.35)',
          'rgba(255, 255, 255, 0.08)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { opacity }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});

