import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Snackbar, Surface, Text, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import offlineAuth from '../services/cache/offlineAuth';
import { Colors } from '../theme';

const { height } = Dimensions.get('window');

export default function OfflineLoginPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Pre-fill email if available
    offlineAuth.getStoredEmail().then(storedEmail => {
      if (storedEmail) {
        setEmail(storedEmail);
      }
    });
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    return true;
  };

  const handleOfflineLogin = async () => {
    // Clear all errors
    setEmailError('');
    setPasswordError('');

    // Validate all fields
    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const isValid = await offlineAuth.verifyOfflineLogin(email, password);

      if (!isValid) {
        setSnackbarMessage('Invalid email or password');
        setSnackbarVisible(true);
        return;
      }

      // Store offline token
      await AsyncStorage.setItem('authToken', 'offline');
      
      // Get stored userId and userName if available
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');

      if (!userId || !userName) {
        // If no user data, we can't proceed
        setSnackbarMessage('User data not found. Please login online first.');
        setSnackbarVisible(true);
        return;
      }

      setSnackbarMessage('Offline login successful! 📱');
      setSnackbarVisible(true);

      setTimeout(() => {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }, 500);
    } catch (error: any) {
      console.error('Offline login error:', error);
      setSnackbarMessage(error.message || 'Offline login failed');
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
                  Offline Mode
                </Text>
                <Text variant="bodyMedium" style={styles.subText}>
                  Sign in to access cached recipes
                </Text>
                <Text variant="bodySmall" style={styles.warningText}>
                  ⚠️ You are currently offline. Only cached data is available.
                </Text>

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
                  autoComplete="password"
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
                ) : null}

                {/* Login Button */}
                <Button
                  mode="contained"
                  onPress={handleOfflineLogin}
                  style={styles.primaryButton}
                  contentStyle={styles.buttonContent}
                  loading={loading}
                  disabled={loading}
                  buttonColor={Colors.primary.main}
                >
                  {loading ? 'Signing In...' : 'Sign In Offline'}
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
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    color: Colors.status.warning || '#FF9800',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
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
  buttonContent: {
    paddingVertical: 8,
  },
});
