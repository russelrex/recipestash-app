import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ImageBackground, Linking, Platform, Modal as RNModal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Divider, List, Snackbar, Switch, Text } from 'react-native-paper';
import { authApi, followsApi, recipesApi } from '../services/api';
import cacheService from '../services/cache/cacheService';
import { isOfflineMode } from '../services/cache/offlineUtils';
import { CARD_STYLES, COLORS } from '../styles/modernStyles';
import { Colors } from '../theme';

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
  'Keto',
  'Paleo',
];

type ActiveModal = null | 'dietary' | 'units' | 'privacy' | 'blocked';

interface Preferences {
  notificationsEnabled: boolean;
  dietaryRestrictions: string[];
  measurementUnit: 'metric' | 'imperial';
  privacyProfilePublic: boolean;
}

export default function SettingsPage() {
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState<Preferences>({
    notificationsEnabled: true,
    dietaryRestrictions: [],
    measurementUnit: 'metric',
    privacyProfilePublic: true,
  });
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [offline, setOffline] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<{ id: string; name: string; blockedAt: string }[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [cacheSize, setCacheSize] = useState<string>('Calculating...');
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    checkOfflineMode();
    loadPreferences();
    calculateCacheSize();
  }, []);

  const calculateCacheSize = useCallback(async () => {
    try {
      let totalBytes = 0;
      if (FileSystem.cacheDirectory) {
        const dirInfo = await FileSystem.getInfoAsync(FileSystem.cacheDirectory, { size: true });
        if (dirInfo.exists && typeof (dirInfo as { size?: number }).size === 'number') {
          totalBytes += (dirInfo as { size: number }).size;
        }
      }
      const sizeInMB = (totalBytes / (1024 * 1024)).toFixed(2);
      setCacheSize(`${sizeInMB} MB`);
    } catch (error) {
      console.warn('Could not calculate cache size:', error);
      setCacheSize('Unknown');
    }
  }, []);

  const checkOfflineMode = async () => {
    const offlineMode = await isOfflineMode();
    setOffline(offlineMode);
  };

  const loadPreferences = async () => {
    try {
      const prefs = await authApi.getPreferences();
      console.log('prefs', prefs);
      setPreferences(prefs);
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      setSnackbarMessage('Failed to load preferences');
      setSnackbarVisible(true);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const setLoadingState = (key: string, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  // ─── Preferences ────────────────────────────────────────────────

  const handleToggleNotifications = async (value: boolean) => {
    const previousValue = preferences.notificationsEnabled;
    setPreferences(prev => ({ ...prev, notificationsEnabled: value }));

    try {
      await authApi.updatePreferences({ notificationsEnabled: value });
    } catch (error: any) {
      setPreferences(prev => ({ ...prev, notificationsEnabled: previousValue }));
      showSnackbar(error.message || 'Failed to update notifications');
    }
  };

  const handleOpenDietaryModal = () => {
    setActiveModal('dietary');
  };

  const handleSaveDietary = async () => {
    setLoadingState('dietary', true);
    try {
      await authApi.updatePreferences({ dietaryRestrictions: preferences.dietaryRestrictions });
      setActiveModal(null);
      showSnackbar('Dietary preferences saved');
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to save dietary preferences');
    } finally {
      setLoadingState('dietary', false);
    }
  };

  const handleToggleDietary = (option: string) => {
    setPreferences(prev => {
      const restrictions = prev.dietaryRestrictions;
      if (restrictions.includes(option)) {
        return { ...prev, dietaryRestrictions: restrictions.filter(r => r !== option) };
      } else {
        return { ...prev, dietaryRestrictions: [...restrictions, option] };
      }
    });
  };

  const handleOpenUnitsModal = () => {
    setActiveModal('units');
  };

  const handleSelectUnit = (unit: 'metric' | 'imperial') => {
    setPreferences(prev => ({ ...prev, measurementUnit: unit }));
  };

  const handleSaveUnits = async () => {
    setLoadingState('units', true);
    try {
      await authApi.updatePreferences({ measurementUnit: preferences.measurementUnit });
      setActiveModal(null);
      showSnackbar('Measurement units saved');
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to save measurement units');
    } finally {
      setLoadingState('units', false);
    }
  };

  // ─── Data & Storage ───────────────────────────────────────────────

  const handleExportRecipes = async () => {
    setLoadingState('export', true);
    try {
      const recipes = await recipesApi.getAllRecipes();
      const cleanRecipes = recipes.map(recipe => ({
        id: recipe._id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        category: recipe.category,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
      }));

      const jsonString = JSON.stringify(cleanRecipes, null, 2);
      await Share.share({
        message: jsonString,
        title: 'My RecipeStash Recipes',
      });
      showSnackbar(`Exported ${recipes.length} recipe(s)`);
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to export recipes');
    } finally {
      setLoadingState('export', false);
    }
  };

  const handleImportRecipes = async () => {
    if (Platform.OS === 'web') {
      showSnackbar('File import is not available on web');
      return;
    }

    setLoadingState('import', true);
    try {
      // Use expo-document-picker
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.type !== 'success') {
        throw new Error('File selection cancelled');
      }

      const fileUri = result.uri;
      const response = await fetch(fileUri);
      const text = await response.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error('Invalid file format. Expected an array of recipes.');
      }

      const validRecipes: any[] = [];
      let skipped = 0;

      for (const entry of data) {
        if (entry.title && entry.instructions && Array.isArray(entry.instructions)) {
          validRecipes.push({
            title: entry.title,
            description: entry.description || '',
            ingredients: entry.ingredients || [],
            instructions: entry.instructions,
            category: entry.category || 'other',
            prepTime: entry.prepTime || 0,
            cookTime: entry.cookTime || 0,
            servings: entry.servings || 1,
            difficulty: entry.difficulty || 'easy',
          });
        } else {
          skipped++;
        }
      }

      if (validRecipes.length === 0) {
        showSnackbar('No valid recipes found in file');
        return;
      }

      await recipesApi.importRecipes(validRecipes);
      showSnackbar(`Imported ${validRecipes.length} recipe(s), ${skipped} skipped.`);
    } catch (error: any) {
      if (error.message === 'User canceled document picker') {
        // User canceled, don't show error
        return;
      }
      showSnackbar(error.message || 'Failed to import recipes');
    } finally {
      setLoadingState('import', false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      `This will clear ${cacheSize} of cached data including images and temporary files. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearingCache(true);
              await cacheService.clearCache();
              if (FileSystem.cacheDirectory) {
                try {
                  const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
                  for (const file of files) {
                    await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${file}`, { idempotent: true });
                  }
                } catch (e) {
                  console.warn('File cache clear:', e);
                }
              }
              await calculateCacheSize();
              Alert.alert(
                'Success',
                'Cache cleared successfully! The app may take longer to load images next time.',
                [{ text: 'OK' }],
              );
            } catch (error: any) {
              showSnackbar(error?.message || 'Failed to clear cache');
            } finally {
              setClearingCache(false);
            }
          },
        },
      ],
    );
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert(
      'Coming Soon',
      `${feature} is currently under development and will be available in a future update.`,
      [{ text: 'OK' }],
    );
  };

  // ─── Account ──────────────────────────────────────────────────────

  const handleOpenPrivacyModal = () => {
    setActiveModal('privacy');
  };

  const handleTogglePrivacy = (value: boolean) => {
    setPreferences(prev => ({ ...prev, privacyProfilePublic: value }));
  };

  const handleSavePrivacy = async () => {
    setLoadingState('privacy', true);
    try {
      await authApi.updatePreferences({ privacyProfilePublic: preferences.privacyProfilePublic });
      setActiveModal(null);
      showSnackbar('Privacy settings saved');
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to save privacy settings');
    } finally {
      setLoadingState('privacy', false);
    }
  };

  const handleOpenBlockedUsers = async () => {
    setActiveModal('blocked');
    try {
      const users = await followsApi.getBlockedUsers();
      setBlockedUsers(users);
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to load blocked users');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await followsApi.unblockUser(userId);
      setBlockedUsers(prev => prev.filter(u => u.id !== userId));
      showSnackbar('User unblocked');
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to unblock user');
    }
  };

  // ─── Support ─────────────────────────────────────────────────────

  const handleHelpCenter = () => {
    Linking.openURL('https://recipestash.com/help').catch(err => {
      showSnackbar('Failed to open help center');
    });
  };

  // ─── Logout ──────────────────────────────────────────────────────

  const handleLogout = () => {
    setLogoutDialogVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutDialogVisible(false);
    try {
      await authApi.logout();
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  const bgImage = require('../../assets/images/placeholder_bg.jpg');

  // ─── Render Modals ───────────────────────────────────────────────

  const renderModalContent = () => {
    switch (activeModal) {
      case 'dietary':
        return (
          <View style={styles.modalContent}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Dietary Preferences
            </Text>
            <Divider style={styles.modalDivider} />
            <ScrollView 
              style={styles.modalScroll}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
            >
              {DIETARY_OPTIONS.map(option => {
                const isSelected = preferences.dietaryRestrictions.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.dietaryRow, isSelected && styles.dietaryRowSelected]}
                    onPress={() => handleToggleDietary(option)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dietaryText, isSelected && styles.dietaryTextSelected]}>
                      {option}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkIconContainer}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setActiveModal(null)}
                style={styles.modalButton}
                disabled={loading.dietary}
                textColor={Colors.text.secondary}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveDietary}
                style={styles.modalButton}
                buttonColor={Colors.primary.main}
                loading={loading.dietary}
                disabled={loading.dietary}
              >
                Save
              </Button>
            </View>
          </View>
        );

      case 'units':
        return (
          <View style={styles.modalContentUnits}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Measurement Units
            </Text>
            <Divider style={styles.modalDivider} />
            <View style={styles.unitsContainer}>
              <TouchableOpacity
                style={[
                  styles.unitRow,
                  preferences.measurementUnit === 'metric' && styles.unitRowSelected,
                ]}
                onPress={() => handleSelectUnit('metric')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.unitText,
                    preferences.measurementUnit === 'metric' && styles.unitTextSelected,
                  ]}
                >
                  Metric
                </Text>
                {preferences.measurementUnit === 'metric' && (
                  <View style={styles.checkIconContainer}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitRow,
                  preferences.measurementUnit === 'imperial' && styles.unitRowSelected,
                ]}
                onPress={() => handleSelectUnit('imperial')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.unitText,
                    preferences.measurementUnit === 'imperial' && styles.unitTextSelected,
                  ]}
                >
                  Imperial
                </Text>
                {preferences.measurementUnit === 'imperial' && (
                  <View style={styles.checkIconContainer}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setActiveModal(null)}
                style={styles.modalButton}
                disabled={loading.units}
                textColor={Colors.text.secondary}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveUnits}
                style={styles.modalButton}
                buttonColor={Colors.primary.main}
                loading={loading.units}
                disabled={loading.units}
              >
                Save
              </Button>
            </View>
          </View>
        );

      case 'privacy':
        return (
          <View style={styles.modalContentUnits}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Privacy Settings
            </Text>
            <Divider style={styles.modalDivider} />
            <View style={styles.privacyRow}>
              <View style={styles.privacyTextContainer}>
                <Text variant="bodyLarge" style={styles.privacyTitle}>
                  Public Profile
                </Text>
                <Text variant="bodySmall" style={styles.privacyDescription}>
                  Anyone can view your profile and recipes
                </Text>
              </View>
              <Switch
                value={preferences.privacyProfilePublic}
                onValueChange={handleTogglePrivacy}
              />
            </View>
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setActiveModal(null)}
                style={styles.modalButton}
                disabled={loading.privacy}
                textColor={Colors.text.secondary}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSavePrivacy}
                style={styles.modalButton}
                buttonColor={Colors.primary.main}
                loading={loading.privacy}
                disabled={loading.privacy}
              >
                Save
              </Button>
            </View>
          </View>
        );

      case 'blocked':
        return (
          <View style={styles.modalContent}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Blocked Users
            </Text>
            <Divider style={styles.modalDivider} />
            {blockedUsers.length === 0 ? (
              <View style={styles.emptyBlockedContainer}>
                <Text variant="bodyMedium" style={styles.emptyBlockedText}>
                  No blocked users
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {blockedUsers.map(user => (
                  <View key={user.id} style={styles.blockedUserRow}>
                    <Text variant="bodyLarge" style={styles.blockedUserName}>
                      {user.name}
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => handleUnblockUser(user.id)}
                      style={styles.unblockButton}
                      compact
                    >
                      Unblock
                    </Button>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={() => setActiveModal(null)}
                style={styles.modalButton}
                buttonColor={Colors.primary.main}
              >
                Close
              </Button>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.glassContainer}>
            {offline && (
              <View style={styles.offlineBanner}>
                <Text variant="bodySmall" style={styles.offlineText}>
                  📱 You are in offline mode. Some features may be limited.
                </Text>
              </View>
            )}

            <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Notifications"
            description="Enable push notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={preferences.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                disabled={offline}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Dietary Preferences"
            description="Set your dietary restrictions"
            left={props => <List.Icon {...props} icon="food-apple" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenDietaryModal}
            disabled={offline}
          />
          <Divider />
          <List.Item
            title="Measurement Units"
            description="Metric or Imperial"
            left={props => <List.Icon {...props} icon="ruler" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenUnitsModal}
            disabled={offline}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Data & Storage</List.Subheader>
          <List.Item
            title="Clear Cache"
            description={`Cache size: ${cacheSize}`}
            left={props => <List.Icon {...props} icon="delete-sweep" color={COLORS.warning || Colors.status?.warning} />}
            right={() =>
              clearingCache ? (
                <ActivityIndicator size="small" color={Colors.primary.main} />
              ) : (
                <List.Icon icon="chevron-right" />
              )
            }
            onPress={handleClearCache}
            disabled={offline || clearingCache}
          />
          <Divider />
          <List.Item
            title="Export Recipes"
            description="Coming soon"
            left={props => <List.Icon {...props} icon="export" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleComingSoon('Export Recipes')}
            style={styles.listItemComingSoon}
          />
          <Divider />
          <List.Item
            title="Import Recipes"
            description="Coming soon"
            left={props => <List.Icon {...props} icon="import" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleComingSoon('Import Recipes')}
            style={styles.listItemComingSoon}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Privacy Settings"
            description="Manage your privacy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenPrivacyModal}
            disabled={offline}
          />
          <Divider />
          <List.Item
            title="Blocked Users"
            description="Manage blocked accounts"
            left={props => <List.Icon {...props} icon="account-cancel" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenBlockedUsers}
            disabled={offline}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Legal</List.Subheader>
          <List.Item
            title="Terms of Service"
            description="View our Terms of Service"
            left={props => <List.Icon {...props} icon="file-document-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => (navigation as any).navigate('TermsOfService')}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            description="View our Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => (navigation as any).navigate('PrivacyPolicy')}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Support</List.Subheader>
          <List.Item
            title="Help Center"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleHelpCenter}
          />
          <Divider />
          <List.Item
            title="About RecipeStash"
            description="Version 1.0.7"
            left={props => <List.Icon {...props} icon="information" />}
          />
        </List.Section>

        <Button
          mode="contained"
          buttonColor={Colors.primary.main}
          style={styles.logoutButton}
          onPress={handleLogout}
          icon="logout"
        >
          Logout
        </Button>

            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                Made with ❤️ for food lovers
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modal */}
      <RNModal
        visible={activeModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setActiveModal(null)}
          />
          <View style={[
            styles.modalContainer,
            (activeModal === 'units' || activeModal === 'privacy') && styles.modalContainerCompact
          ]}>
            {renderModalContent()}
          </View>
        </View>
      </RNModal>

      {/* Logout Dialog */}
      <RNModal
        visible={logoutDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutDialogVisible(false)}
      >
        <TouchableOpacity
          style={styles.dialogOverlay}
          activeOpacity={1}
          onPress={() => setLogoutDialogVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialogContainer}>
              <Text variant="titleLarge" style={styles.dialogTitle}>
                Logout
              </Text>
              <Text variant="bodyMedium" style={styles.dialogMessage}>
                Are you sure you want to logout?
              </Text>
              <View style={styles.dialogActions}>
                <Button
                  mode="outlined"
                  onPress={() => setLogoutDialogVisible(false)}
                  style={styles.dialogButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={confirmLogout}
                  style={styles.dialogButton}
                  buttonColor={Colors.primary.main}
                >
                  Logout
                </Button>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </RNModal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    paddingTop: 24,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  glassContainer: {
    ...(CARD_STYLES.standard as object),
    padding: 16,
  },
  offlineBanner: {
    backgroundColor: Colors.status.warning || '#FFF3CD',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.status.warning || '#FF9800',
  },
  offlineText: {
    color: Colors.status.warning || '#856404',
    textAlign: 'center',
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: Colors.text.disabled,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '90%',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    justifyContent: 'flex-end',
  },
  modalContainerCompact: {
    flex: 0,
    alignSelf: 'flex-end',
  },
  modalContent: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: '100%',
    backgroundColor: '#FFFFFF',
  },
  modalContentUnits: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 20,
    color: Colors.text.primary,
  },
  modalDivider: {
    marginBottom: 20,
    marginTop: 4,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
    borderRadius: 8,
  },
  // Dietary modal
  dietaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: Colors.border.light,
    minHeight: 56,
  },
  dietaryRowSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
    elevation: 2,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dietaryText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  dietaryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Units modal
  unitsContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: Colors.border.light,
    minHeight: 60,
  },
  unitRowSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
    elevation: 2,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  unitText: {
    fontSize: 17,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  unitTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  // Privacy modal
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.background.default,
  },
  privacyTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  privacyTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyDescription: {
    color: Colors.text.secondary,
  },
  // Blocked users modal
  emptyBlockedContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyBlockedText: {
    color: Colors.text.secondary,
  },
  blockedUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.background.default,
    marginBottom: 8,
  },
  blockedUserName: {
    flex: 1,
  },
  unblockButton: {
    marginLeft: 12,
  },
  // Dialog styles
  dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  dialogTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dialogMessage: {
    marginBottom: 20,
    color: Colors.text.secondary,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogButton: {
    minWidth: 100,
  },
  snackbar: {
    backgroundColor: Colors.primary.main,
  },
  listItemComingSoon: {
    opacity: 0.7,
  },
});
