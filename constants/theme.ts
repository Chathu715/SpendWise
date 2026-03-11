export const DARK = {
  isDark: true,
  bg:    '#0B0B12',
  surf:  '#13131C',
  card:  '#1A1A26',
  bord:  '#252535',
  text:  '#EEEEF5',
  sub:   '#9898B0',
  acc:   '#6C63FF',
  accD:  '#6C63FF18',
  green: '#34D399',
  amber: '#FBBF24',
  red:   '#F87171',
};

export const LIGHT = {
  isDark: false,
  bg:    '#F4F4F8',
  surf:  '#FFFFFF',
  card:  '#FFFFFF',
  bord:  '#E4E4EE',
  text:  '#18182A',
  sub:   '#7070A0',
  acc:   '#6C63FF',
  accD:  '#6C63FF12',
  green: '#10B981',
  amber: '#D97706',
  red:   '#EF4444',
};

export type Theme = typeof DARK;
