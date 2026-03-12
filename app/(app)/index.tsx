import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { LogOut, CalendarDays, CircleAlert, Package, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpensesContext';
import { useGreeting } from '../../hooks/useGreeting';
import { AnimatedProgressBar } from '../../components/AnimatedProgressBar';
import { LoadingWallet } from '../../components/LoadingWallet';
import { MonthPicker } from '../../components/MonthPicker';
import { EditExpenseModal } from '../../components/EditExpenseModal';
import type { Expense } from '../../constants/mockData';
import { CATS } from '../../constants/categories';
import {
  formatLKR,
  formatDate,
  getMonthLabel,
  getMonthRange,
  prevMonth,
  nextMonth,
  isCurrentMonth,
  getWarningLevel,
  getProgressColor,
} from '../../lib/format';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { expenses, limits, deleteExpense } = useExpenses();
  const greeting = useGreeting();
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const now = new Date();
  const [selYear, setSelYear]   = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);

  const handlePrevMonth = () => {
    const p = prevMonth(selYear, selMonth);
    setSelYear(p.year); setSelMonth(p.month); setActiveCategory('All');
  };
  const handleNextMonth = () => {
    const n = nextMonth(selYear, selMonth);
    setSelYear(n.year); setSelMonth(n.month); setActiveCategory('All');
  };

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const confirmSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setShowSignOutModal(false);
    router.replace('/(auth)/login');
  };

  const handleSignOut = () => setShowSignOutModal(true);

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  // Filter expenses to selected month
  const { first, last } = getMonthRange(selYear, selMonth);
  const monthExpenses = expenses.filter((e) => e.date >= first && e.date <= last);
  const viewingCurrent = isCurrentMonth(selYear, selMonth);

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
          onPress={handleSignOut}
          style={[styles.logoutBtn, { backgroundColor: theme.card, borderColor: theme.bord }]}
        >
          <LogOut size={15} color={theme.sub} />
        </TouchableOpacity>
      </View>

      {/* Month navigation */}
      <View style={styles.monthPickerWrap}>
        <MonthPicker
          year={selYear}
          month={selMonth}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Warning banner — only for current month */}
        {viewingCurrent && warningLevel !== 'none' && (
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
            TOTAL SPENT — {getMonthLabel(selYear, selMonth).toUpperCase()}
          </Text>
          <View style={styles.summaryAmountRow}>
            <Text style={[styles.summaryAmount, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
              {formatLKR(totalSpent)}
            </Text>
          </View>
          {viewingCurrent ? (
            <>
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
            </>
          ) : (
            <Text style={[styles.summaryOf, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              {monthExpenses.length} transaction{monthExpenses.length !== 1 ? 's' : ''}
            </Text>
          )}
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
              onDelete={() => deleteExpense(expense.id)}
              onEdit={() => setEditingExpense(expense)}
            />
          ))
        )}
      </ScrollView>

      {/* Sign Out Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => !signingOut && setShowSignOutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.bord }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: theme.red + '15' }]}>
              <LogOut size={30} color={theme.red} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
              Sign Out
            </Text>
            <Text style={[styles.modalSub, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              Are you sure you want to sign out of SpendWise?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setShowSignOutModal(false)}
                disabled={signingOut}
                style={[styles.modalCancelBtn, { backgroundColor: theme.bg, borderColor: theme.bord }]}
              >
                <Text style={[{ color: theme.sub, fontFamily: 'Sora_700Bold', fontSize: 14 }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSignOut}
                disabled={signingOut}
                activeOpacity={0.85}
                style={[styles.modalSignOutBtn, { backgroundColor: theme.red, opacity: signingOut ? 0.75 : 1 }]}
              >
                <LogOut size={15} color="#fff" />
                <Text style={[{ color: '#fff', fontFamily: 'Sora_700Bold', fontSize: 14 }]}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {signingOut && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, zIndex: 200 }]}>
          <LoadingWallet />
        </View>
      )}

      <EditExpenseModal
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        theme={theme}
      />
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

function ExpenseItem({
  expense, index, theme, onDelete, onEdit,
}: {
  expense: any; index: number; theme: any; onDelete: () => void; onEdit: () => void;
}) {
  const cat = CATS.find((c) => c.name === expense.category) ?? CATS[5];
  const Icon = cat.Icon;
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={() => {
        swipeRef.current?.close();
        onDelete();
      }}
      style={styles.deleteAction}
      activeOpacity={0.85}
    >
      <Trash2 size={20} color="#fff" />
      <Text style={[styles.deleteText, { fontFamily: 'Sora_700Bold' }]}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
      >
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.75}
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
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  monthPickerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
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
  deleteAction: {
    backgroundColor: '#F87171',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 20,
    marginBottom: 10,
    gap: 4,
  },
  deleteText: {
    color: '#fff',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 48,
    elevation: 20,
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  modalTitle: { fontSize: 20 },
  modalSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSignOutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#F87171',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
});
