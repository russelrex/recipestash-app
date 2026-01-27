import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ImageBackground, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, Chip, FAB, Snackbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi, recipesApi, type Recipe, type RecipeStats } from '../services/api';

const { height } = Dimensions.get('window');

export default function Dashboard() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<RecipeStats>({
    totalRecipes: 0,
    favoriteRecipes: 0,
    categoryCounts: {},
  });
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const name = await authApi.getCurrentUserName();
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, []),
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsData, recipesData] = await Promise.all([
        recipesApi.getStats(),
        recipesApi.getAllRecipes(),
      ]);

      setStats(statsData);

      const sortedRecipes = recipesData
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3);
      setRecentRecipes(sortedRecipes);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setSnackbarMessage('Failed to load dashboard data');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getRecipeIcon = (category: string) => {
    const icons: Record<string, string> = {
      breakfast: 'coffee',
      lunch: 'bowl-mix',
      dinner: 'food-drumstick',
      dessert: 'cake',
      drinks: 'bottle-soda',
      vegetarian: 'leaf',
    };
    return icons[category.toLowerCase()] || 'food';
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
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
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
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        <Text variant="headlineMedium" style={styles.greeting}>
          Hello, {userName}! 👋
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          What would you like to cook today?
        </Text>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Avatar.Icon icon="book-open-variant" size={40} style={styles.statIcon} />
              <Text variant="headlineMedium" style={styles.statNumber}>
                {stats.totalRecipes}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Recipes
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Avatar.Icon icon="heart" size={40} style={styles.statIconFavorite} />
              <Text variant="headlineMedium" style={styles.statNumber}>
                {stats.favoriteRecipes}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Favorites
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.card}>
          <Card.Title title="Quick Categories" titleVariant="titleLarge" />
          <Card.Content>
            <View style={styles.chipContainer}>
              {Object.entries(stats.categoryCounts).map(([category, count]) => (
                <Chip
                  key={category}
                  icon={getRecipeIcon(category)}
                  mode="outlined"
                  style={styles.chip}
                >
                  {category} ({count})
                </Chip>
              ))}
              {Object.keys(stats.categoryCounts).length === 0 && (
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No recipes yet. Start adding some!
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Recent Recipes" titleVariant="titleLarge" />
          <Card.Content>
            {recentRecipes.length > 0 ? (
              recentRecipes.map(recipe => (
                <View key={recipe.id} style={styles.recipeItem}>
                  <Avatar.Icon icon={getRecipeIcon(recipe.category)} size={40} />
                  <View style={styles.recipeInfo}>
                    <Text variant="titleMedium">{recipe.title}</Text>
                    <Text variant="bodySmall" style={styles.recipeTime}>
                      ⏱️ {recipe.prepTime + recipe.cookTime} mins • {recipe.difficulty}
                    </Text>
                  </View>
                  {recipe.isFavorite && (
                    <Avatar.Icon icon="heart" size={24} color="#e91e63" />
                  )}
                </View>
              ))
            ) : (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No recipes yet. Tap the + button to add your first recipe!
              </Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Cover
            source={{
              uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
            }}
          />
          <Card.Title title="Cooking Tip of the Day" subtitle="Master your recipes" />
          <Card.Content>
            <Text variant="bodyMedium">
              Always read through the entire recipe before starting to cook. This helps you
              prepare all ingredients and understand the timing!
            </Text>
          </Card.Content>
        </Card>
        </ScrollView>

        <FAB
          icon="plus"
          label="Add Recipe"
          style={[styles.fab, { bottom: insets.bottom + 80 }]}
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
  content: {
    flex: 1,
    padding: 16,
  },
  greeting: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#37474F',
  },
  subtitle: {
    color: '#37474F',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statIcon: {
    backgroundColor: '#8BC34A',
  },
  statIconFavorite: {
    backgroundColor: '#FF9800',
  },
  statNumber: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    color: '#37474F',
    marginTop: 5,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  recipeInfo: {
    marginLeft: 15,
    flex: 1,
  },
  recipeTime: {
    color: '#37474F',
    marginTop: 2,
  },
  emptyText: {
    color: '#37474F',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#8BC34A',
  },
});

