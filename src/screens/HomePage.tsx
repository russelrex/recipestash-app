import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

const { height } = Dimensions.get('window');

export default function HomePage() {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <ImageBackground
      source={require('../../assets/images/homepage_bg02.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        {/* Center Section - Authentication */}
        <View style={styles.centerSection}>
          <Surface style={styles.authCard} elevation={3}>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              Welcome!
            </Text>
            <Text variant="bodyMedium" style={styles.subText}>
              Sign in or create an account to get started
            </Text>

            <Button
              mode="contained"
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Registration' as never)}
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>
          </Surface>
        </View>

        {/* Bottom Section - Description */}
        <View style={styles.bottomSection}>
          <Text variant="bodyMedium" style={styles.description}>
            Organize, save, and discover your favorite recipes all in one place
          </Text>
          <Text variant="bodySmall" style={styles.tagline}>
            Your personal cooking companion
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height,
  },
  overlay: {
    flex: 1,
    // Light tint so content is readable but the background image is still very visible
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 72,
    marginBottom: 8,
  },
  appName: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    // Glassmorphism-style card
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 32,
    alignItems: 'center',
    // subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  welcomeText: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    color: '#37474F',
    marginBottom: 32,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12,
  },
  secondaryButton: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: height * 0.08,
    paddingHorizontal: 32,
  },
  description: {
    textAlign: 'center',
    color: '#37474F',
    marginBottom: 8,
    lineHeight: 22,
  },
  tagline: {
    textAlign: 'center',
    color: '#37474F',
    fontStyle: 'italic',
  },
});

