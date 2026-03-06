import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { recipesApi, type Recipe } from '../services/api';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../styles/modernStyles';

interface ImportRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (recipe: Recipe) => void;
}

export default function ImportRecipeModal({
  visible,
  onClose,
  onSuccess,
}: ImportRecipeModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      // Basic URL validation
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imported = await recipesApi.importRecipe(url);

      const title = imported?.title || 'Recipe';

      Alert.alert(
        'Success!',
        `Recipe "${title}" has been imported`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess(imported);
              handleClose();
            },
          },
        ],
      );
    } catch (err: any) {
      const errorMessage =
        err.message || 'Failed to import recipe. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setUrl('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Import Recipe</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name="cloud-download" size={64} color={COLORS.primary} />
            </View>

            <Text style={styles.description}>
              Import recipes from your favorite cooking websites. Paste the
              recipe URL below.
            </Text>

            <View style={styles.supportedSites}>
              <Text style={styles.supportedTitle}>Works with:</Text>
              <View style={styles.sitesList}>
                <Text style={styles.siteItem}>• AllRecipes</Text>
                <Text style={styles.siteItem}>• Food Network</Text>
                <Text style={styles.siteItem}>• BBC Good Food</Text>
                <Text style={styles.siteItem}>• Serious Eats</Text>
                <Text style={styles.siteItem}>• And many more</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Recipe URL</Text>
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={text => {
                  setUrl(text);
                  setError(null);
                }}
                placeholder="https://www.example.com/recipe"
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                editable={!loading}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>Tip</Text>
              <Text style={styles.exampleText}>
                Open the recipe in your browser, then copy and paste the page
                URL here.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.importButton,
                loading && styles.importButtonDisabled,
              ]}
              onPress={handleImport}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.importButtonText}>Importing...</Text>
                </View>
              ) : (
                <>
                  <Icon name="download" size={20} color="#fff" />
                  <Text style={styles.importButtonText}>Import Recipe</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...(TYPOGRAPHY.h3 as object),
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    ...(TYPOGRAPHY.body as object),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  supportedSites: {
    backgroundColor: COLORS.primaryAlpha10,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  supportedTitle: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  sitesList: {
    gap: 4,
  },
  siteItem: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.primaryDark,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.error + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.error,
  },
  exampleContainer: {
    backgroundColor: COLORS.info + '10',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  exampleTitle: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.info,
    marginBottom: 4,
  },
  exampleText: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.textSecondary,
  },
  importButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...(SHADOWS.medium as object),
  },
  importButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  importButtonText: {
    ...(TYPOGRAPHY.label as object),
    color: '#fff',
    fontSize: 16,
  },
});

