import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CalendarDays } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpensesContext';
import { useToast } from '../context/ToastContext';
import { CATS, type Category } from '../constants/categories';
import { SuccessOverlay } from '../components/SuccessOverlay';
import { ErrorOverlay } from '../components/ErrorOverlay';
import { BouncingDots } from '../components/BouncingDots';
import { formatDate } from '../lib/format';

// ─── Category button — extracted to avoid hook-in-loop ───────────────────────
function CategoryButton({
  cat,
  active,
  onPress,
  theme,
}: {
  cat: Category;
  active: boolean;
  onPress: () => void;
  theme: any;
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
          styles.catBtn,
          {
            backgroundColor: active ? cat.bg : theme.card,
            borderColor: active ? cat.color : theme.bord,
          },
        ]}
      >
        <Icon size={14} color={active ? cat.color : theme.sub} />
        <Text
          style={[
            styles.catText,
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

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AddExpenseScreen() {
  const { theme } = useTheme();
  const { addExpense } = useExpenses();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const today = new Date().toISOString().split('T')[0];

  const [amount, setAmount]           = useState('');
  const [title, setTitle]             = useState('');
  const [category, setCategory]       = useState('Food');
  const [date]                        = useState(today);

  const [loading, setLoading]         = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('error', 'Please enter a valid amount.');
      return;
    }
    if (!title.trim()) {
      showToast('error', 'Please enter a title for the expense.');
      return;
    }
    try {
      setLoading(true);
      await addExpense({
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        date,
        note: '',
      });
      setLoading(false);
      setShowSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message ?? 'Failed to save expense. Please try again.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 10 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.bord }]}
          >
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
            Add Expense
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount hero */}
          <View
            style={[
              styles.amountCard,
              {
                backgroundColor: theme.card,
                borderColor: amount ? theme.acc + '60' : theme.bord,
              },
            ]}
          >
            <Text style={[styles.amountLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
              AMOUNT
            </Text>
            <View style={styles.amountRow}>
              <Text style={[styles.amountPrefix, { color: theme.acc, fontFamily: 'Sora_700Bold' }]}>
                LKR{' '}
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={theme.bord}
                keyboardType="numeric"
                returnKeyType="done"
                style={[styles.amountInput, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}
              />
            </View>
          </View>

          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
              TITLE
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What did you spend on?"
              placeholderTextColor={theme.sub}
              returnKeyType="done"
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.bord,
                  color: theme.text,
                  fontFamily: 'Sora_500Medium',
                },
              ]}
            />
          </View>

          {/* Category picker */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
              CATEGORY
            </Text>
            <View style={styles.categoryGrid}>
              {CATS.map((cat) => (
                <CategoryButton
                  key={cat.name}
                  cat={cat}
                  active={category === cat.name}
                  onPress={() => setCategory(cat.name)}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          {/* Date */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
              DATE
            </Text>
            <View
              style={[
                styles.dateRow,
                { backgroundColor: theme.card, borderColor: theme.bord },
              ]}
            >
              <Text style={[styles.dateText, { color: theme.text, fontFamily: 'Sora_500Medium' }]}>
                {formatDate(date)}
              </Text>
              <CalendarDays size={18} color={theme.sub} />
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.saveWrap}
          >
            <LinearGradient
              colors={['#6C63FF', '#9B8FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.saveBtn, { opacity: loading ? 0.75 : 1 }]}
            >
              {loading ? (
                <BouncingDots color="#fff" size={8} gap={6} />
              ) : (
                <Text style={[styles.saveBtnText, { fontFamily: 'Sora_800ExtraBold' }]}>
                  Save Expense
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Overlays */}
      {showSuccess && (
        <SuccessOverlay
          amount={parseFloat(amount) || 0}
          category={category}
          onDismiss={() => router.back()}
        />
      )}
      {errorMsg && (
        <ErrorOverlay
          message={errorMsg}
          onDismiss={() => setErrorMsg(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18 },
  scroll: {
    paddingHorizontal: 20,
    gap: 20,
  },
  amountCard: {
    borderWidth: 1.5,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  amountLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountPrefix: { fontSize: 16 },
  amountInput: {
    fontSize: 48,
    minWidth: 80,
    letterSpacing: -2,
    textAlign: 'center',
    padding: 0,
  },
  fieldGroup: { gap: 10 },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  catText: { fontSize: 13 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: { fontSize: 14 },
  saveWrap: { marginTop: 8 },
  saveBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 15 },
});
