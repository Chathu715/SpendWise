import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet } from 'lucide-react-native';
import { BouncingDots } from './BouncingDots';
import { useTheme } from '../context/ThemeContext';
import { formatLKR } from '../lib/format';

interface Props {
  targetAmount?: number;
}

interface Coin {
  id: number;
  x: number;
  size: number;
  anim: Animated.Value;
}

export function LoadingWallet({ targetAmount = 0 }: Props) {
  const { theme } = useTheme();
  const walletAnim = useRef(new Animated.Value(1)).current;
  const [count, setCount] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const coinIdRef = useRef(0);

  // Wallet pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(walletAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(walletAnim, { toValue: 1.0,  duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // LKR counter
  useEffect(() => {
    if (targetAmount === 0) return;
    let start: number | null = null;
    const duration = 1800;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(targetAmount * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [targetAmount]);

  // Spawn coins
  useEffect(() => {
    const spawnCoin = () => {
      const id = coinIdRef.current++;
      const anim = new Animated.Value(0);
      setCoins((prev) => [
        ...prev.slice(-5),
        { id, x: 30 + Math.random() * 40, size: 10 + Math.random() * 8, anim },
      ]);
      Animated.timing(anim, {
        toValue: 1,
        duration: 900 + Math.random() * 400,
        useNativeDriver: true,
      }).start(() => {
        setCoins((prev) => prev.filter((c) => c.id !== id));
      });
    };
    const interval = setInterval(spawnCoin, 220);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Wallet + falling coins */}
      <View style={styles.walletWrap}>
        {coins.map((coin) => (
          <Animated.View
            key={coin.id}
            style={[
              styles.coin,
              {
                left: `${coin.x}%` as any,
                width: coin.size,
                height: coin.size,
                borderRadius: coin.size / 2,
                backgroundColor: theme.amber,
                transform: [
                  {
                    translateY: coin.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-60, 80],
                    }),
                  },
                  {
                    rotate: coin.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: coin.anim.interpolate({
                  inputRange: [0, 0.15, 0.8, 1],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            ]}
          />
        ))}
        <Animated.View style={{ transform: [{ scale: walletAnim }] }}>
          <LinearGradient
            colors={['#6C63FF', '#9B8FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletBg}
          >
            <Wallet size={40} color="#fff" strokeWidth={1.5} />
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Counter */}
      <View style={styles.counterWrap}>
        <Text style={[styles.label, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
          LOADING
        </Text>
        <Text style={[styles.counter, { color: theme.acc, fontFamily: 'Sora_800ExtraBold' }]}>
          {formatLKR(count)}
        </Text>
      </View>

      <BouncingDots color={theme.acc} size={7} gap={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  walletWrap: {
    position: 'relative',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coin: {
    position: 'absolute',
    top: 0,
  },
  walletBg: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 12,
  },
  counterWrap: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  counter: {
    fontSize: 28,
    letterSpacing: -1,
  },
});
