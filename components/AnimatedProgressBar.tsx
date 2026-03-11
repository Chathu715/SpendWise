import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  progress: number; // 0–100
  color: string;
  trackColor: string;
  height?: number;
  delay?: number;
  borderRadius?: number;
}

export function AnimatedProgressBar({
  progress,
  color,
  trackColor,
  height = 6,
  delay = 200,
  borderRadius = 5,
}: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(Math.min(progress, 100), {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [progress]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius }]}>
      <Animated.View
        style={[styles.fill, animStyle, { backgroundColor: color, height, borderRadius }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
