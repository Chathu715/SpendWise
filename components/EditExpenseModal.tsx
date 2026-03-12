import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useExpenses } from '../context/ExpensesContext';
import { useToast } from '../context/ToastContext';
import { CATS, type Category } from '../constants/categories';
import { BouncingDots } from './BouncingDots';
import type { Expense } from '../constants/mockData';

function CategoryButton({
  cat, active, onPress, theme,
}: {
  cat: Category; active: boolean; onPress: () => void; theme: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
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
        <Icon size={13} color={active ? cat.color : theme.sub} />
        <Text style={[styles.catText, { color: active ? cat.color : theme.sub, fontFamily: 'Sora_700Bold' }]}>
          {cat.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface Props {
  expense: Expense | null;
  onClose: () => void;
  theme: any;
}

export function EditExpenseModal({ expense, onClose, theme }: Props) {
  const { updateExpense } = useExpenses();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory(expense.category);
    }
  }, [expense]);

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!amount || parseFloat(amount) <= 0) {
      showToast('error', 'Please enter a valid amount.');
      return;
    }
    if (!title.trim()) {
      showToast('error', 'Please enter a title.');
      return;
    }
    try {
      setSaving(true);
      await updateExpense(expense!.id, {
        title: title.trim(),
        amount: parseFloat(amount),
        category,
      });
      setSaving(false);
      showToast('success', 'Expense updated.');
      onClose();
    } catch (err: any) {
      setSaving(false);
      showToast('error', err?.message ?? 'Failed to update expense.');
    }
  };

  return (
    <Modal
      visible={expense !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: theme.surf, paddingBottom: insets.bottom + 24 }]}>
          <View style={[styles.handle, { backgroundColor: theme.bord }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitles}>
              <Text style={[styles.title, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
                Edit Expense
              </Text>
              <Text style={[styles.sub, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
                {expense?.date}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.bord }]}
            >
              <X size={16} color={theme.sub} />
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={[styles.amountBox, { backgroundColor: theme.card, borderColor: amount ? theme.acc + '60' : theme.bord }]}>
            <Text style={[styles.fieldLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>AMOUNT</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.amountPrefix, { color: theme.acc, fontFamily: 'Sora_700Bold' }]}>LKR </Text>
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
            <Text style={[styles.fieldLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>TITLE</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What did you spend on?"
              placeholderTextColor={theme.sub}
              returnKeyType="done"
              style={[styles.textInput, { backgroundColor: theme.card, borderColor: theme.bord, color: theme.text, fontFamily: 'Sora_500Medium' }]}
            />
          </View>

          {/* Category */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>CATEGORY</Text>
            <View style={styles.catGrid}>
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

          {/* Buttons */}
          <View style={styles.btns}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { backgroundColor: theme.card, borderColor: theme.bord }]}
            >
              <Text style={[styles.cancelText, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85} style={styles.saveWrap}>
              <LinearGradient
                colors={['#6C63FF', '#9B8FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.saveBtn, { opacity: saving ? 0.75 : 1 }]}
              >
                {saving ? (
                  <BouncingDots color="#fff" size={7} gap={5} />
                ) : (
                  <Text style={[styles.saveBtnText, { fontFamily: 'Sora_800ExtraBold' }]}>Save Changes</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 18,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { gap: 3 },
  title: { fontSize: 20 },
  sub: { fontSize: 13 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  amountBox: {
    borderWidth: 1.5, borderRadius: 18, padding: 16,
    alignItems: 'center', gap: 6,
  },
  amountRow: { flexDirection: 'row', alignItems: 'baseline' },
  amountPrefix: { fontSize: 15 },
  amountInput: { fontSize: 36, minWidth: 60, letterSpacing: -1, textAlign: 'center', padding: 0 },
  fieldGroup: { gap: 10 },
  fieldLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  textInput: {
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 14,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 12, borderWidth: 1.5,
  },
  catText: { fontSize: 12 },
  btns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderRadius: 16,
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontSize: 14 },
  saveWrap: { flex: 2 },
  saveBtn: {
    borderRadius: 16, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 14 },
});
