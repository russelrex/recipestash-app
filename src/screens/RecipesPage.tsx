import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ImageBackground, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, Chip, FAB, IconButton, Menu, Searchbar, Snackbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Recipe, recipesApi } from '../services/api';

const { height } = Dimensions.get('window');

type FilterType = 'all' | 'favorites' | 'recent' | 'az';

export default function RecipesPage() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );

  useEffect(() => {
    applyFilters();
  }, [recipes, filter, searchQuery]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      let recipesData: Recipe[] = [];

      if (filter === 'favorites') {
        recipesData = await recipesApi.getFavorites();
      } else {
        recipesData = await recipesApi.getAllRecipes();
      }

      setRecipes(recipesData);
    } catch (error: any) {
      console.error('Error loading recipes:', error);
      setSnackbarMessage('Failed to load recipes');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const searchResults = await recipesApi.searchRecipes(query);
        setRecipes(searchResults);
      } catch (error: any) {
        console.error('Error searching recipes:', error);
        setSnackbarMessage('Failed to search recipes');
        setSnackbarVisible(true);
      }
    } else {
      loadRecipes();
    }
  };

  const applyFilters = () => {
    let filtered = [...recipes];

    // Apply filter
    if (filter === 'favorites') {
      filtered = filtered.filter(r => r.isFavorite);
    } else if (filter === 'recent') {
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (filter === 'az') {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Apply search query (client-side filtering if not using API search)
    if (searchQuery.trim() && filter !== 'all') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query)
      );
    }

    setFilteredRecipes(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes();
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    if (newFilter === 'favorites') {
      loadRecipes();
    } else {
      applyFilters();
    }
  };

  const handleToggleFavorite = async (recipeId: string) => {
    try {
      const updatedRecipe = await recipesApi.toggleFavorite(recipeId);
      setRecipes(prev =>
        prev.map(r => (r.id === recipeId ? updatedRecipe : r))
      );
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      setSnackbarMessage('Failed to update favorite');
      setSnackbarVisible(true);
    }
  };

  const handleDelete = async (recipeId: string) => {
    try {
      await recipesApi.deleteRecipe(recipeId);
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
      setSnackbarMessage('Recipe deleted successfully');
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      setSnackbarMessage('Failed to delete recipe');
      setSnackbarVisible(true);
    }
  };

  const getRecipeIcon = (category: string) => {
    const icons: Record<string, string> = {
      breakfast: 'coffee',
      lunch: 'bowl-mix',
      dinner: 'food-drumstick',
      dessert: 'cake',
      drinks: 'bottle-soda',
      snacks: 'food-apple',
    };
    return icons[category.toLowerCase()] || 'food';
  };

  const formatTime = (prepTime: number, cookTime: number) => {
    return `${prepTime + cookTime} mins`;
  };

  if (loading && !refreshing) {
    return (
      <ImageBackground
        source={require('../../assets/images/dashboard_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8BC34A" />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/dashboard_bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Searchbar
          placeholder="Search recipes..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#37474F"
        />

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.filterContainer}>
            <Chip
              selected={filter === 'all'}
              icon="view-grid"
              mode="outlined"
              style={styles.chip}
              onPress={() => handleFilterChange('all')}
            >
              All
            </Chip>
            <Chip
              selected={filter === 'favorites'}
              icon="star"
              mode="outlined"
              style={styles.chip}
              onPress={() => handleFilterChange('favorites')}
            >
              Favorites
            </Chip>
            <Chip
              selected={filter === 'recent'}
              icon="clock"
              mode="outlined"
              style={styles.chip}
              onPress={() => handleFilterChange('recent')}
            >
              Recent
            </Chip>
            <Chip
              selected={filter === 'az'}
              icon="sort-alphabetical-ascending"
              mode="outlined"
              style={styles.chip}
              onPress={() => handleFilterChange('az')}
            >
              A-Z
            </Chip>
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            {filter === 'favorites' ? 'Favorite Recipes' : 'All Recipes'} ({filteredRecipes.length})
          </Text>

          {filteredRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchQuery
                  ? 'No recipes found matching your search'
                  : filter === 'favorites'
                  ? 'No favorite recipes yet'
                  : 'No recipes yet. Create your first recipe!'}
              </Text>
            </View>
          ) : (
            filteredRecipes.map(recipe => (
              <Card key={recipe.id} style={styles.recipeCard}>
                {recipe.imageUrl ? (
                  <Card.Cover source={{ uri: recipe.imageUrl }} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Avatar.Icon
                      icon={getRecipeIcon(recipe.category)}
                      size={64}
                      style={styles.placeholderIcon}
                    />
                  </View>
                )}
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      <Card.Title
                        title={recipe.title}
                        subtitle={`${recipe.category} • ${formatTime(recipe.prepTime, recipe.cookTime)}`}
                        titleNumberOfLines={2}
                      />
                    </View>
                    <Menu
                      visible={menuVisible[recipe.id] || false}
                      onDismiss={() => setMenuVisible({ ...menuVisible, [recipe.id]: false })}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          size={20}
                          onPress={() =>
                            setMenuVisible({ ...menuVisible, [recipe.id]: true })
                          }
                        />
                      }
                    >
                      <Menu.Item
                        onPress={() => {
                          setMenuVisible({ ...menuVisible, [recipe.id]: false });
                          handleToggleFavorite(recipe.id);
                        }}
                        title={recipe.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        leadingIcon={recipe.isFavorite ? 'star-off' : 'star'}
                      />
                      <Menu.Item
                        onPress={() => {
                          setMenuVisible({ ...menuVisible, [recipe.id]: false });
                          handleDelete(recipe.id);
                        }}
                        title="Delete"
                        leadingIcon="delete"
                      />
                    </Menu>
                  </View>
                  <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
                    {recipe.description}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Chip
                      icon={getRecipeIcon(recipe.category)}
                      mode="outlined"
                      style={styles.categoryChip}
                    >
                      {recipe.category}
                    </Chip>
                    <Chip
                      icon="account-group"
                      mode="outlined"
                      style={styles.servingsChip}
                    >
                      {recipe.servings} servings
                    </Chip>
                    {recipe.isFavorite && (
                      <Avatar.Icon icon="star" size={24} style={styles.favoriteIcon} />
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>

        <FAB
          icon="plus"
          label="New Recipe"
          style={[styles.fab, { bottom: insets.bottom + 120 }]}
          onPress={() => navigation.navigate('AddRecipe' as never)}
        />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 248, 0.3)',
  },
  loadingText: {
    marginTop: 10,
    color: '#37474F',
  },
  searchbar: {
    margin: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    elevation: 2,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#37474F',
  },
  recipeCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    backgroundColor: '#8BC34A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleContainer: {
    flex: 1,
  },
  description: {
    marginTop: 8,
    marginBottom: 12,
    color: '#37474F',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
  },
  servingsChip: {
    marginRight: 8,
  },
  favoriteIcon: {
    backgroundColor: '#FF9800',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#37474F',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    backgroundColor: '#8BC34A',
  },
});

