import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Chip, Searchbar, Snackbar, Text } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RecipeListSkeleton } from '../components/Loading/LoadingComponents';
import { RecipeCard } from '../components/RecipeCard';
import { Recipe, recipesApi } from '../services/api';
import { COLORS, SPACING } from '../styles/modernStyles';

type FilterType = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'drinks' | 'snacks';

export default function RecipesPage() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadRecipes(true);
    }, [filter])
  );

  const loadRecipes = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setRecipes([]);
      } else {
        setLoadingMore(true);
      }

      console.log('📚 [RecipesPage] Loading recipes - Page:', reset ? 1 : page + 1);

      const newRecipes = await recipesApi.getAllPublicRecipes({
        page: reset ? 1 : page + 1,
        limit: 10,
        category: filter === 'all' ? undefined : filter,
        search: searchQuery || undefined,
      });

      console.log('✅ [RecipesPage] Loaded', newRecipes.length, 'recipes');

      if (reset) {
        setRecipes(newRecipes);
      } else {
        setRecipes(prev => [...prev, ...newRecipes]);
      }

      // Check if there are more recipes
      setHasMore(newRecipes.length === 10);
      
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('❌ [RecipesPage] Error loading recipes:', error);
      setSnackbarMessage('Failed to load recipes');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        console.log('🔍 [RecipesPage] Searching:', query);
        const searchResults = await recipesApi.searchRecipes(query);
        setRecipes(searchResults);
      } catch (error: any) {
        console.error('❌ [RecipesPage] Search error:', error);
        setSnackbarMessage('Search failed');
        setSnackbarVisible(true);
      }
    } else {
      loadRecipes(true);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes(true);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    if (filter !== newFilter) {
      setFilter(newFilter);
      setSearchQuery('');
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !searchQuery) {
      loadRecipes(false);
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    return (
      <RecipeCard
        recipe={item}
        onPress={() => {
          (navigation as any).navigate('RecipeDetail', { recipeId: item._id });
        }}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingMoreText}>Loading more recipes...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'No recipes found matching your search'
            : 'No recipes yet. Be the first to create one!'}
        </Text>
      </View>
    );
  };

  // LOADING STATE
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.loadingContent}>
          <View style={styles.searchbarSkeleton} />
          <RecipeListSkeleton count={3} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // LOADED STATE
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Search Bar */}
        <Searchbar
          placeholder="Search recipes..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
          nestedScrollEnabled={true}
        >
          <Chip
            selected={filter === 'all'}
            icon={({ size }) => (
              <Icon 
                name="view-grid" 
                size={size} 
                color={filter === 'all' ? '#FFFFFF' : COLORS.textSecondary}
              />
            )}
            onPress={() => handleFilterChange('all')}
            mode={filter === 'all' ? 'flat' : 'outlined'}
            style={[
              styles.chip,
              filter === 'all' && styles.chipSelected,
              { marginRight: 8 }
            ]}
            textStyle={filter === 'all' ? styles.chipTextSelected : styles.chipText}
          >
            All
          </Chip>
          <Chip
            selected={filter === 'breakfast'}
            icon={({ size }) => (
              <Icon 
                name="coffee" 
                size={size} 
                color={filter === 'breakfast' ? '#FFFFFF' : COLORS.textSecondary}
              />
            )}
            onPress={() => handleFilterChange('breakfast')}
            mode={filter === 'breakfast' ? 'flat' : 'outlined'}
            style={[
              styles.chip,
              filter === 'breakfast' && styles.chipSelected,
              { marginRight: 8 }
            ]}
            textStyle={filter === 'breakfast' ? styles.chipTextSelected : styles.chipText}
          >
            Breakfast
          </Chip>
          <Chip
            selected={filter === 'lunch'}
            icon={({ size }) => (
              <Icon 
                name="bowl-mix" 
                size={size} 
                color={filter === 'lunch' ? '#FFFFFF' : COLORS.textSecondary}
              />
            )}
            onPress={() => handleFilterChange('lunch')}
            mode={filter === 'lunch' ? 'flat' : 'outlined'}
            style={[
              styles.chip,
              filter === 'lunch' && styles.chipSelected,
              { marginRight: 8 }
            ]}
            textStyle={filter === 'lunch' ? styles.chipTextSelected : styles.chipText}
          >
            Lunch
          </Chip>
          <Chip
            selected={filter === 'dinner'}
            icon={({ size }) => (
              <Icon 
                name="food-drumstick" 
                size={size} 
                color={filter === 'dinner' ? '#FFFFFF' : COLORS.textSecondary}
              />
            )}
            onPress={() => handleFilterChange('dinner')}
            mode={filter === 'dinner' ? 'flat' : 'outlined'}
            style={[
              styles.chip,
              filter === 'dinner' && styles.chipSelected,
              { marginRight: 8 }
            ]}
            textStyle={filter === 'dinner' ? styles.chipTextSelected : styles.chipText}
          >
            Dinner
          </Chip>
          <Chip
            selected={filter === 'dessert'}
            icon={({ size }) => (
              <Icon 
                name="cake" 
                size={size} 
                color={filter === 'dessert' ? '#FFFFFF' : COLORS.textSecondary}
              />
            )}
            onPress={() => handleFilterChange('dessert')}
            mode={filter === 'dessert' ? 'flat' : 'outlined'}
            style={[
              styles.chip,
              filter === 'dessert' && styles.chipSelected,
              { marginRight: 8 }
            ]}
            textStyle={filter === 'dessert' ? styles.chipTextSelected : styles.chipText}
          >
            Dessert
          </Chip>
          <Chip
            selected={filter === 'drinks'}
            icon={({ size }) => (
              <Icon 
                name="bottle-soda" 
                size={size} 
                color={filter === 'drinks' ? '#FFFFFF' : COLORS.textSecondary}
              />
            )}
            onPress={() => handleFilterChange('drinks')}
            mode={filter === 'drinks' ? 'flat' : 'outlined'}
            style={[
              styles.chip,
              filter === 'drinks' && styles.chipSelected,
              { marginRight: 8 }
            ]}
            textStyle={filter === 'drinks' ? styles.chipTextSelected : styles.chipText}
          >
            Drinks
          </Chip>
          <Chip
            selected={filter === 'snacks'}
            icon={({ size }) => (
              <Icon 
                name="food-apple" 
                size={size} 
                color={filter === 'snacks' ? '#FFFFFF' : COLORS.textSecondary}
              />
            )}
            onPress={() => handleFilterChange('snacks')}
            mode={filter === 'snacks' ? 'flat' : 'outlined'}
            style={[
              styles.chip,
              filter === 'snacks' && styles.chipSelected,
            ]}
            textStyle={filter === 'snacks' ? styles.chipTextSelected : styles.chipText}
          >
            Snacks
          </Chip>
        </ScrollView>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>
            {filter === 'all' ? 'All Recipes' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Recipes`} ({recipes.length})
          </Text>
        </View>

        {/* Recipe List */}
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={recipes.length > 0 ? styles.row : undefined}
          contentContainerStyle={[
            styles.listContent,
            recipes.length === 0 && styles.listContentEmpty,
            recipes.length > 0 && { paddingBottom: insets.bottom + 20 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />

        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
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
  
  searchbar: {
    margin: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    elevation: 2,
  },
  
  filterScrollView: {
    marginBottom: SPACING.sm,
    height: 115, // Fixed height for filter scroll view
    flexGrow: 0, // Prevent expansion
  },
  
  filterContainer: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center', // Center align chips vertically
    paddingVertical: 4, // Add vertical padding
    height: 48, // Fixed height to match scroll view
  },
  
  chip: {
    marginRight: 0,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    height: 40, // Explicit height for chips
    paddingVertical: 4, // Vertical padding
  },
  
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    height: 40, 
    minHeight: 40,
  },
  
  chipText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 13, // Ensure text size
    lineHeight: 18, // Proper line height
  },
  
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13, // Ensure text size
    lineHeight: 18, // Proper line height
  },
  
  chipIcon: {
    color: COLORS.primary, // Icon color for unselected chips
  },
  
  chipIconSelected: {
    color: '#FFFFFF', // White icon color for selected chips
  },
  
  titleContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm, // Reduced top margin to move it closer to filters
    marginBottom: SPACING.sm, // Reduced bottom margin
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  
  listContent: {
    paddingHorizontal: SPACING.md,
    flexGrow: 0, // Prevent list from expanding unnecessarily
  },
  
  listContentEmpty: {
    flexGrow: 0, // Don't expand unnecessarily
    justifyContent: 'flex-start',
    paddingTop: 0, // Remove top padding to reduce gap
    paddingBottom: SPACING.lg,
  },
  
  row: {
    justifyContent: 'space-between',
  },
  
  loadingContent: {
    padding: SPACING.md,
  },
  
  searchbarSkeleton: {
    height: 56,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  
  loadingMoreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 12,
  },
  
  emptyContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
