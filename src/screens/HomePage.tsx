import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BUTTON_STYLES, CARD_STYLES, COLORS, TYPOGRAPHY } from '../styles/modernStyles';
import { Colors } from '../theme';

export default function HomePage() {
  const navigation = useNavigation();

  const content = (
    <View style={styles.overlay}>
      {/* Center Section - Authentication */}
      <View style={styles.centerSection}>
        <View style={[styles.authCard, CARD_STYLES.elevated]}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.subText}>
            Sign in or create an account to get started
          </Text>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            buttonColor={COLORS.primary}
          >
            Sign In
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Registration' as never)}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
            textColor={COLORS.primary}
          >
            Create Account
          </Button>
        </View>
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
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.background}>{content}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.background,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 20,
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
    maxWidth: 500,
    padding: 24,
    alignItems: 'center',
  },
  welcomeText: {
    ...TYPOGRAPHY.h2,
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
  },
  secondaryButton: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  description: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  tagline: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

