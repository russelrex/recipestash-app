import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Snackbar, Surface, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../services/api';
import { Colors } from '../theme';

export default function RegistrationPage() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ── ToS acceptance ──────────────────────────────────────────────────────
  const [tosAccepted, setTosAccepted] = useState(false);
  const [tosError, setTosError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    setNameError('');
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (name.trim().length > 50) {
      setNameError('Name must not exceed 50 characters');
      return false;
    }
    return true;
  };

  const validateEmailField = (email: string): boolean => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validatePasswordField = (password: string): boolean => {
    setPasswordError('');
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    if (password.length > 100) {
      setPasswordError('Password must not exceed 100 characters');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    // Clear all errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setTosError('');

    // Validate all fields
    const isNameValid = validateName(name);
    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);

    if (!tosAccepted) {
      setTosError('You must accept the Terms of Service and Privacy Policy');
    }

    if (!isNameValid || !isEmailValid || !isPasswordValid || !tosAccepted) {
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSnackbarMessage('Account created successfully! 🎉');
        setSnackbarVisible(true);

        setTimeout(() => {
        (navigation as any).reset({
            index: 0,
          routes: [{ name: 'MainTabs' }],
          });
      }, 500);
    } catch (error: any) {
      console.error('Registration error:', error);
      setSnackbarMessage(error.message || 'Registration failed. Please try again.');
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
        <ImageBackground
          source={require('../../assets/images/placeholder_bg.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <View style={styles.centerSection}>
              <Surface style={styles.authCard} elevation={3}>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                <Text variant="headlineSmall" style={styles.welcomeText}>
                  Create Account
                </Text>
                <Text variant="bodyMedium" style={styles.subText}>
                  Join RecipeStash today
                </Text>

                {/* Name Field */}
                <TextInput
                  label="Name *"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) validateName(text);
                  }}
                  onBlur={() => validateName(name)}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="words"
                  autoComplete="name"
                  left={<TextInput.Icon icon="account-outline" />}
                  outlineColor={nameError ? Colors.status.error : 'rgba(255, 255, 255, 0.8)'}
                  activeOutlineColor={nameError ? Colors.status.error : Colors.primary.main}
                  error={!!nameError}
                  disabled={loading}
                  theme={{ colors: { onSurface: Colors.text.primary } }}
                />
                {nameError ? (
                  <HelperText type="error" visible={!!nameError} style={styles.helperText}>
                    {nameError}
                  </HelperText>
                ) : null}

                {/* Email Field */}
                <TextInput
                  label="Email Address *"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmailField(text);
                  }}
                  onBlur={() => validateEmailField(email)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  left={<TextInput.Icon icon="email-outline" />}
                  outlineColor={emailError ? Colors.status.error : 'rgba(255, 255, 255, 0.8)'}
                  activeOutlineColor={emailError ? Colors.status.error : Colors.primary.main}
                  error={!!emailError}
                  disabled={loading}
                  theme={{ colors: { onSurface: Colors.text.primary } }}
                />
                {emailError ? (
                  <HelperText type="error" visible={!!emailError} style={styles.helperText}>
                    {emailError}
                  </HelperText>
                ) : null}

                {/* Password Field */}
                <TextInput
                  label="Password *"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePasswordField(text);
                  }}
                  onBlur={() => validatePasswordField(password)}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  outlineColor={passwordError ? Colors.status.error : 'rgba(255, 255, 255, 0.8)'}
                  activeOutlineColor={passwordError ? Colors.status.error : Colors.primary.main}
                  error={!!passwordError}
                  disabled={loading}
                  theme={{ colors: { onSurface: Colors.text.primary } }}
                />
                {passwordError ? (
                  <HelperText type="error" visible={!!passwordError} style={styles.helperText}>
                    {passwordError}
                  </HelperText>
                ) : (
                  <HelperText type="info" visible={!passwordError} style={styles.helperText}>
                    Minimum 6 characters
                  </HelperText>
                )}

                {/* ── Terms & Privacy checkbox ─────────────────────────── */}
                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => {
                    setTosAccepted(prev => !prev);
                    setTosError('');
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: tosAccepted }}
                  disabled={loading}
                >
                  {/* Checkbox box */}
                  <View style={[styles.checkboxBox, tosAccepted && styles.checkboxBoxActive]}>
                    {tosAccepted && <Text style={styles.checkmark}>✓</Text>}
                  </View>

                  {/* Label with tappable links */}
                  <Text style={styles.checkboxLabel}>
                    I agree to the{' '}
                    <Text
                      style={styles.link}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        (navigation as any).navigate('TermsOfService');
                      }}
                    >
                      Terms of Service
                    </Text>
                    {' '}and{' '}
                    <Text
                      style={styles.link}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        (navigation as any).navigate('PrivacyPolicy');
                      }}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                </Pressable>

                {tosError ? (
                  <HelperText type="error" visible={!!tosError} style={styles.helperText}>
                    {tosError}
                  </HelperText>
                ) : null}

                {/* Register Button */}
                <Button
                  mode="contained"
                  onPress={handleRegister}
                  style={styles.primaryButton}
                  contentStyle={styles.buttonContent}
                  loading={loading}
                  disabled={loading || !tosAccepted}
                  buttonColor={Colors.primary.main}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                {/* Sign In Link */}
                    <Button
                      mode="text"
                  onPress={() => navigation.goBack()}
                  style={styles.secondaryButton}
                  textColor={Colors.primary.main}
                      disabled={loading}
                >
                  Already have an account? Sign In
                  </Button>
                </ScrollView>
              </Surface>
            </View>
          </View>
        </ImageBackground>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'Close',
            onPress: () => setSnackbarVisible(false),
          }}
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
    backgroundColor: Colors.background.default,
  },
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  centerSection: {
    width: '100%',
    alignItems: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  },
  welcomeText: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.text.primary,
  },
  subText: {
    color: Colors.text.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  helperText: {
    marginTop: 0,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  primaryButton: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
  },
  secondaryButton: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  // ── checkbox ──────────────────────────────────────────────────────────────
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 4,
    gap: 10,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#aaa',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1, // optical vertical centre with first line of label
  },
  checkboxBoxActive: {
    borderColor: '#B15912',
    backgroundColor: '#B15912',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  link: {
    color: '#B15912',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
