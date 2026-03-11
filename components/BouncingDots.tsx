import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface Props {
  color?: string;
  size?: number;
  gap?: number;
}

export function BouncingDots({ color = '#fff', size = 7, gap = 6 }: Props) {
  const scales = [
    useSharedValue(0.6),
    useSharedValue(0.6),
    useSharedValue(0.6),
  ];
  const opacities = [
    useSharedValue(0.4),
    useSharedValue(0.4),
    useSharedValue(0.4),
  ];

  useEffect(() => {
    scales.forEach((s, i) => {
      s.value = withDelay(
        i * 200,
        withRepeat(
          withSequence(
            withTiming(1.0, { duration: 400 }),
            withTiming(0.6, { duration: 400 })
          ),
          -1,
          false
        )
      );
    });
    opacities.forEach((o, i) => {
      o.value = withDelay(
        i * 200,
        withRepeat(
          withSequence(
            withTiming(1.0, { duration: 400 }),
            withTiming(0.4, { duration: 400 })
          ),
          -1,
          false
        )
      );
    });
  }, []);

  const styles0 = useAnimatedStyle(() => ({
    transform: [{ scale: scales[0].value }],
    opacity: opacities[0].value,
  }));
  const styles1 = useAnimatedStyle(() => ({
    transform: [{ scale: scales[1].value }],
    opacity: opacities[1].value,
  }));
  const styles2 = useAnimatedStyle(() => ({
    transform: [{ scale: scales[2].value }],
    opacity: opacities[2].value,
  }));

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    marginHorizontal: gap / 2,
  };

  return (
    <View style={styles.row}>
      <Animated.View style={[dotStyle, styles0]} />
      <Animated.View style={[dotStyle, styles1]} />
      <Animated.View style={[dotStyle, styles2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
