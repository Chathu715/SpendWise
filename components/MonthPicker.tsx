import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getMonthLabel, isCurrentMonth } from '../lib/format';

interface Props {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthPicker({ year, month, onPrev, onNext }: Props) {
  const { theme } = useTheme();
  const atCurrentMonth = isCurrentMonth(year, month);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onPrev}
        style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.bord }]}
        activeOpacity={0.7}
      >
        <ChevronLeft size={16} color={theme.sub} />
      </TouchableOpacity>

      <View style={[styles.labelWrap, { backgroundColor: theme.card, borderColor: theme.bord }]}>
        <Text style={[styles.label, { color: theme.text, fontFamily: 'Sora_700Bold' }]}>
          {getMonthLabel(year, month)}
        </Text>
        {atCurrentMonth && (
          <View style={[styles.dot, { backgroundColor: theme.acc }]} />
        )}
      </View>

      <TouchableOpacity
        onPress={onNext}
        disabled={atCurrentMonth}
        style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.bord, opacity: atCurrentMonth ? 0.3 : 1 }]}
        activeOpacity={0.7}
      >
        <ChevronRight size={16} color={theme.sub} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  label: {
    fontSize: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
