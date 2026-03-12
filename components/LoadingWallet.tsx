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
  dx: number;   // horizontal drift toward wallet center (px)
  size: number;
  anim: Animated.Value;
}

export function LoadingWallet({ targetAmount = 0 }: Props) {
  const { theme } = useTheme();
  const walletAnim = useRef(new Animated.Value(1)).current;
  const [count, setCount] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const coinIdRef = useRef(0);

  // Pick a display target — use real amount if provided, else animate to a random value
  const displayTarget = useRef(
    targetAmount > 0 ? targetAmount : Math.floor(80000 + Math.random() * 420000)
  ).current;

  // Wallet pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(walletAnim, { toValue: 1.1, duration: 650, useNativeDriver: true }),
        Animated.timing(walletAnim, { toValue: 1.0, duration: 650, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // LKR counter — always runs, counts up to displayTarget
  useEffect(() => {
    let frameId: number;
    let start: number | null = null;
    const duration = 2200;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(displayTarget * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [displayTarget]);

  // Spawn coins continuously
  useEffect(() => {
    const spawnCoin = () => {
      const id = coinIdRef.current++;
      const anim = new Animated.Value(0);
      const x = 10 + Math.random() * 80;        // spread across stage width
      const dx = (50 - x) * 1.4;               // converge toward center (50%)
      setCoins((prev) => [
        ...prev.slice(-8),
        { id, x, dx, size: 9 + Math.random() * 9, anim },
      ]);
      Animated.timing(anim, {
        toValue: 1,
        duration: 800 + Math.random() * 500,
        useNativeDriver: true,
      }).start(() => {
        setCoins((prev) => prev.filter((c) => c.id !== id));
      });
    };
    spawnCoin();
    const interval = setInterval(spawnCoin, 180);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Coin rain area — separate layer so coins aren't clipped by wallet box */}
      <View style={styles.coinStage} pointerEvents="none">
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
                      outputRange: [0, 170],
                    }),
                  },
                  {
                    translateX: coin.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, coin.dx],
                    }),
                  },
                  {
                    scale: coin.anim.interpolate({
                      inputRange: [0, 0.6, 1],
                      outputRange: [1, 0.8, 0.1],
                    }),
                  },
                  {
                    rotate: coin.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '540deg'],
                    }),
                  },
                ],
                opacity: coin.anim.interpolate({
                  inputRange: [0, 0.08, 0.65, 1],
                  outputRange: [0, 1, 0.9, 0],
                }),
              },
            ]}
          />
        ))}
      </View>

      {/* Wallet icon */}
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
  coinStage: {
    position: 'absolute',
    width: '80%',
    height: 200,
    top: '50%',
    marginTop: -170,   // coins travel 170px → land exactly at wallet center
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
