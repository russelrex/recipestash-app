import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authApi } from '../services/api';
import { Colors } from '../theme';

export default function RegistrationPage() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [tosError, setTosError] = useState('');

  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validate = () => {
    let valid = true;

    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTosError('');

    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      valid = false;
    }

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

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    if (!tosAccepted) {
      setTosError('You must accept the Terms of Service and Privacy Policy');
      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      setSnackbarType('info');
      await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSnackbarType('success');
      setSnackbarMessage('Account created successfully! 🎉');
      setSnackbarVisible(true);

      setTimeout(() => {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }, 600);
    } catch (error: any) {
      console.error('Registration error:', error);
      setSnackbarType('error');
      setSnackbarMessage(error?.message || 'Registration failed. Please try again.');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join RecipeStash today</Text>
          </View>

          {/* Glassmorphism Card */}
          <View style={styles.card}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  nameError ? styles.inputWrapperError : undefined,
                ]}
              >
                <Icon name="account" size={20} color={Colors.text.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Name *"
                  placeholderTextColor="rgba(12, 22, 7, 0.5)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
              {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
            </View>

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
                  autoComplete="password-new"
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
              <Text style={styles.hint}>Minimum 6 characters</Text>
              {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  confirmPasswordError ? styles.inputWrapperError : undefined,
                  confirmPassword && password && confirmPassword === password 
                    ? styles.inputWrapperSuccess 
                    : confirmPassword && password && confirmPassword !== password 
                    ? styles.inputWrapperError 
                    : undefined,
                ]}
              >
                <Icon 
                  name="lock-check" 
                  size={20} 
                  color={
                    confirmPassword && password && confirmPassword === password
                      ? Colors.status.success || '#4CAF50'
                      : confirmPassword && password && confirmPassword !== password
                      ? Colors.status.error
                      : Colors.text.primary
                  } 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password *"
                  placeholderTextColor="rgba(12, 22, 7, 0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
                {confirmPassword && password && confirmPassword === password && (
                  <Icon 
                    name="check-circle" 
                    size={20} 
                    color={Colors.status.success || '#4CAF50'} 
                    style={styles.successIcon} 
                  />
                )}
              </View>
              {!!confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
            </View>

            {/* Terms Checkbox */}
            <View style={styles.checkboxContainer}>
              <Pressable
                onPress={() => !loading && setTosAccepted(!tosAccepted)}
                style={[
                  styles.checkbox,
                  tosAccepted && styles.checkboxChecked,
                ]}
              >
                {tosAccepted && (
                  <Icon name="check" size={16} color={Colors.primary.main} />
                )}
              </Pressable>
              <Text style={styles.checkboxLabel}>
                I agree to the{' '}
                <Text
                  style={styles.link}
                  onPress={() => (navigation as any).navigate('TermsOfService')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.link}
                  onPress={() => (navigation as any).navigate('PrivacyPolicy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
            {!!tosError && <Text style={styles.errorText}>{tosError}</Text>}

            {/* Create Account Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (!tosAccepted || loading) && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={!tosAccepted || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.signInLink}
                  onPress={() => (navigation as any).navigate('Login')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={[
            styles.snackbar,
            snackbarType === 'success' && styles.snackbarSuccess,
            snackbarType === 'error' && styles.snackbarError,
          ]}
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
  inputWrapperSuccess: {
    borderColor: Colors.status.success || '#4CAF50',
  },
  inputIcon: {
    marginRight: 12,
  },
  successIcon: {
    marginLeft: 8,
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
  hint: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: 'rgba(12, 22, 7, 0.6)',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: Colors.status.error,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#B15912',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: 'rgba(177, 89, 18, 0.15)',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#0C1607',
    lineHeight: 20,
  },
  link: {
    color: '#B15912',
    fontWeight: '600',
    textDecorationLine: 'underline',
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
  snackbar: {
    backgroundColor: Colors.status.info,
  },
  snackbarSuccess: {
    backgroundColor: Colors.status.success,
  },
  snackbarError: {
    backgroundColor: Colors.status.error,
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
