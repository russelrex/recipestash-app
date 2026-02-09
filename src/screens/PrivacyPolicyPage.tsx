import React from 'react';
import { ImageBackground, View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Colors } from '../theme';

// ─── Policy sections ─────────────────────────────────────────────────────────

const SECTIONS = [
  {
    heading: 'Introduction',
    body: `RecipeStash ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use the RecipeStash mobile application ("App") and related services.

Please read this policy carefully. By using the App you consent to the practices described here.`,
  },
  {
    heading: '1. Information We Collect',
    body: `We collect information in the following ways:

Account Information — When you register we collect your name, email address, and a hashed version of your password. You may also optionally provide a bio and profile avatar.

Content You Create — Recipes (including images), posts, comments, and any other content you submit through the App.

Usage Data — Information about how you interact with the App, including pages visited, features used, and session duration. This data is collected automatically.

Device Information — Your device type, operating system, and a unique device identifier, collected for compatibility and performance purposes.

Network Status — We detect whether you are online or offline so the App can function in offline mode. No network traffic data is stored.`,
  },
  {
    heading: '2. How We Use Your Information',
    body: `We use the information we collect to:

• Provide and maintain the App and its features.
• Authenticate your identity and secure your account.
• Store and retrieve your recipes and content.
• Power social features such as following, posts, and feeds.
• Cache data locally on your device for offline access.
• Improve the App through anonymized analytics.
• Communicate with you about your account when necessary.

We do not use your information for targeted advertising.`,
  },
  {
    heading: '3. How We Store Your Data',
    body: `Server-side data is stored securely in cloud infrastructure. Passwords are hashed using bcrypt before storage and are never stored in plain text.

Images you upload are stored in a secure object-storage service (AWS S3) and are accessible only through authenticated requests.

Locally, the App caches your recipe data on your device using encrypted storage. This cache is automatically cleared when you log out and can be manually cleared at any time from Settings.`,
  },
  {
    heading: '4. Information Sharing & Disclosure',
    body: `We do not sell your personal data to third parties.

We may share information in the following limited circumstances:

• With cloud-service providers (e.g., AWS) that help us operate the App, under confidentiality agreements.
• When required by law, regulation, or legal process.
• To protect the safety of users or the public.
• In anonymized or aggregated form for research or analytics, which cannot be linked back to you.

Social features — your name and public content (posts, recipes marked as shared) are visible to other users within the App as described in your Privacy Settings.`,
  },
  {
    heading: '5. Your Privacy Controls',
    body: `You have the following controls over your data:

Public Profile Toggle — You can set your profile to private so that only users you approve can view your information. This option is available in Settings → Privacy Settings.

Content Visibility — By default your recipes are visible only to you. Sharing a recipe via a post makes it visible to your followers.

Data Export — You can export all of your recipes as a JSON file at any time from Settings → Export Recipes.

Account Deletion — You may contact support@recipestash.com to request full deletion of your account and associated data.`,
  },
  {
    heading: '6. Cookies & Local Storage',
    body: `The App does not use web cookies. On your mobile device we use AsyncStorage to persist your authentication token and cached recipe data.

The authentication token is removed when you log out. Cached recipe data can be cleared manually via Settings → Clear Cache and is cleared automatically on logout.`,
  },
  {
    heading: '7. Children\'s Privacy',
    body: `The App is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately at support@recipestash.com so we can delete it.`,
  },
  {
    heading: '8. Security',
    body: `We take reasonable technical and organisational measures to protect your data, including:

• HTTPS encryption for all data in transit.
• Bcrypt password hashing.
• Secure cloud storage for images.
• Automatic cache expiry (24-hour TTL) for locally stored data.

No method of transmission over the internet is 100% secure. We cannot guarantee absolute security, but we will do our best to protect your information.`,
  },
  {
    heading: '9. Data Retention',
    body: `We retain your data for as long as your account is active or as needed to provide the Services. After account deletion we will purge your data within 30 days, except where retention is required by law.

Local cached data on your device is cleared immediately upon logout.`,
  },
  {
    heading: '10. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. If we make material changes we will notify you through the App. The updated policy will be effective upon posting.

We encourage you to review this policy periodically.`,
  },
  {
    heading: '11. Contact Us',
    body: `If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:

support@recipestash.com`,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  const bgImage = require('../../assets/images/placeholder_bg.jpg');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.root}>
        <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.glassContainer}>
              <Text style={styles.effectiveDate}>Effective Date: February 1, 2025</Text>

              {SECTIONS.map((section, idx) => (
                <View key={idx} style={styles.section}>
                  <Text style={styles.heading}>{section.heading}</Text>
                  {section.body.split('\n\n').map((paragraph, pIdx) => (
                    <Text key={pIdx} style={styles.body}>{paragraph}</Text>
                  ))}
                </View>
              ))}

              <View style={styles.footer} />
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  root: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  effectiveDate: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#B15912',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
    marginBottom: 8,
  },
  footer: {
    height: 32,
  },
});
