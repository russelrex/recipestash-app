import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  CARD_STYLES,
  COLORS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../styles/modernStyles';
import {
  subscriptionApi,
  type SubscriptionResponse,
} from '../services/api';

const WEBSITE_URL =
  process.env.EXPO_PUBLIC_WEBSITE_URL || 'http://localhost:3001';

export default function SubscriptionPage({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] =
    useState<SubscriptionResponse | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.getSubscription();
      setSubscription(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    Linking.openURL(`${WEBSITE_URL}/subscription`);
  };

  const isPremium =
    subscription?.subscription?.plan === 'premium' &&
    subscription?.subscription?.subscriptionStatus === 'active';

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading subscription...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[CARD_STYLES.elevated, styles.planCard]}>
          <View style={styles.planHeader}>
            <Icon
              name={isPremium ? 'crown' : 'account'}
              size={48}
              color={isPremium ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={styles.planName}>
              {isPremium ? 'Premium' : 'Free'} Plan
            </Text>
            {isPremium && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>

          {isPremium ? (
            <View style={styles.planDetails}>
              <Text style={styles.expiryLabel}>Expires on</Text>
              <Text style={styles.expiryDate}>
                {subscription?.subscription?.subscriptionEndsAt
                  ? new Date(
                      subscription.subscription.subscriptionEndsAt,
                    ).toLocaleDateString()
                  : '—'}
              </Text>
            </View>
          ) : (
            <Text style={styles.planDescription}>
              Limited to 10 recipes. Upgrade for unlimited recipes.
            </Text>
          )}
        </View>

        <View style={[CARD_STYLES.elevated, styles.featuresCard]}>
          <Text style={styles.featuresTitle}>
            {isPremium ? 'Your Premium Features' : 'Premium Features'}
          </Text>

          <Feature
            icon="infinity"
            title="Unlimited Recipes"
            description="Create as many recipes as you want"
            active={isPremium}
          />
          <Feature
            icon="cloud-upload"
            title="Cloud Sync"
            description="Access your recipes from any device"
            active={isPremium}
          />
          <Feature
            icon="filter-variant"
            title="Advanced Search"
            description="Find recipes faster with filters"
            active={isPremium}
          />
          <Feature
            icon="calendar"
            title="Meal Planning"
            description="Plan your weekly meals"
            active={isPremium}
          />
          <Feature
            icon="export-variant"
            title="Export Recipes"
            description="Export and share your recipes"
            active={isPremium}
          />
        </View>

        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
          >
            <Icon name="crown" size={24} color="#fff" />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}

        {subscription?.payments && subscription.payments.length > 0 && (
          <View style={styles.paymentsSection}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            {subscription.payments.map(payment => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentPurpose}>{payment.purpose}</Text>
                  <Text style={styles.paymentDate}>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.paymentAmount}>
                  <Text style={styles.amount}>
                    ₱{(payment.amount / 100).toFixed(2)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(payment.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{payment.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.note}>
          Subscriptions are managed through our website. You&apos;ll be
          redirected to complete the payment process.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const Feature: React.FC<{
  icon: string;
  title: string;
  description: string;
  active: boolean;
}> = ({ icon, title, description, active }) => (
  <View style={styles.feature}>
    <View
      style={[
        styles.featureIcon,
        {
          backgroundColor: active
            ? COLORS.primaryAlpha20
            : COLORS.cardBackgroundAlt,
        },
      ]}
    >
      <Icon
        name={active ? icon : 'lock'}
        size={24}
        color={active ? COLORS.primary : COLORS.textLight}
      />
    </View>
    <View style={styles.featureText}>
      <Text
        style={[
          styles.featureTitle,
          !active && styles.featureTitleInactive,
        ]}
      >
        {title}
      </Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
    {active && <Icon name="check-circle" size={20} color={COLORS.success} />}
  </View>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return '#10B981';
    case 'pending':
      return '#F59E0B';
    case 'failed':
      return '#EF4444';
    default:
      return COLORS.textSecondary;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...(TYPOGRAPHY.body as object),
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...(TYPOGRAPHY.h2 as object),
  },
  planCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  planName: {
    ...(TYPOGRAPHY.h1 as object),
    marginTop: SPACING.sm,
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: SPACING.xs,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planDetails: {
    alignItems: 'center',
  },
  expiryLabel: {
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textSecondary,
  },
  expiryDate: {
    ...(TYPOGRAPHY.h3 as object),
    marginTop: 4,
  },
  planDescription: {
    ...(TYPOGRAPHY.body as object),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  featuresCard: {
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.lg,
  },
  featuresTitle: {
    ...(TYPOGRAPHY.h3 as object),
    marginBottom: SPACING.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...(TYPOGRAPHY.label as object),
    fontSize: 15,
    marginBottom: 2,
  },
  featureTitleInactive: {
    color: COLORS.textLight,
  },
  featureDescription: {
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textSecondary,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    padding: 18,
    borderRadius: 12,
    ...(SHADOWS.medium as object),
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  paymentsSection: {
    margin: SPACING.md,
  },
  sectionTitle: {
    ...(TYPOGRAPHY.h3 as object),
    marginBottom: SPACING.md,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    ...(SHADOWS.small as object),
  },
  paymentInfo: {
    flex: 1,
  },
  paymentPurpose: {
    ...(TYPOGRAPHY.label as object),
    fontSize: 14,
    marginBottom: 4,
  },
  paymentDate: {
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textSecondary,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    ...(TYPOGRAPHY.h4 as object),
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  note: {
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textSecondary,
    textAlign: 'center',
    margin: SPACING.md,
    fontStyle: 'italic',
  },
});

