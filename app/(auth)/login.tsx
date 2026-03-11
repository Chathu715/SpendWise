import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('error', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      await signIn(email.trim(), password);
      router.replace('/(app)');
    } catch (err: any) {
      showToast('error', err?.message ?? 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <LinearGradient
          colors={['#6C63FF', '#9B8FFF']}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={[styles.logoBox, { shadowColor: '#6C63FF' }]}
        >
          <Wallet size={26} color="#fff" strokeWidth={1.5} />
        </LinearGradient>

        {/* Heading */}
        <View style={styles.headingWrap}>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            Sign in to continue
          </Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
              EMAIL
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.sub}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.bord,
                  color: theme.text,
                  fontFamily: 'Sora_500Medium',
                },
              ]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
              PASSWORD
            </Text>
            <View>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••"
                placeholderTextColor={theme.sub}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
                style={[
                  styles.input,
                  styles.inputPw,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.bord,
                    color: theme.text,
                    fontFamily: 'Sora_500Medium',
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPw((p) => !p)}
              >
                {showPw
                  ? <EyeOff size={18} color={theme.sub} />
                  : <Eye    size={18} color={theme.sub} />
                }
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={[styles.forgot, { color: theme.acc, fontFamily: 'Sora_600SemiBold' }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In button */}
        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.85}
          style={styles.btnWrap}
        >
          <LinearGradient
            colors={['#6C63FF', '#9B8FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.btn, { opacity: loading ? 0.75 : 1 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.btnText, { fontFamily: 'Sora_800ExtraBold' }]}>
                Sign In
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.bord }]} />
        </View>

        {/* Register link */}
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={[styles.registerText, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            New to SpendWise?{' '}
            <Text style={{ color: theme.acc, fontFamily: 'Sora_700Bold' }}>
              Create account
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    alignItems: 'flex-start',
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  headingWrap: {
    gap: 6,
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 14,
  },
  fields: {
    width: '100%',
    gap: 20,
    marginBottom: 28,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
  },
  inputPw: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
  },
  forgot: {
    fontSize: 13,
  },
  btnWrap: {
    width: '100%',
    marginBottom: 24,
  },
  btn: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
  },
  divider: {
    width: '100%',
    marginBottom: 24,
  },
  line: {
    height: 1,
    width: '100%',
  },
  registerText: {
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
  },
});
