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
import { ArrowLeft, Eye, EyeOff, Info } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName]     = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);

  const emailRef    = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      showToast('error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      showToast('error', 'Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      await signUp(email.trim(), password, fullName.trim());
      router.replace('/(app)');
    } catch (err: any) {
      showToast('error', err?.message ?? 'Registration failed. Please try again.');
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
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.bord }]}
        >
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Heading */}
        <View style={styles.headingWrap}>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Sora_800ExtraBold' }]}>
            Create account
          </Text>
          <Text style={[styles.subtitle, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            Track every rupee with clarity
          </Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.sub, fontFamily: 'Sora_700Bold' }]}>
              FULL NAME
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor={theme.sub}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
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
              EMAIL
            </Text>
            <TextInput
              ref={emailRef}
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
                placeholder="Min. 6 characters"
                placeholderTextColor={theme.sub}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
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
          </View>
        </View>

        {/* Info card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.accD,
              borderColor: theme.acc + '40',
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: theme.acc, fontFamily: 'Sora_700Bold' }]}>
            About Spending Limits
          </Text>
          <Text style={[styles.infoText, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            Set monthly limits per category from the{' '}
            <Text style={{ color: theme.text, fontFamily: 'Sora_700Bold' }}>Limits</Text>
            {' '}tab. Warned at 80%, alerted when exceeded. Resets on 1st of each month.
          </Text>
        </View>

        {/* Get Started button */}
        <TouchableOpacity
          onPress={handleSignUp}
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
                Get Started
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.loginText, { color: theme.sub, fontFamily: 'Sora_500Medium' }]}>
            Already have an account?{' '}
            <Text style={{ color: theme.acc, fontFamily: 'Sora_700Bold' }}>Sign in</Text>
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
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  headingWrap: {
    gap: 6,
    marginBottom: 32,
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
    marginBottom: 20,
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
  infoCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 13,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  btnWrap: {
    width: '100%',
    marginBottom: 20,
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
  loginText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
