import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/modernStyles';

interface CategorySelectionStepProps {
  onSelect: (category: string) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { name: 'Breakfast', icon: 'coffee', color: '#F59E0B' },
  { name: 'Lunch', icon: 'food', color: '#10B981' },
  { name: 'Dinner', icon: 'food-variant', color: '#EF4444' },
  { name: 'Dessert', icon: 'cake-variant', color: '#EC4899' },
  { name: 'Snacks', icon: 'fruit-cherries', color: '#8B5CF6' },
  { name: 'Beverages', icon: 'cup', color: '#06B6D4' },
];

export default function CategorySelectionStep({
  onSelect,
  onClose,
}: CategorySelectionStepProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Import Recipe</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 3</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="folder" size={64} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Choose Category</Text>
          <Text style={styles.description}>
            Select which category this recipe belongs to.
          </Text>

          <View style={styles.categoriesGrid}>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.name}
                style={styles.categoryCard}
                onPress={() => onSelect(category.name)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: `${category.color}20` },
                  ]}
                >
                  <Icon
                    name={category.icon}
                    size={32}
                    color={category.color}
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  categoryCard: {
    width: '45%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    ...(TYPOGRAPHY.label as object),
  },
});

