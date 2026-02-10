import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, ViewStyle } from 'react-native';

interface ShimmerLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ShimmerLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: ShimmerLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const containerStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    borderRadius,
  };

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});

