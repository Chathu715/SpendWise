import React, { useEffect } from 'react';
import { View, StyleSheet, Keyboard, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { ExpensesProvider } from '../context/ExpensesContext';
import { ToastProvider } from '../context/ToastContext';
import { LoadingWallet } from '../components/LoadingWallet';

SplashScreen.preventAutoHideAsync();

function BootScreen() {
  const { theme } = useTheme();
  return (
    <View style={[styles.boot, { backgroundColor: theme.bg }]}>
      <LoadingWallet />
    </View>
  );
}

function RootLayoutInner() {
  const { theme } = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const applyNavBar = () => {
      NavigationBar.setBackgroundColorAsync(theme.bg);
      NavigationBar.setButtonStyleAsync(theme.isDark ? 'light' : 'dark');
    };
    applyNavBar();
    const sub = Keyboard.addListener('keyboardDidHide', applyNavBar);
    return () => sub.remove();
  }, [theme.bg, theme.isDark]);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen
          name="add"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: theme.bg },
          }}
        />
      </Stack>
    </>
  );
}

// Wraps GestureHandlerRootView with the theme background so the root
// canvas never shows white when KeyboardAvoidingView shrinks or pans.
function ThemedRoot({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { theme } = useTheme();
  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaProvider>
        <AuthProvider>
          <ExpensesProvider>
            <ToastProvider>
              {fontsLoaded ? <RootLayoutInner /> : <BootScreen />}
            </ToastProvider>
          </ExpensesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  return (
    <ThemeProvider>
      <ThemedRoot fontsLoaded={!!fontsLoaded} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  boot: { flex: 1 },
});
