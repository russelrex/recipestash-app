import React from 'react';
import {
  Modal,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../styles/modernStyles';

interface PremiumUpgradePromptProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
}

const WEBSITE_URL =
  process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://www.recipestash.food';

export default function PremiumUpgradePrompt({
  visible,
  onClose,
  feature,
  description,
}: PremiumUpgradePromptProps) {
  const handleUpgrade = async () => {
    const subscriptionUrl = `${WEBSITE_URL}/subscription`;
    try {
      const canOpen = await Linking.canOpenURL(subscriptionUrl);
      if (canOpen) {
        await Linking.openURL(subscriptionUrl);
      }
    } catch {
      // Swallow; nothing else to do if Linking fails
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.iconContainer}>
                <View style={styles.crownCircle}>
                  <Icon name="crown" size={56} color={COLORS.primary} />
                </View>
              </View>

              <Text style={styles.title}>Premium Feature</Text>

              <View style={styles.featureBadge}>
                <Icon name="lock" size={16} color={COLORS.primary} />
                <Text style={styles.featureName}>{feature}</Text>
              </View>

              {description && (
                <Text style={styles.description}>{description}</Text>
              )}

              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Unlock with Premium:</Text>
                <BenefitItem
                  icon="cloud-download"
                  text="Import recipes from your favorite websites"
                />
                <BenefitItem
                  icon="infinity"
                  text="Unlimited recipe storage in RecipeStash"
                />
                <BenefitItem
                  icon="cloud-sync"
                  text="Automatic sync and secure backup"
                />
              </View>

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
              >
                <Icon name="crown" size={22} color="#fff" />
                <Text style={styles.upgradeButtonText}>
                  Upgrade to Premium
                </Text>
                <Icon name="arrow-right" size={22} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.infoText}>
                You&apos;ll be redirected to our website to complete your
                subscription.
              </Text>

              <TouchableOpacity style={styles.laterButton} onPress={onClose}>
                <Text style={styles.laterButtonText}>Maybe later</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIconContainer}>
        <Icon name={icon} size={18} color={COLORS.success} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    ...(SHADOWS.large as object),
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackgroundAlt,
    zIndex: 10,
  },
  content: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  crownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryAlpha10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...(TYPOGRAPHY.h2 as object),
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryAlpha10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  featureName: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.primary,
  },
  description: {
    ...(TYPOGRAPHY.body as object),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  benefitsContainer: {
    backgroundColor: COLORS.cardBackgroundAlt,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  benefitsTitle: {
    ...(TYPOGRAPHY.label as object),
    marginBottom: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  benefitIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.greenAlpha10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.text,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    ...(SHADOWS.medium as object),
    marginBottom: SPACING.sm,
  },
  upgradeButtonText: {
    ...(TYPOGRAPHY.label as object),
    color: '#fff',
    fontSize: 16,
  },
  infoText: {
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  laterButtonText: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

