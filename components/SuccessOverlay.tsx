import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { formatLKR } from '../lib/format';

const AUTO_DISMISS_MS = 2200;

interface Props {
  amount: number;
  category: string;
  onDismiss: () => void;
}

export function SuccessOverlay({ amount, category, onDismiss }: Props) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(100);
  const [dismissed, setDismissed] = useState(false);

  const backdropOpacity = new Animated.Value(0);
  const cardTranslateY = new Animated.Value(40);
  const cardOpacity = new Animated.Value(0);
  const checkScale = new Animated.Value(0);
  const contentOpacity = new Animated.Value(0);
  const contentTransY = new Animated.Value(16);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(cardTranslateY,  { toValue: 0, damping: 14, stiffness: 180, useNativeDriver: true }),
      Animated.timing(cardOpacity,     { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(checkScale,      { toValue: 1, damping: 10,  stiffness: 200, useNativeDriver: true }),
    ]).start();

    // Content after 450ms
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(contentTransY,  { toValue: 0, damping: 18, useNativeDriver: true }),
      ]).start();
    }, 450);

    // Progress drain
    let start: number | null = null;
    const drain = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(remaining);
      if (elapsed < AUTO_DISMISS_MS) requestAnimationFrame(drain);
    };
    requestAnimationFrame(drain);

    // Auto-dismiss
    const t = setTimeout(() => {
      setDismissed(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cardOpacity,     { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.spring(cardTranslateY,  { toValue: 40, damping: 14, stiffness: 180, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(onDismiss, 0);
      });
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(t);
  }, []);

  const countdown = Math.ceil(progress / 100 * AUTO_DISMISS_MS / 1000);

  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 360;
    const distance = 55 + Math.random() * 30;
    const colors = [theme.green, theme.acc, theme.amber, '#A78BFA'];
    return { angle, distance, color: colors[i % 4] };
  });

  return (
    <Animated.View
      style={[
        styles.backdrop,
        { opacity: backdropOpacity },
      ]}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.green + '30',
            transform: [{ translateY: cardTranslateY }],
            opacity: cardOpacity,
          },
        ]}
      >
        {/* Check circle */}
        <View style={styles.iconWrap}>
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <LinearGradient
              colors={[theme.green, '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.checkCircle, { shadowColor: theme.green }]}
            >
              <Check size={38} color="#fff" strokeWidth={2.5} />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Text */}
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTransY }],
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
            Expense Added!
          </Text>
          <Text style={[styles.subtitle, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            Your spending has been recorded
          </Text>
        </Animated.View>

        {/* Amount pill */}
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: theme.green + '15',
              borderColor: theme.green + '35',
              opacity: contentOpacity,
            },
          ]}
        >
          <Text style={[styles.pillAmount, { color: theme.green, fontFamily: 'Sora_800ExtraBold' }]}>
            {formatLKR(amount)}
          </Text>
          <Text style={[styles.pillCat, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
            {category.toUpperCase()}
          </Text>
        </Animated.View>

        {/* Drain bar */}
        <Animated.View style={[styles.drainWrap, { opacity: contentOpacity }]}>
          <View style={styles.drainHeader}>
            <Text style={[styles.drainLabel, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              Returning automatically…
            </Text>
            <Text style={[styles.drainCount, { color: theme.green, fontFamily: 'Sora_700Bold' }]}>
              {countdown}s
            </Text>
          </View>
          <View style={[styles.drainTrack, { backgroundColor: theme.bord }]}>
            <View
              style={[
                styles.drainFill,
                {
                  backgroundColor: theme.green,
                  width: `${progress}%` as any,
                },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  card: {
    width: 280,
    borderRadius: 28,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.6,
    shadowRadius: 64,
    elevation: 20,
  },
  iconWrap: {
    position: 'relative',
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 36,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  pill: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  pillAmount: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  pillCat: {
    fontSize: 10,
    letterSpacing: 1,
  },
  drainWrap: {
    width: '100%',
    gap: 6,
  },
  drainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  drainLabel: {
    fontSize: 10,
  },
  drainCount: {
    fontSize: 10,
  },
  drainTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  drainFill: {
    height: '100%',
    borderRadius: 2,
  },
});
