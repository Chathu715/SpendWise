import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { LogOut, CalendarDays, CircleAlert, Package } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpensesContext';
import { useGreeting } from '../../hooks/useGreeting';
import { AnimatedProgressBar } from '../../components/AnimatedProgressBar';
import { CATS } from '../../constants/categories';
import {
  formatLKR,
  formatDate,
  getCurrentMonthLabel,
  getFirstDayOfMonth,
  getWarningLevel,
  getProgressColor,
} from '../../lib/format';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { expenses, limits } = useExpenses();
  const greeting = useGreeting();
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState<string>('All');

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  // Filter expenses to current month
  const firstDay = getFirstDayOfMonth();
  const monthExpenses = expenses.filter((e) => e.date >= firstDay);

  // Filter by active category
  const filtered =
    activeCategory === 'All'
      ? monthExpenses
      : monthExpenses.filter((e) => e.category === activeCategory);

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const pct = limits.overall > 0 ? Math.round((totalSpent / limits.overall) * 100) : 0;
  const warningLevel = getWarningLevel(totalSpent, limits.overall);
  const progressColor = getProgressColor(totalSpent, limits.overall, theme.acc, theme.amber, theme.red);

  const remaining = limits.overall - totalSpent;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greetSmall, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            {greeting},
          </Text>
          <Text style={[styles.greetName, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
            {firstName}
          </Text>
        </View>
        <TouchableOpacity
          onPress={signOut}
          style={[styles.logoutBtn, { backgroundColor: theme.card, borderColor: theme.bord }]}
        >
          <LogOut size={15} color={theme.sub} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Warning banner */}
        {warningLevel !== 'none' && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[
              styles.warningBanner,
              {
                backgroundColor:
                  warningLevel === 'exceeded'
                    ? theme.red + '15'
                    : theme.amber + '15',
                borderColor:
                  warningLevel === 'exceeded'
                    ? theme.red + '40'
                    : theme.amber + '40',
              },
            ]}
          >
            <CircleAlert
              size={16}
              color={warningLevel === 'exceeded' ? theme.red : theme.amber}
            />
            <Text
              style={[
                styles.warningText,
                {
                  color: warningLevel === 'exceeded' ? theme.red : theme.amber,
                  fontFamily: 'Sora_600SemiBold',
                },
              ]}
            >
              {warningLevel === 'exceeded'
                ? `Monthly limit exceeded! — You are ${formatLKR(Math.abs(remaining))} over your ${formatLKR(limits.overall)} limit`
                : `Approaching your limit — ${formatLKR(remaining)} remaining, ${pct}% used`}
            </Text>
          </Animated.View>
        )}

        {/* Summary card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.bord,
              shadowColor: '#000',
            },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
            TOTAL SPENT — {getCurrentMonthLabel().toUpperCase()}
          </Text>
          <View style={styles.summaryAmountRow}>
            <Text style={[styles.summaryAmount, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
              {formatLKR(totalSpent)}
            </Text>
          </View>
          <View style={styles.summaryMeta}>
            <Text style={[styles.summaryOf, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              of {formatLKR(limits.overall)} limit
            </Text>
            <Text style={[styles.summaryPct, { color: progressColor, fontFamily: 'Sora_700Bold' }]}>
              {pct}%
            </Text>
          </View>
          <AnimatedProgressBar
            progress={pct}
            color={progressColor}
            trackColor={theme.bord}
            height={6}
            delay={300}
            borderRadius={5}
          />
        </Animated.View>

        {/* Category filter */}
        <Text style={[styles.sectionLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
          BROWSE BY CATEGORY
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {/* All chip */}
          <CategoryChip
            name="All"
            active={activeCategory === 'All'}
            color={theme.acc}
            bg={theme.accD}
            onPress={() => setActiveCategory('All')}
            theme={theme}
          />
          {CATS.map((cat) => (
            <CategoryChipWithIcon
              key={cat.name}
              cat={cat}
              active={activeCategory === cat.name}
              onPress={() => setActiveCategory(cat.name)}
              theme={theme}
            />
          ))}
        </ScrollView>

        {/* Expense list */}
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.text, fontFamily: 'Sora_700Bold' }]}>
            {activeCategory === 'All' ? 'All Expenses' : `${activeCategory} Expenses`}
          </Text>
          <Text style={[styles.listCount, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.card, borderColor: theme.bord }]}>
              <Package size={28} color={theme.sub} />
            </View>
            <Text style={[styles.emptyText, { color: theme.sub, fontFamily: 'Sora_600SemiBold' }]}>
              No expenses found
            </Text>
          </View>
        ) : (
          filtered.map((expense, index) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              index={index}
              theme={theme}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function CategoryChip({
  name, active, color, bg, onPress, theme,
}: {
  name: string; active: boolean; color: string; bg: string; onPress: () => void; theme: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.92, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 12 }); }}
        style={[
          styles.chip,
          {
            backgroundColor: active ? bg : theme.card,
            borderColor: active ? color : theme.bord,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: active ? color : theme.sub,
              fontFamily: 'Sora_700Bold',
            },
          ]}
        >
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function CategoryChipWithIcon({
  cat, active, onPress, theme,
}: {
  cat: any; active: boolean; onPress: () => void; theme: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const Icon = cat.Icon;
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.92, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 12 }); }}
        style={[
          styles.chip,
          {
            backgroundColor: active ? cat.bg : theme.card,
            borderColor: active ? cat.color : theme.bord,
          },
        ]}
      >
        <Icon size={12} color={active ? cat.color : theme.sub} />
        <Text
          style={[
            styles.chipText,
            {
              color: active ? cat.color : theme.sub,
              fontFamily: 'Sora_700Bold',
            },
          ]}
        >
          {cat.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function ExpenseItem({ expense, index, theme }: { expense: any; index: number; theme: any }) {
  const cat = CATS.find((c) => c.name === expense.category) ?? CATS[5];
  const Icon = cat.Icon;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(300)}
      style={[
        styles.expenseItem,
        {
          backgroundColor: theme.card,
          borderColor: theme.bord,
          shadowColor: '#000',
        },
      ]}
    >
      <View style={[styles.expenseIcon, { backgroundColor: cat.bg }]}>
        <Icon size={18} color={cat.color} />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={[styles.expenseTitle, { color: theme.text, fontFamily: 'Sora_600SemiBold' }]}>
          {expense.title}
        </Text>
        <View style={styles.expenseDateRow}>
          <CalendarDays size={11} color={theme.sub} />
          <Text style={[styles.expenseDate, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            {expense.date}
          </Text>
        </View>
      </View>
      <Text style={[styles.expenseAmount, { color: theme.text, fontFamily: 'Sora_700Bold' }]}>
        {formatLKR(expense.amount)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: { gap: 2 },
  greetSmall: { fontSize: 14 },
  greetName: { fontSize: 22 },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  warningText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    gap: 10,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  summaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  summaryAmount: {
    fontSize: 28,
    letterSpacing: -1,
  },
  summaryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryOf: { fontSize: 13 },
  summaryPct: { fontSize: 14 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chips: {
    gap: 8,
    paddingRight: 20,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: { fontSize: 16 },
  listCount: { fontSize: 13 },
  emptyWrap: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 15 },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseInfo: { flex: 1, gap: 4 },
  expenseTitle: { fontSize: 14 },
  expenseDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expenseDate: { fontSize: 12 },
  expenseAmount: { fontSize: 14 },
});
