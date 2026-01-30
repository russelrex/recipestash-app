import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  HelperText,
  Portal,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { authApi } from '../services/api';
import { Colors } from '../theme';

const { height } = Dimensions.get('window');

export default function LoginPage() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const navigation = useNavigation();
  const theme = useTheme();

  const handleLogin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(name.trim());

      if (response.success) {
        // Show success modal and redirect to dashboard
        setSuccessVisible(true);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' as never }],
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.message || 'Login failed. Please try again.';
      setError(message);
      setSnackbarMessage(message);
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
            <View style={styles.authCard}>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.header}>
                  <Text
                    variant="displaySmall"
                    style={[styles.title, { color: theme.colors.primary }]}
                  >
                    🍳 Welcome Back!
                  </Text>
                  <Text variant="titleMedium" style={styles.subtitle}>
                    Login to RecipeStash
                  </Text>
                </View>

                <Text variant="titleLarge" style={styles.cardTitle}>
                  Sign In
                </Text>

                <Text variant="bodyMedium" style={styles.description}>
                  Enter your name to access your recipe collection
                </Text>

                <TextInput
                  label="Your Name"
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    setError('');
                  }}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., John Doe"
                  error={!!error}
                  left={<TextInput.Icon icon="account" />}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  disabled={loading}
                />

                {error ? (
                  <HelperText type="error" visible={!!error}>
                    {error}
                  </HelperText>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <View style={styles.registerContainer}>
                  <Text variant="bodyMedium" style={styles.registerText}>
                    Don't have an account?{' '}
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Registration' as never)}
                    disabled={loading}
                    textColor={theme.colors.primary}
                  >
                    Register
                  </Button>
                </View>

                <View style={styles.infoCard}>
                  <Text variant="bodyMedium" style={styles.infoText}>
                    💡 Tip: Use the same name you registered with to access your recipes
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Error notification */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}>
        {snackbarMessage}
      </Snackbar>

      {/* Success modal */}
      <Portal>
        <Dialog
          visible={successVisible}
          onDismiss={() => setSuccessVisible(false)}>
          <Dialog.Title>Login Successful</Dialog.Title>
          <Dialog.Content>
            <Text>Welcome back! 🎉 You&apos;ll be taken to your dashboard.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setSuccessVisible(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' as never }],
                });
              }}>
              Go to Dashboard
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.text.primary,
    textAlign: 'center',
  },
  card: {
    elevation: 4,
    marginBottom: 20,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 25,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  registerText: {
    color: Colors.text.primary,
  },
  infoCard: {
    marginTop: 24,
  },
  infoText: {
    color: Colors.text.primary,
    textAlign: 'center',
  },
});

