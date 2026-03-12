import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Sun,
  Moon,
  Monitor,
  Wallet,
  SlidersHorizontal,
  ChartBar,
  CalendarDays,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { LoadingWallet } from '../../components/LoadingWallet';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: any }[] = [
  { mode: 'light',  label: 'Light',  Icon: Sun     },
  { mode: 'dark',   label: 'Dark',   Icon: Moon    },
  { mode: 'system', label: 'System', Icon: Monitor },
];

const THEME_DESCRIPTIONS: Record<ThemeMode, string> = {
  light:  'Light mode is active. Bright and clean interface.',
  dark:   'Dark mode is active. Easy on the eyes at night.',
  system: "Following your device's theme setting automatically.",
};

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const confirmSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setShowModal(false);
    router.replace('/(auth)/login');
  };

  const initial = user?.full_name?.charAt(0)?.toUpperCase() ?? 'U';

  const menuItems = [
    {
      icon: Wallet,
      title: 'Account Details',
      subtitle: user?.email ?? '',
      navigable: false,
      onPress: () => {},
    },
    {
      icon: SlidersHorizontal,
      title: 'Spending Limits',
      subtitle: 'Manage per-category limits',
      navigable: true,
      onPress: () => router.push('/(app)/limits'),
    },
    {
      icon: ChartBar,
      title: 'Analytics',
      subtitle: 'View spending insights',
      navigable: true,
      onPress: () => router.push('/(app)/analytics'),
    },
    {
      icon: CalendarDays,
      title: 'Reset Date',
      subtitle: 'Limits reset on 1st of month',
      navigable: false,
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
          Settings
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Profile card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.bord }]}
        >
          <LinearGradient
            colors={['#6C63FF', '#9B8FFF']}
            style={styles.avatar}
          >
            <Text style={[styles.avatarText, { fontFamily: 'Sora_800ExtraBold' }]}>
              {initial}
            </Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text, fontFamily: 'Sora_700Bold' }]}>
              {user?.full_name ?? 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              {user?.email ?? ''}
            </Text>
          </View>
        </Animated.View>

        {/* Appearance */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.section, { backgroundColor: theme.card, borderColor: theme.bord }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
            APPEARANCE
          </Text>

          {/* Toggle pill */}
          <View style={[styles.toggleRow, { backgroundColor: theme.bg, borderColor: theme.bord }]}>
            {THEME_OPTIONS.map(({ mode, label, Icon }) => {
              const active = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[styles.toggleOption, active && styles.toggleOptionActive]}
                  activeOpacity={0.8}
                >
                  {active ? (
                    <LinearGradient
                      colors={['#6C63FF', '#9B8FFF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.toggleGradient}
                    >
                      <Icon size={14} color="#fff" />
                      <Text style={[styles.toggleText, { color: '#fff', fontFamily: 'Sora_700Bold' }]}>
                        {label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.toggleInactive}>
                      <Icon size={14} color={theme.sub} />
                      <Text style={[styles.toggleText, { color: theme.sub, fontFamily: 'Sora_600SemiBold' }]}>
                        {label}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Description */}
          <View style={[styles.descRow, { backgroundColor: theme.bg, borderColor: theme.bord }]}>
            {themeMode === 'light'  && <Sun    size={14} color={theme.sub} />}
            {themeMode === 'dark'   && <Moon   size={14} color={theme.sub} />}
            {themeMode === 'system' && <Monitor size={14} color={theme.sub} />}
            <Text style={[styles.descText, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              {THEME_DESCRIPTIONS[themeMode]}
            </Text>
          </View>
        </Animated.View>

        {/* Menu items */}
        <View style={styles.menuList}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Animated.View
                key={item.title}
                entering={FadeInDown.delay(300 + i * 60).duration(400)}
              >
                <TouchableOpacity
                  onPress={item.onPress}
                  activeOpacity={item.navigable ? 0.7 : 1}
                  style={[
                    styles.menuItem,
                    { backgroundColor: theme.card, borderColor: theme.bord },
                  ]}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: theme.accD }]}>
                    <Icon size={18} color={theme.acc} />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={[styles.menuTitle, { color: theme.text, fontFamily: 'Sora_700Bold' }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.menuSub, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                  {item.navigable && (
                    <ChevronRight size={18} color={theme.sub} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Sign out */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={[
              styles.signOutBtn,
              { borderColor: theme.red + '60', backgroundColor: theme.red + '08' },
            ]}
          >
            <LogOut size={18} color={theme.red} />
            <Text style={[styles.signOutText, { color: theme.red, fontFamily: 'Sora_700Bold' }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Sign out loading overlay */}
      {signingOut && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, zIndex: 200 }]}>
          <LoadingWallet />
        </View>
      )}

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => !signingOut && setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.bord }]}>
            {/* Icon */}
            <View style={[styles.modalIconWrap, { backgroundColor: theme.red + '15' }]}>
              <LogOut size={30} color={theme.red} />
            </View>

            {/* Text */}
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
              Sign Out
            </Text>
            <Text style={[styles.modalSub, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
              Are you sure you want to sign out of SpendWise?
            </Text>

            {/* Buttons */}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                disabled={signingOut}
                style={[styles.modalCancelBtn, { backgroundColor: theme.bg, borderColor: theme.bord }]}
              >
                <Text style={[styles.modalBtnText, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmSignOut}
                disabled={signingOut}
                activeOpacity={0.85}
                style={[
                  styles.modalSignOutBtn,
                  { backgroundColor: theme.red, opacity: signingOut ? 0.75 : 1 },
                ]}
              >
                <LogOut size={15} color="#fff" />
                <Text style={[styles.modalBtnText, { color: '#fff', fontFamily: 'Sora_700Bold' }]}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 26 },
  scroll: { paddingHorizontal: 20, paddingTop: 4 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22 },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 16 },
  profileEmail: { fontSize: 13 },
  section: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  toggleOption: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleOptionActive: {},
  toggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  toggleText: { fontSize: 13 },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  descText: { fontSize: 12, flex: 1, lineHeight: 18 },
  menuList: { gap: 10, marginBottom: 14 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuText: { flex: 1, gap: 2 },
  menuTitle: { fontSize: 15 },
  menuSub: { fontSize: 12 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: 16,
  },
  signOutText: { fontSize: 15 },
  // Sign out modal
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
  modalTitle: {
    fontSize: 20,
  },
  modalSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
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
  modalBtnText: { fontSize: 14 },
});
