import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useExpenses } from '../../context/ExpensesContext';
import { CATS } from '../../constants/categories';
import { AnimatedProgressBar } from '../../components/AnimatedProgressBar';
import { formatLKR, getCurrentMonthLabel, getFirstDayOfMonth } from '../../lib/format';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const { expenses } = useExpenses();
  const insets = useSafeAreaInsets();

  const firstDay = getFirstDayOfMonth();
  const monthExpenses = expenses.filter((e) => e.date >= firstDay);
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Weekly data (Mon–Sun of current week)
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

    return days.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const total = expenses
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      const isToday = dateStr === now.toISOString().split('T')[0];
      return { label, total, dateStr, isToday };
    });
  }, [expenses]);

  const maxWeekly = Math.max(...weeklyData.map((d) => d.total), 1);

  // Category breakdown
  const catBreakdown = useMemo(() => {
    return CATS.map((cat) => {
      const catExpenses = monthExpenses.filter((e) => e.category === cat.name);
      const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      const pct = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0;
      return { ...cat, total, pct, count: catExpenses.length };
    })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses, totalSpent]);

  const topCat = catBreakdown[0];

  const formatBar = (val: number) => {
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return val > 0 ? `${val}` : '';
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
          Analytics
        </Text>
        <Text style={[styles.subtitle, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
          {getCurrentMonthLabel()}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Weekly bar chart */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.bord }]}
        >
          <Text style={[styles.cardLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
            WEEKLY SPENDING
          </Text>
          <View style={styles.barChart}>
            {weeklyData.map((day, i) => {
              const barPct = maxWeekly > 0 ? (day.total / maxWeekly) * 100 : 0;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={[styles.barVal, { color: theme.sub, fontFamily: 'Sora_600SemiBold' }]}>
                    {formatBar(day.total)}
                  </Text>
                  <View style={styles.barTrack}>
                    {day.isToday ? (
                      <LinearGradient
                        colors={['#6C63FF', '#9B8FFF']}
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.max(barPct, 3)}%`,
                            shadowColor: '#6C63FF',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                          },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.max(barPct, 3)}%`,
                            backgroundColor: theme.bord,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.barDay,
                      {
                        color: day.isToday ? theme.acc : theme.sub,
                        fontFamily: day.isToday ? 'Sora_700Bold' : 'Sora_500Medium',
                      },
                    ]}
                  >
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Top category insight */}
        {topCat && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={[
              styles.topCatCard,
              {
                backgroundColor: topCat.bg,
                borderColor: topCat.color + '30',
              },
            ]}
          >
            <View style={[styles.topCatIcon, { backgroundColor: topCat.color + '20' }]}>
              <TrendingUp size={18} color={topCat.color} />
            </View>
            <View style={styles.topCatInfo}>
              <Text style={[styles.topCatLabel, { color: topCat.color, fontFamily: 'Sora_700Bold' }]}>
                TOP CATEGORY
              </Text>
              <Text style={[styles.topCatText, { color: theme.text, fontFamily: 'Sora_700Bold' }]}>
                {topCat.name} — {formatLKR(topCat.total)} ({topCat.pct}% of total)
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Category breakdown */}
        <Text style={[styles.sectionLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
          BY CATEGORY
        </Text>

        {catBreakdown.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.bord }]}>
            <Text style={[styles.emptyText, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              No expenses this month
            </Text>
          </View>
        ) : (
          catBreakdown.map((cat, i) => {
            const Icon = cat.Icon;
            return (
              <Animated.View
                key={cat.name}
                entering={FadeInDown.delay(300 + i * 80).duration(400)}
                style={[
                  styles.catCard,
                  { backgroundColor: theme.card, borderColor: theme.bord },
                ]}
              >
                <View style={styles.catRow}>
                  <View style={[styles.catIconBox, { backgroundColor: cat.bg }]}>
                    <Icon size={18} color={cat.color} />
                  </View>
                  <View style={styles.catInfo}>
                    <Text style={[styles.catName, { color: theme.text, fontFamily: 'Sora_700Bold' }]}>
                      {cat.name}
                    </Text>
                    <Text style={[styles.catCount, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
                      {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.catAmountCol}>
                    <Text style={[styles.catAmount, { color: theme.text, fontFamily: 'Sora_700Bold' }]}>
                      {formatLKR(cat.total)}
                    </Text>
                    <Text style={[styles.catPct, { color: cat.color, fontFamily: 'Sora_700Bold' }]}>
                      {cat.pct}%
                    </Text>
                  </View>
                </View>
                <AnimatedProgressBar
                  progress={cat.pct}
                  color={cat.color}
                  trackColor={theme.bord}
                  height={3}
                  delay={300 + i * 80}
                  borderRadius={2}
                />
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  title: { fontSize: 26 },
  subtitle: { fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingTop: 4 },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    gap: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    gap: 4,
  },
  barVal: {
    fontSize: 9,
    textAlign: 'center',
    minHeight: 14,
  },
  barTrack: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barDay: {
    fontSize: 11,
    textAlign: 'center',
  },
  topCatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  topCatIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topCatInfo: { flex: 1, gap: 3 },
  topCatLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  topCatText: { fontSize: 14, lineHeight: 20 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  catCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catInfo: { flex: 1, gap: 2 },
  catName: { fontSize: 15 },
  catCount: { fontSize: 12 },
  catAmountCol: { alignItems: 'flex-end', gap: 2 },
  catAmount: { fontSize: 14 },
  catPct: { fontSize: 12 },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14 },
});
