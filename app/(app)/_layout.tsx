import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, ChartBar, Plus, SlidersHorizontal, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

function FABButton() {
  const { theme } = useTheme();
  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        onPress={() => router.push('/add')}
        style={[styles.fab, { borderColor: theme.bg }]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#6C63FF', '#9B8FFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={24} color="#fff" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default function AppLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 72 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
          backgroundColor: theme.surf,
          borderTopColor: theme.bord,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.acc,
        tabBarInactiveTintColor: theme.sub,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Sora_700Bold',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, any> = {
            index: House,
            analytics: ChartBar,
            limits: SlidersHorizontal,
            settings: Settings,
          };
          const Icon = icons[route.name];
          if (!Icon) return null;
          return (
            <View
              style={[
                styles.iconWrap,
                focused && {
                  backgroundColor: theme.accD,
                },
              ]}
            >
              <Icon size={20} color={color} />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index"     options={{ title: 'Home' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Tabs.Screen
        name="add-placeholder"
        options={{
          title: 'Add',
          tabBarButton: () => <FABButton />,
        }}
      />
      <Tabs.Screen name="limits"   options={{ title: 'Limits' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    marginTop: -20,
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 3,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'visible',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
