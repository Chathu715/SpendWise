import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const { theme } = useTheme();
  const { session, loading } = useAuth();
  const insets = useSafeAreaInsets();

  // Logo animations
  const logoScale   = useSharedValue(0.4);
  const logoRotate  = useSharedValue(-20);
  const logoOpacity = useSharedValue(0);

  // Glow ring animations
  const ring1Scale   = useSharedValue(1);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale   = useSharedValue(1);
  const ring2Opacity = useSharedValue(0);

  // Text animations
  const textOpacity  = useSharedValue(0);
  const textTransY   = useSharedValue(20);

  // Tagline animation
  const taglineOpacity = useSharedValue(0);

  // Dots animations
  const dot0Opacity = useSharedValue(0);
  const dot1Opacity = useSharedValue(0);
  const dot2Opacity = useSharedValue(0);

  // Screen fade
  const screenOpacity = useSharedValue(1);

  function onNavigate() {
    if (session) {
      router.replace('/(app)');
    } else {
      router.replace('/(auth)/login');
    }
  }

  useEffect(() => {
    if (loading) return;

    // Logo entrance
    logoOpacity.value = withTiming(1, { duration: 300 });
    logoScale.value   = withSpring(1, { damping: 12, stiffness: 120 });
    logoRotate.value  = withSpring(0, { damping: 15, stiffness: 100 });

    // Glow rings
    ring1Opacity.value = withTiming(0.5, { duration: 200 });
    ring1Scale.value   = withTiming(2.2, { duration: 1600, easing: Easing.out(Easing.ease) });
    ring1Opacity.value = withSequence(
      withTiming(0.5, { duration: 100 }),
      withDelay(200, withTiming(0, { duration: 1400 }))
    );

    ring2Opacity.value = withDelay(400, withSequence(
      withTiming(0.4, { duration: 100 }),
      withTiming(0, { duration: 1400 })
    ));
    ring2Scale.value   = withDelay(400, withTiming(2.2, { duration: 1600, easing: Easing.out(Easing.ease) }));

    // Text entrance at 900ms
    textOpacity.value = withDelay(900,  withTiming(1, { duration: 600 }));
    textTransY.value  = withDelay(900,  withSpring(0, { damping: 18 }));

    // Tagline at 1700ms
    taglineOpacity.value = withDelay(1700, withTiming(1, { duration: 800 }));

    // Dots at 2400ms
    dot0Opacity.value = withDelay(2400, withSpring(1));
    dot1Opacity.value = withDelay(2550, withTiming(1, { duration: 300 }));
    dot2Opacity.value = withDelay(2700, withTiming(1, { duration: 300 }));

    // Fade out at 3400ms and navigate
    screenOpacity.value = withDelay(
      3400,
      withTiming(0, { duration: 700 }, (finished) => {
        if (finished) runOnJS(onNavigate)();
      })
    );
  }, [loading]);

  const screenStyle    = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));
  const logoStyle      = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));
  const ring1Style     = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }));
  const ring2Style     = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));
  const textStyle      = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTransY.value }],
  }));
  const taglineStyle   = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const dot0Style      = useAnimatedStyle(() => ({ opacity: dot0Opacity.value }));
  const dot1Style      = useAnimatedStyle(() => ({ opacity: dot1Opacity.value }));
  const dot2Style      = useAnimatedStyle(() => ({ opacity: dot2Opacity.value }));

  return (
    <Animated.View style={[styles.root, { backgroundColor: theme.bg }, screenStyle]}>
      <LinearGradient
        colors={['transparent', 'transparent']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Radial glow */}
      <View
        style={[
          styles.radialGlow,
          { backgroundColor: theme.acc + '18' },
        ]}
        pointerEvents="none"
      />

      <View style={styles.center}>
        {/* Logo container */}
        <View style={styles.logoContainer}>
          {/* Glow rings */}
          <Animated.View
            style={[
              styles.glowRing,
              { borderColor: theme.acc + '30' },
              ring1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.glowRing,
              { borderColor: theme.acc + '18' },
              ring2Style,
            ]}
          />

          {/* Logo */}
          <Animated.View style={logoStyle}>
            <LinearGradient
              colors={['#6C63FF', '#9B8FFF']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
              style={[
                styles.logo,
                {
                  shadowColor: theme.acc,
                },
              ]}
            >
              <Wallet size={44} color="#fff" strokeWidth={1.5} />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* App name */}
        <Animated.View style={[styles.nameWrap, textStyle]}>
          <Text style={[styles.appName, { fontFamily: 'Sora_800ExtraBold' }]}>
            <Text style={{ color: theme.text }}>Spend</Text>
            <Text style={{ color: theme.acc }}>Wise</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={taglineStyle}>
          <Text
            style={[
              styles.tagline,
              { color: theme.sub, fontFamily: 'Sora_700Bold' },
            ]}
          >
            YOUR MONEY. YOUR CLARITY.
          </Text>
        </Animated.View>

        {/* Pagination dots */}
        <View style={styles.dots}>
          <Animated.View
            style={[styles.dotWide, { backgroundColor: theme.acc }, dot0Style]}
          />
          <Animated.View
            style={[styles.dotSmall, { backgroundColor: theme.bord }, dot1Style]}
          />
          <Animated.View
            style={[styles.dotSmall, { backgroundColor: theme.bord }, dot2Style]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: '20%',
    alignSelf: 'center',
    opacity: 0.6,
  },
  center: {
    alignItems: 'center',
    gap: 20,
  },
  logoContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 32,
    borderWidth: 2,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 48,
    elevation: 16,
  },
  nameWrap: {
    alignItems: 'center',
    marginTop: 4,
  },
  appName: {
    fontSize: 36,
    letterSpacing: -1.5,
    lineHeight: 40,
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  dotWide: {
    width: 28,
    height: 8,
    borderRadius: 4,
  },
  dotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
