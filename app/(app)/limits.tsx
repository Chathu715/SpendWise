import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Pencil, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useExpenses } from '../../context/ExpensesContext';
import { useToast } from '../../context/ToastContext';
import { CATS } from '../../constants/categories';
import { AnimatedProgressBar } from '../../components/AnimatedProgressBar';
import { BouncingDots } from '../../components/BouncingDots';
import {
  formatLKR,
  getFirstDayOfMonth,
  getWarningLevel,
  getProgressColor,
} from '../../lib/format';
import type { SpendingLimits } from '../../constants/mockData';

export default function LimitsScreen() {
  const { theme } = useTheme();
  const { expenses, limits, updateLimit } = useExpenses();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [editing, setEditing] = useState<{ field: keyof SpendingLimits; label: string } | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [saving, setSaving] = useState(false);

  const firstDay = getFirstDayOfMonth();
  const monthExpenses = expenses.filter((e) => e.date >= firstDay);
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const catSpent = (catName: string) =>
    monthExpenses
      .filter((e) => e.category === catName)
      .reduce((sum, e) => sum + e.amount, 0);

  const overallPct = limits.overall > 0
    ? Math.round((totalSpent / limits.overall) * 100)
    : 0;

  const openEdit = (field: keyof SpendingLimits, label: string, currentVal: number) => {
    setEditing({ field, label });
    setInputVal(currentVal > 0 ? String(currentVal) : '');
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    const val = parseFloat(inputVal);
    if (isNaN(val) || val < 0) {
      showToast('error', 'Please enter a valid amount.');
      return;
    }
    try {
      setSaving(true);
      await updateLimit(editing!.field, val);
      setSaving(false);
      setEditing(null);
      showToast('success', `${editing!.label} limit updated.`);
    } catch (err: any) {
      setSaving(false);
      showToast('error', err?.message ?? 'Failed to update limit.');
    }
  };

  const overallProgress = getProgressColor(totalSpent, limits.overall, theme.acc, theme.amber, theme.red);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
          Spending Limits
        </Text>
        <Text style={[styles.subtitle, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
          Resets on the 1st of each month
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Overall monthly limit */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={[styles.overallCard, { backgroundColor: theme.card, borderColor: theme.bord }]}
        >
          <Text style={[styles.overallLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
            OVERALL MONTHLY LIMIT
          </Text>
          <View style={styles.overallRow}>
            <Text style={[styles.overallAmount, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
              {formatLKR(limits.overall)}
            </Text>
            <TouchableOpacity
              onPress={() => openEdit('overall', 'Overall', limits.overall)}
              style={[styles.editBtn, { backgroundColor: theme.accD, borderColor: theme.acc + '30' }]}
            >
              <Pencil size={13} color={theme.acc} />
              <Text style={[styles.editText, { color: theme.acc, fontFamily: 'Sora_700Bold' }]}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <AnimatedProgressBar
            progress={overallPct}
            color={overallProgress}
            trackColor={theme.bord}
            height={6}
            delay={200}
            borderRadius={5}
          />
          <View style={styles.usageRow}>
            <Text style={[styles.usagePct, { color: overallProgress, fontFamily: 'Sora_600SemiBold' }]}>
              {overallPct}% used
            </Text>
            <Text style={[styles.usageNums, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              {formatLKR(totalSpent)} / {formatLKR(limits.overall)}
            </Text>
          </View>
        </Animated.View>

        <Text style={[styles.sectionLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
          PER CATEGORY
        </Text>

        {CATS.map((cat, i) => {
          const spent = catSpent(cat.name);
          const limit = limits[cat.name.toLowerCase() as keyof SpendingLimits] as number;
          const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
          const warning = getWarningLevel(spent, limit);
          const progColor = getProgressColor(spent, limit, cat.color, theme.amber, theme.red);
          const Icon = cat.Icon;

          return (
            <Animated.View
              key={cat.name}
              entering={FadeInDown.delay(200 + i * 80).duration(400)}
              style={[
                styles.catCard,
                {
                  backgroundColor:
                    warning === 'exceeded'
                      ? theme.red + '08'
                      : warning === 'warning'
                      ? theme.amber + '08'
                      : theme.card,
                  borderColor:
                    warning === 'exceeded'
                      ? theme.red + '30'
                      : warning === 'warning'
                      ? theme.amber + '30'
                      : theme.bord,
                },
              ]}
            >
              <View style={styles.catTopRow}>
                <View style={[styles.catIconBox, { backgroundColor: cat.bg }]}>
                  <Icon size={18} color={cat.color} />
                </View>
                <View style={styles.catInfo}>
                  <Text style={[styles.catName, { color: theme.text, fontFamily: 'Sora_700Bold' }]}>
                    {cat.name}
                  </Text>
                  <Text style={[styles.catSpent, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
                    Spent {formatLKR(spent)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    openEdit(
                      cat.name.toLowerCase() as keyof SpendingLimits,
                      cat.name,
                      limit
                    )
                  }
                  style={[
                    styles.limitBtn,
                    { backgroundColor: theme.card, borderColor: theme.bord },
                  ]}
                >
                  <Pencil size={12} color={theme.sub} />
                  <Text style={[styles.limitBtnText, { color: theme.sub, fontFamily: 'Sora_600SemiBold' }]}>
                    {formatLKR(limit)}
                  </Text>
                </TouchableOpacity>
              </View>
              <AnimatedProgressBar
                progress={pct}
                color={progColor}
                trackColor={theme.bord}
                height={4}
                delay={200 + i * 80}
                borderRadius={3}
              />
              <View style={styles.usageRow}>
                <Text style={[styles.usagePct, { color: progColor, fontFamily: 'Sora_600SemiBold' }]}>
                  {pct}% used
                </Text>
                <Text style={[styles.usageNums, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
                  {formatLKR(spent)} / {formatLKR(limit)}
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Edit bottom sheet modal */}
      <Modal
        visible={editing !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditing(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setEditing(null)}
          />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.surf,
                paddingBottom: insets.bottom + 24,
              },
            ]}
          >
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: theme.bord }]} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitles}>
                <Text style={[styles.sheetTitle, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
                  Edit — {editing?.label}
                </Text>
                <Text style={[styles.sheetSub, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
                  Current: {formatLKR(
                    editing
                      ? (limits[editing.field] as number)
                      : 0
                  )}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditing(null)}
                style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.bord }]}
              >
                <X size={16} color={theme.sub} />
              </TouchableOpacity>
            </View>

            {/* Input */}
            <View
              style={[
                styles.sheetInput,
                { backgroundColor: theme.card, borderColor: theme.acc + '60' },
              ]}
            >
              <Text style={[styles.sheetInputPrefix, { color: theme.acc, fontFamily: 'Sora_700Bold' }]}>
                LKR
              </Text>
              <TextInput
                value={inputVal}
                onChangeText={setInputVal}
                placeholder="0"
                placeholderTextColor={theme.bord}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                autoFocus
                style={[styles.sheetInputText, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}
              />
            </View>

            {/* Buttons */}
            <View style={styles.sheetBtns}>
              <TouchableOpacity
                onPress={() => setEditing(null)}
                style={[styles.cancelBtn, { backgroundColor: theme.card, borderColor: theme.bord }]}
              >
                <Text style={[styles.cancelText, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
                style={styles.saveWrap}
              >
                <LinearGradient
                  colors={['#6C63FF', '#9B8FFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.saveBtn, { opacity: saving ? 0.75 : 1 }]}
                >
                  {saving ? (
                    <BouncingDots color="#fff" size={7} gap={5} />
                  ) : (
                    <Text style={[styles.saveBtnText, { fontFamily: 'Sora_800ExtraBold' }]}>
                      Save Limit
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  subtitle: { fontSize: 13 },
  scroll: { paddingHorizontal: 20, paddingTop: 4 },
  overallCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    gap: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  overallLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overallAmount: { fontSize: 26, letterSpacing: -1 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editText: { fontSize: 13 },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usagePct: { fontSize: 12 },
  usageNums: { fontSize: 12 },
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
  catTopRow: {
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
  catSpent: { fontSize: 12 },
  limitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  limitBtnText: { fontSize: 13 },
  // Modal
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sheetTitles: { gap: 4 },
  sheetTitle: { fontSize: 20 },
  sheetSub: { fontSize: 13 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sheetInputPrefix: { fontSize: 15 },
  sheetInputText: {
    flex: 1,
    fontSize: 26,
    padding: 0,
    letterSpacing: -1,
  },
  sheetBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 14 },
  saveWrap: { flex: 2 },
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 14 },
});
