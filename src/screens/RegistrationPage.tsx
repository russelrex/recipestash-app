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
import { Button, HelperText, Snackbar, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { authApi } from '../services/api';

const { height } = Dimensions.get('window');

export default function RegistrationPage() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigation = useNavigation();
  const theme = useTheme();

  const handleRegister = async () => {
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
      const response = await authApi.register(name.trim());

      if (response.success) {
        setSnackbarMessage('Welcome to RecipeStash! 🎉');
        setSnackbarVisible(true);

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' as never }],
          });
        }, 1000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
      setSnackbarMessage('Registration failed. Please try again.');
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
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.header}>
                  <Text
                    variant="displaySmall"
                    style={[styles.title, { color: theme.colors.primary }]}
                  >
                    🍳 Welcome!
                  </Text>
                  <Text variant="titleMedium" style={styles.subtitle}>
                    Let's get you started with RecipeStash
                  </Text>
                </View>

                <Text variant="titleLarge" style={styles.cardTitle}>
                  Create Your Account
                </Text>

                <Text variant="bodyMedium" style={styles.description}>
                  Just one quick step! Tell us your name and start organizing your favorite recipes.
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
                  onSubmitEditing={handleRegister}
                  disabled={loading}
                />

                {error ? (
                  <HelperText type="error" visible={!!error}>
                    {error}
                  </HelperText>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Setting Up...' : 'Start Cooking!'}
                </Button>

                <View style={styles.loginBlock}>
                  <View style={styles.loginRow}>
                    <Text variant="bodyMedium" style={styles.loginText}>
                      Already have an account?
                    </Text>
                    <Button
                      mode="text"
                      compact
                      onPress={() => navigation.navigate('Login' as never)}
                      disabled={loading}
                      textColor={theme.colors.primary}
                    >
                      Sign In
                    </Button>
                  </View>

                  <Button
                    mode="text"
                    compact
                    onPress={() => navigation.navigate('Home' as never)}
                    disabled={loading}
                    textColor="#607D8B"
                  >
                    Back to Home
                  </Button>
                </View>
              </ScrollView>
            </Surface>
          </View>
        </View>
      </ImageBackground>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#37474F',
    textAlign: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 25,
    color: '#37474F',
    lineHeight: 22,
  },
  scrollContent: {
    padding: 24,
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
  infoContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  infoText: {
    color: '#37474F',
    textAlign: 'center',
  },
  benefitsContainer: {
    marginTop: 24,
  },
  benefitsTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitItem: {
    marginBottom: 10,
    color: '#37474F',
    lineHeight: 24,
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
  loginBlock: {
    marginTop: 16,
    alignItems: 'center',
    gap: 4,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#37474F',
    marginRight: 4,
  },
});

