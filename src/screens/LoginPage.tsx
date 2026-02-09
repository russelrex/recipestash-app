import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authApi } from '../services/api';
import { Colors } from '../theme';

export default function LoginPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!response.success) {
        throw new Error(response.message || 'Invalid email or password');
      }

      setSnackbarMessage('Login successful! 🎉');
      setSnackbarVisible(true);

      setTimeout(() => {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }, 600);
    } catch (error: any) {
      console.error('Login error:', error);
      setSnackbarMessage(error?.message || 'Invalid email or password');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Glassmorphism Card */}
          <View style={styles.card}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  emailError ? styles.inputWrapperError : undefined,
                ]}
              >
                <Icon name="email" size={20} color={Colors.text.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address *"
                  placeholderTextColor="rgba(12, 22, 7, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  passwordError ? styles.inputWrapperError : undefined,
                ]}
              >
                <Icon name="lock" size={20} color={Colors.text.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password *"
                  placeholderTextColor="rgba(12, 22, 7, 0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  disabled={loading}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={Colors.text.primary}
                  />
                </TouchableOpacity>
              </View>
              {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text
                  style={styles.signInLink}
                  onPress={() => (navigation as any).navigate('Registration')}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#B8D156',
  },
  container: {
    flex: 1,
    backgroundColor: '#B8D156',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0C1607',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#0C1607',
    opacity: 0.8,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    borderRadius: 24,
    padding: 24,

    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(12, 22, 7, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 50,
  },
  inputWrapperError: {
    borderColor: Colors.status.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0C1607',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: Colors.status.error,
  },
  button: {
    width: '100%',
    backgroundColor: '#B15912',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#B15912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(177, 89, 18, 0.4)',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  footerText: {
    fontSize: 14,
    color: '#0C1607',
    textAlign: 'center',
  },
  signInLink: {
    color: '#B15912',
    fontWeight: '600',
  },
});
