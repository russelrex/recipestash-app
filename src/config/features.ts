/**
 * Feature Flags Configuration
 *
 * Control app features without code changes.
 * Set ENABLE_SUBSCRIPTIONS to true when ready to launch premium features.
 */

export const FEATURES = {
  // Subscription & Premium Features
  ENABLE_SUBSCRIPTIONS: false,

  // Recipe Limits
  FREE_RECIPE_LIMIT: 999999,
  PREMIUM_RECIPE_LIMIT: 999999,

  // Feature Access
  ENABLE_IMPORT_RECIPE_RESTRICTION: false,
  ENABLE_EXPORT_RESTRICTION: false,
  ENABLE_RECIPE_LIMIT_RESTRICTION: false,

  // UI Display
  SHOW_PREMIUM_BADGES: false,
  SHOW_UPGRADE_PROMPTS: false,
  SHOW_SUBSCRIPTION_PAGE: true,
};

export const isPremiumFeatureEnabled = () => FEATURES.ENABLE_SUBSCRIPTIONS;
export const getRecipeLimit = (isPremium: boolean) =>
  isPremium ? FEATURES.PREMIUM_RECIPE_LIMIT : FEATURES.FREE_RECIPE_LIMIT;
export const shouldShowUpgradePrompt = () => FEATURES.SHOW_UPGRADE_PROMPTS;
