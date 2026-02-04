import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { Colors } from '../theme';

const { height } = Dimensions.get('window');

export default function HomePage() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Asset.fromModule(require('../../assets/images/placeholder_bg.jpg'))
      .downloadAsync()
      .finally(() => {
        if (isMounted) {
          setBgLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const content = (
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
  );

  // While the background image is downloading, show the same layout on a solid background
  if (!bgLoaded) {
    return <View style={[styles.background, { backgroundColor: Colors.background.default }]}>{content}</View>;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/placeholder_bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      {content}
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  welcomeText: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    color: Colors.text.primary,
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
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  tagline: {
    textAlign: 'center',
    color: Colors.text.primary,
    fontStyle: 'italic',
  },
});

