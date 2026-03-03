import React from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../styles/modernStyles';

interface UpgradeModalProps {
  visible: boolean;
  recipeCount: number;
  onClose: () => void;
}

const WEBSITE_URL =
  process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://www.recipestash.food';

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  visible,
  recipeCount,
  onClose,
}) => {
  const handleUpgrade = () => {
    const url = `${WEBSITE_URL}/subscription`;
    Linking.openURL(url);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Icon name="crown" size={48} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Recipe Limit Reached</Text>

          <Text style={styles.message}>
            You&apos;ve created {recipeCount} out of 10 free recipes.
            {'\n\n'}
            Upgrade to <Text style={styles.premium}>Premium</Text> for
            unlimited recipes and exclusive features.
          </Text>

          <View style={styles.featuresContainer}>
            <Feature icon="infinity" text="Unlimited recipes" />
            <Feature icon="filter-variant" text="Advanced search filters" />
            <Feature icon="calendar" text="Meal planning tools" />
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
          >
            <Icon
              name="crown"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe later</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            You&apos;ll be redirected to our website to complete the upgrade.
            {'\n'}
            Please log in to your RecipeStash account on the website to
            manage or upgrade your subscription.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const Feature: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.feature}>
    <Icon name={icon} size={20} color={COLORS.primary} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

export default UpgradeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...(SHADOWS.large as object),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryAlpha10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...(TYPOGRAPHY.h2 as object),
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    ...(TYPOGRAPHY.body as object),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  premium: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  featureText: {
    ...(TYPOGRAPHY.body as object),
    flex: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 8,
    ...(SHADOWS.medium as object),
  },
  buttonIcon: {
    marginRight: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: 10,
    marginBottom: 12,
  },
  closeButtonText: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.textSecondary,
  },
  note: {
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

