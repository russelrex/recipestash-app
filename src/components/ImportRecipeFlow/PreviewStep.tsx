import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScrapedRecipeData } from './ImportRecipeFlow';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/modernStyles';

interface PreviewStepProps {
  data: ScrapedRecipeData;
  category: string;
  onReject: () => void;
  onAccept: (editedData: ScrapedRecipeData) => void;
  onClose: () => void;
}

export default function PreviewStep({
  data,
  category,
  onReject,
  onAccept,
  onClose,
}: PreviewStepProps) {
  const [editedData, setEditedData] = useState<ScrapedRecipeData>(data);
  const [creating, setCreating] = useState(false);

  const handleAccept = async () => {
    setCreating(true);
    await onAccept(editedData);
    setCreating(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Recipe</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 3</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={48} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Recipe Imported!</Text>
          <Text style={styles.successDescription}>
            Review the details and make any changes before creating.
          </Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>Category: {category}</Text>
          </View>

          {editedData.imageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: editedData.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={editedData.title}
              onChangeText={text =>
                setEditedData({ ...editedData, title: text })
              }
              multiline
            />
          </View>

          {editedData.description && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                value={editedData.description}
                onChangeText={text =>
                  setEditedData({ ...editedData, description: text })
                }
                multiline
              />
            </View>
          )}

          <View style={styles.infoGrid}>
            {editedData.prepTime && editedData.prepTime > 0 && (
              <View style={styles.infoCard}>
                <Icon name="clock-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Prep</Text>
                <Text style={styles.infoValue}>
                  {editedData.prepTime} min
                </Text>
              </View>
            )}
            {editedData.cookTime && editedData.cookTime > 0 && (
              <View style={styles.infoCard}>
                <Icon name="fire" size={20} color={COLORS.error} />
                <Text style={styles.infoLabel}>Cook</Text>
                <Text style={styles.infoValue}>
                  {editedData.cookTime} min
                </Text>
              </View>
            )}
            {editedData.servings && editedData.servings > 0 && (
              <View style={styles.infoCard}>
                <Icon
                  name="account-group"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.infoLabel}>Servings</Text>
                <Text style={styles.infoValue}>{editedData.servings}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="format-list-bulleted"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.sectionTitle}>
                Ingredients ({editedData.ingredients.length})
              </Text>
            </View>
            <View style={styles.listContainer}>
              {editedData.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listBullet} />
                  <Text style={styles.listText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="format-list-numbered"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.sectionTitle}>
                Instructions ({editedData.instructions.length})
              </Text>
            </View>
            <View style={styles.listContainer}>
              {editedData.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sourceContainer}>
            <Icon name="link-variant" size={16} color={COLORS.textSecondary} />
            <Text style={styles.sourceText} numberOfLines={1}>
              {editedData.sourceUrl}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={onReject}
            disabled={creating}
          >
            <Icon name="close" size={20} color={COLORS.error} />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.acceptButton,
              creating && styles.acceptButtonDisabled,
            ]}
            onPress={handleAccept}
            disabled={creating}
          >
            {creating ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.acceptButtonText}>Creating...</Text>
              </>
            ) : (
              <>
                <Icon name="check" size={20} color="#fff" />
                <Text style={styles.acceptButtonText}>Create Recipe</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  progressText: {
    ...(TYPOGRAPHY.caption as object),
    textAlign: 'center',
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  successTitle: {
    ...(TYPOGRAPHY.h2 as object),
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  successDescription: {
    ...(TYPOGRAPHY.body as object),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.primaryAlpha10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  categoryBadgeText: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.primary,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  descriptionInput: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textSecondary,
  },
  infoValue: {
    ...(TYPOGRAPHY.body as object),
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    ...(TYPOGRAPHY.h4 as object),
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  listText: {
    flex: 1,
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.text,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...(TYPOGRAPHY.caption as object),
    color: '#fff',
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.text,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    borderRadius: 8,
  },
  sourceText: {
    flex: 1,
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textSecondary,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  rejectButtonText: {
    ...(TYPOGRAPHY.label as object),
    color: COLORS.error,
    fontSize: 16,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.success,
  },
  acceptButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  acceptButtonText: {
    ...(TYPOGRAPHY.label as object),
    color: '#fff',
    fontSize: 16,
  },
});

