import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Snackbar, Surface, Text, TextInput } from 'react-native-paper';
import { authApi } from '../services/api';
import { Colors } from '../theme';

const { height } = Dimensions.get('window');

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

    // Validate all fields
    const isNameValid = validateName(name);
    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ImageBackground
        source={require('../../assets/images/homepage_bg02.jpg')}
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

                {/* Register Button */}
                <Button
                  mode="contained"
                  onPress={handleRegister}
                  style={styles.primaryButton}
                  contentStyle={styles.buttonContent}
                  loading={loading}
                  disabled={loading}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: '100%',
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  centerSection: {
    width: '100%',
    alignItems: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  scrollContent: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
  },
  secondaryButton: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
