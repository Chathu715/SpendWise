import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const AUTO_ERROR_MS = 3500;

interface Props {
  message: string;
  onDismiss: () => void;
}

export function ErrorOverlay({ message, onDismiss }: Props) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(100);

  const backdropOpacity = new Animated.Value(0);
  const cardTranslateY  = new Animated.Value(40);
  const cardOpacity     = new Animated.Value(0);
  const shakeAnim       = new Animated.Value(0);
  const contentOpacity  = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(cardTranslateY,  { toValue: 0, damping: 14, stiffness: 180, useNativeDriver: true }),
      Animated.timing(cardOpacity,     { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Shake icon
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 80,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  8, duration: 80,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 70,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  6, duration: 70,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -3, duration: 60,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  3, duration: 60,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 50,  useNativeDriver: true }),
    ]).start();

    // Content
    setTimeout(() => {
      Animated.timing(contentOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 300);

    // Drain bar
    let start: number | null = null;
    const drain = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setProgress(Math.max(0, 100 - (elapsed / AUTO_ERROR_MS) * 100));
      if (elapsed < AUTO_ERROR_MS) requestAnimationFrame(drain);
    };
    requestAnimationFrame(drain);

    // Auto-dismiss
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cardOpacity,     { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => onDismiss());
    }, AUTO_ERROR_MS);

    return () => clearTimeout(t);
  }, []);

  const countdown = Math.ceil(progress / 100 * AUTO_ERROR_MS / 1000);

  const handleBackdropPress = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(cardOpacity,     { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onDismiss());
  };

  return (
    <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.red + '30',
            transform: [{ translateY: cardTranslateY }],
            opacity: cardOpacity,
          },
        ]}
      >
        {/* X icon */}
        <Animated.View
          style={[
            styles.xCircle,
            {
              backgroundColor: theme.red + '15',
              borderColor: theme.red + '40',
              transform: [{ translateX: shakeAnim }],
            },
          ]}
        >
          <X size={38} color={theme.red} strokeWidth={2.5} />
        </Animated.View>

        {/* Message */}
        <Animated.View style={{ opacity: contentOpacity, alignItems: 'center', gap: 4 }}>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
            Oops!
          </Text>
          <Text style={[styles.msg, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            {message}
          </Text>
        </Animated.View>

        {/* Tap hint */}
        <Animated.View
          style={[
            styles.hint,
            {
              backgroundColor: theme.red + '12',
              borderColor: theme.red + '25',
              opacity: contentOpacity,
            },
          ]}
        >
          <View style={[styles.hintDot, { backgroundColor: theme.red }]} />
          <Text style={[styles.hintText, { color: theme.red, fontFamily: 'Sora_700Bold' }]}>
            Tap anywhere to retry
          </Text>
        </Animated.View>

        {/* Drain bar */}
        <Animated.View style={[styles.drainWrap, { opacity: contentOpacity }]}>
          <View style={styles.drainHeader}>
            <Text style={[styles.drainLabel, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              Dismissing automatically…
            </Text>
            <Text style={[styles.drainCount, { color: theme.red, fontFamily: 'Sora_700Bold' }]}>
              {countdown}s
            </Text>
          </View>
          <View style={[styles.drainTrack, { backgroundColor: theme.bord }]}>
            <View
              style={[styles.drainFill, { backgroundColor: theme.red, width: `${progress}%` as any }]}
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
    backgroundColor: 'rgba(0,0,0,0.65)',
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
  xCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  msg: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hintText: {
    fontSize: 12,
  },
  drainWrap: { width: '100%', gap: 6 },
  drainHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  drainLabel: { fontSize: 10 },
  drainCount: { fontSize: 10 },
  drainTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  drainFill:  { height: '100%', borderRadius: 2 },
});
