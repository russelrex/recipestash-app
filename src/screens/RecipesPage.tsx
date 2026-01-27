import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Searchbar, Chip, FAB } from 'react-native-paper';

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search recipes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView style={styles.content}>
        <View style={styles.filterContainer}>
          <Chip selected icon="star" mode="outlined" style={styles.chip}>
            Favorites
          </Chip>
          <Chip icon="clock" mode="outlined" style={styles.chip}>
            Recent
          </Chip>
          <Chip icon="sort-alphabetical-ascending" mode="outlined" style={styles.chip}>
            A-Z
          </Chip>
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          All Recipes
        </Text>

        <Card style={styles.recipeCard}>
          <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=800' }} />
          <Card.Title
            title="Spaghetti Carbonara"
            subtitle="Italian • 25 mins"
            right={props => <Chip>⭐ 4.5</Chip>}
          />
        </Card>

        <Card style={styles.recipeCard}>
          <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }} />
          <Card.Title
            title="Fresh Garden Salad"
            subtitle="Healthy • 15 mins"
            right={props => <Chip>⭐ 4.8</Chip>}
          />
        </Card>

        <Card style={styles.recipeCard}>
          <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800' }} />
          <Card.Title
            title="Margherita Pizza"
            subtitle="Italian • 40 mins"
            right={props => <Chip>⭐ 4.7</Chip>}
          />
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        label="New Recipe"
        style={styles.fab}
        onPress={() => console.log('Add recipe')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  searchbar: {
    margin: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recipeCard: {
    marginBottom: 16,
    elevation: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#8BC34A',
  },
});

