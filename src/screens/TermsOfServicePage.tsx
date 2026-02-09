import React from 'react';
import { ImageBackground, View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Colors } from '../theme';

// ─── Content sections ────────────────────────────────────────────────────────
// Each entry: { heading, body }
// Body may contain \n for paragraph breaks — rendered as separate <Text> blocks.

const SECTIONS = [
  {
    heading: 'Welcome to RecipeStash',
    body: `These Terms of Service ("Terms") govern your access to and use of the RecipeStash application ("App"), website, and related services ("Services") operated by RecipeStash ("we," "us," or "our").

By creating an account or using our Services, you agree to be bound by these Terms. If you do not agree, please do not use the App.`,
  },
  {
    heading: '1. Acceptance & Eligibility',
    body: `You must be at least 13 years old to create an account. By using the App you confirm that you meet this age requirement.

These Terms constitute the entire agreement between you and RecipeStash regarding the Services and supersede all prior agreements.`,
  },
  {
    heading: '2. Accounts & Registration',
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

You agree to notify us immediately of any unauthorized access to your account. We reserve the right to terminate accounts at our discretion.

Each person may maintain only one account. Creating duplicate accounts may result in termination of all associated accounts.`,
  },
  {
    heading: '3. Content & Intellectual Property',
    body: `All content you submit — including recipes, images, comments, and posts — remains your intellectual property. By submitting content you grant us a non-exclusive, worldwide, royalty-free license to store, display, and distribute that content within the App.

You must not submit content that infringes the intellectual property rights of others, contains malware, or violates any applicable law.

The RecipeStash brand, logo, and any other trademarks are our property. You may not use them without written permission.`,
  },
  {
    heading: '4. Prohibited Conduct',
    body: `You agree not to:

• Impersonate another person or entity.
• Harass, threaten, or bully other users.
• Share false or misleading information.
• Attempt to gain unauthorized access to other accounts or systems.
• Use the App to spam or send unsolicited messages.
• Circumvent any technical measures we use to secure the platform.`,
  },
  {
    heading: '5. Data & Privacy',
    body: `Our Privacy Policy, accessible within the App, describes how we collect, use, and share your personal information. By using the App you consent to our data practices as described in that policy.

We do not sell your personal data to third parties. We may share anonymized, aggregated data for analytics purposes.`,
  },
  {
    heading: '6. Third-Party Services',
    body: `The App may integrate with or link to third-party services (e.g., cloud storage providers). We are not responsible for the content or practices of third-party services. Your use of such services is governed by their own terms.`,
  },
  {
    heading: '7. Limitation of Liability',
    body: `To the fullest extent permitted by law, RecipeStash shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services.

Our total liability to you shall not exceed the amount you have paid to RecipeStash in the twelve months preceding the claim.`,
  },
  {
    heading: '8. Termination',
    body: `We may terminate or suspend your access to the Services at any time, with or without cause, and without notice.

Upon termination your right to use the Services ceases immediately. Provisions that by their nature survive termination (e.g., intellectual property, limitation of liability) shall continue to apply.`,
  },
  {
    heading: '9. Changes to These Terms',
    body: `We reserve the right to modify these Terms at any time. If we make material changes we will notify you through the App. Continued use of the Services after the effective date of changes constitutes acceptance of the new Terms.`,
  },
  {
    heading: '10. Governing Law & Disputes',
    body: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which RecipeStash operates, without regard to its conflict-of-law principles.

Any disputes arising under these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive any right to a jury trial or class action.`,
  },
  {
    heading: '11. Contact Us',
    body: `If you have questions about these Terms, contact us at:

support@recipestash.com`,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TermsOfServicePage() {
  const bgImage = require('../../assets/images/placeholder_bg.jpg');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.root}>
        <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.glassContainer}>
              {/* Effective date banner */}
              <Text style={styles.effectiveDate}>Effective Date: February 1, 2025</Text>

              {SECTIONS.map((section, idx) => (
                <View key={idx} style={styles.section}>
                  <Text style={styles.heading}>{section.heading}</Text>
                  {section.body.split('\n\n').map((paragraph, pIdx) => (
                    <Text key={pIdx} style={styles.body}>{paragraph}</Text>
                  ))}
                </View>
              ))}

              {/* Bottom padding so last section isn't flush */}
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
