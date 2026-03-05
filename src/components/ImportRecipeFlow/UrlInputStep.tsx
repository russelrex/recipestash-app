import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/modernStyles';

interface UrlInputStepProps {
  category: string;
  onBack: () => void;
  onSubmit: (url: string) => void;
  onClose: () => void;
  error?: string | null;
}

export default function UrlInputStep({
  category,
  onBack,
  onSubmit,
  onClose,
  error,
}: UrlInputStepProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (!url.trim()) return;
    onSubmit(url.trim());
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Import Recipe</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 3</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.categoryBadge}>
            <Icon name="check-circle" size={16} color="#10B981" />
            <Text style={styles.categoryBadgeText}>
              Category: {category}
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <Icon name="link-variant" size={64} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Paste Recipe URL</Text>
          <Text style={styles.description}>
            Enter the URL of the recipe you want to import.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://www.example.com/recipe"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              multiline
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.supportedSites}>
            <Text style={styles.supportedTitle}>Works with:</Text>
            <Text style={styles.supportedList}>
              AllRecipes, Food Network, BBC Good Food, Serious Eats, and more.
            </Text>
          </View>

          <View style={styles.tipContainer}>
            <Icon name="lightbulb-outline" size={20} color={COLORS.warning} />
            <Text style={styles.tipText}>
              Copy the URL from your browser when viewing the recipe page.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              !url.trim() && styles.continueButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!url.trim()}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Icon name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...(TYPOGRAPHY.h3 as object),
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    ...(TYPOGRAPHY.caption as object),
    textAlign: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  categoryBadgeText: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: '#059669',
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...(TYPOGRAPHY.h2 as object),
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    ...(TYPOGRAPHY.body as object),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 16,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
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
  supportedSites: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  supportedTitle: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.primary,
    marginBottom: 6,
  },
  supportedList: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: '#92400E',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  tipText: {
    flex: 1,
    ...(TYPOGRAPHY.bodySmall as object),
    color: '#92400E',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  continueButtonText: {
    ...(TYPOGRAPHY.label as object),
    color: '#fff',
    fontSize: 16,
  },
});

