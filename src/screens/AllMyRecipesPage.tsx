import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Recipe, recipesApi } from '../services/api';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../styles/modernStyles';
import { RecipeCard } from '../components/RecipeCard';
import { ConfirmationModal } from '../components/ConfirmationModal';

export default function AllMyRecipesPage({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, []),
  );

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchQuery, selectedCategory, showFeaturedOnly]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      // Use the same source as ProfilePage so counts and lists match.
      const myRecipes = await recipesApi.getAllRecipes();
      setRecipes(myRecipes);
    } catch (error) {
      console.error('❌ [AllMyRecipes] Error loading recipes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecipes();
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        (recipe.title || '').toLowerCase().includes(query) ||
        (recipe.description || '').toLowerCase().includes(query) ||
        (recipe.category || '').toLowerCase().includes(query),
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        recipe => recipe.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter(recipe => recipe.featured === true);
    }

    setFilteredRecipes(filtered);
  };

  const handleDeletePress = (recipeId: string, recipeTitle: string) => {
    setRecipeToDelete({ id: recipeId, title: recipeTitle });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!recipeToDelete) return;

    try {
      setDeleting(true);
      await recipesApi.deleteRecipe(recipeToDelete.id);
      setRecipes(prev => prev.filter(r => r._id !== recipeToDelete.id));
      setShowDeleteModal(false);
      setRecipeToDelete(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
    } finally {
      setDeleting(false);
    }
  };

  const categories = ['all', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Recipes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddRecipe')}
        >
          <Icon name="plus" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.searchContainer}>
          <Icon
            name="magnify"
            size={20}
            color={COLORS.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon
                name="close-circle"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category === 'all' ? 'All' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.featuredFilter,
              showFeaturedOnly && styles.featuredFilterActive,
            ]}
            onPress={() => setShowFeaturedOnly(!showFeaturedOnly)}
          >
            <Icon
              name={showFeaturedOnly ? 'star' : 'star-outline'}
              size={16}
              color={showFeaturedOnly ? '#fff' : COLORS.primary}
            />
            <Text
              style={[
                styles.featuredFilterText,
                showFeaturedOnly && styles.featuredFilterTextActive,
              ]}
            >
              Featured
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredRecipes.length}{' '}
            {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </Text>
          {(searchQuery ||
            selectedCategory !== 'all' ||
            showFeaturedOnly) && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowFeaturedOnly(false);
              }}
            >
              <Text style={styles.clearFilters}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="chef-hat" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>
              {searchQuery ||
              selectedCategory !== 'all' ||
              showFeaturedOnly
                ? 'No recipes found'
                : 'No recipes yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ||
              selectedCategory !== 'all' ||
              showFeaturedOnly
                ? 'Try adjusting your filters'
                : 'Create your first recipe!'}
            </Text>
            {!(searchQuery ||
            selectedCategory !== 'all' ||
            showFeaturedOnly) && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('AddRecipe')}
              >
                <Text style={styles.createButtonText}>Create Recipe</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.recipesGrid}>
            {filteredRecipes.map(recipe => (
              <View key={recipe._id}>
                <RecipeCard recipe={recipe} />
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('AddRecipe', {
                        recipeId: recipe._id,
                        mode: 'edit',
                      })
                    }
                    style={styles.cardActionButton}
                  >
                    <Icon
                      name="pencil"
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleDeletePress(recipe._id, recipe.title)
                    }
                    style={styles.cardActionButton}
                  >
                    <Icon name="delete" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipeToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor={COLORS.error}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setRecipeToDelete(null);
        }}
        type="danger"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    ...(SHADOWS.small as object),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...(TYPOGRAPHY.h2 as object),
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: SPACING.md,
    ...(SHADOWS.small as object),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...(TYPOGRAPHY.body as object),
    fontSize: 15,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 8,
  },
  categoryScroll: {
    flex: 1,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    ...(TYPOGRAPHY.label as object),
    fontSize: 13,
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  featuredFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  featuredFilterActive: {
    backgroundColor: COLORS.primary,
  },
  featuredFilterText: {
    ...(TYPOGRAPHY.label as object),
    fontSize: 13,
    color: COLORS.primary,
  },
  featuredFilterTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultsCount: {
    ...(TYPOGRAPHY.h4 as object),
    fontSize: 16,
  },
  clearFilters: {
    ...(TYPOGRAPHY.label as object),
    fontSize: 14,
    color: COLORS.primary,
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    ...(TYPOGRAPHY.h3 as object),
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    ...(TYPOGRAPHY.body as object),
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    ...(TYPOGRAPHY.label as object),
    color: '#fff',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 8,
  },
  cardActionButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: COLORS.cardBackground,
    ...(SHADOWS.small as object),
  },
});

