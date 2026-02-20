import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserName } from './UserName';
import { Recipe } from '../services/api';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../styles/modernStyles';

const { width } = Dimensions.get('window');
const CARD_PADDING = SPACING.md; // 16px padding on each side
const CARD_GAP = SPACING.sm; // 8px gap between cards
const CARD_WIDTH = (width - (CARD_PADDING * 2) - CARD_GAP) / 2; // Two columns with gap

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  const imageUri = recipe.featuredImage || recipe.imageUrl;
  const placeholderImage = require('../../assets/images/recipe_placeholder.webp');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      breakfast: 'coffee',
      lunch: 'bowl-mix',
      dinner: 'food-drumstick',
      dessert: 'cake',
      drinks: 'bottle-soda',
      snacks: 'food-apple',
    };
    return icons[category.toLowerCase()] || 'silverware-fork-knife';
  };

  const authorName = recipe.author?.name || 'Unknown';
  const authorPicture = recipe.author?.profilePicture;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Featured Image - Full Height and Width */}
      <View style={styles.imageContainer}>
        <Image
          source={imageUri ? { uri: imageUri } : placeholderImage}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Icon name={getCategoryIcon(recipe.category)} size={14} color="#fff" style={styles.categoryIcon} />
          <Text style={styles.categoryText}>{recipe.category}</Text>
        </View>

        {/* Dark backdrop overlay for contrast */}
        <View style={styles.backdropOverlay} />
        
        {/* Glassmorphism Details Container Overlay */}
        <View style={styles.glassWrapper}>
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.1)',
              'rgba(255, 255, 255, 0.3)',
            ]}
            locations={[0, 0.3, 0.6, 0.85, 1]}
            style={styles.glassGradient}
          >
            {/* Glass content container */}
            <View style={styles.glassContent}>
              <View style={styles.profileRow}>
                {/* Profile Picture */}
                {authorPicture ? (
                  <Image
                    source={{ uri: authorPicture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {getInitials(authorName)}
                    </Text>
                  </View>
                )}

                {/* Recipe Info */}
                <View style={styles.textContainer}>
                  <Text style={styles.recipeTitle} numberOfLines={1}>
                    {recipe.title}
                  </Text>
                  <View style={styles.authorRow}>
                    <Text style={styles.byText}>by </Text>
                    <UserName
                      name={authorName}
                      subscription={recipe.author?.subscription}
                      isPremium={recipe.author?.isPremium}
                      style={styles.authorName}
                      badgeSize={14}
                      numberOfLines={1}
                    />
                  </View>
                  <View style={styles.metaRow}>
                    <Icon name="clock-outline" size={12} color={COLORS.text} />
                    <Text style={styles.metaText}>
                      {recipe.prepTime + recipe.cookTime} mins
                    </Text>
                    <Icon 
                      name="account-group" 
                      size={12} 
                      color={COLORS.text} 
                      style={styles.metaIcon}
                    />
                    <Text style={styles.metaText}>
                      {recipe.servings} servings
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 300, // Fixed height for grid
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },

  // Image Section - Full Height and Width
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    zIndex: 2,
  },

  categoryIcon: {
    marginRight: 4,
  },
  
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Dark backdrop overlay for better contrast
  backdropOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  // Glassmorphism wrapper
  glassWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },

  // Glass gradient overlay
  glassGradient: {
    width: '100%',
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  // Glass content container with frosted effect
  glassContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    // Glassmorphism shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  textContainer: {
    flex: 1,
  },

  recipeTitle: {
    ...(TYPOGRAPHY.h4 as object),
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    color: '#111827', // Very dark text for maximum contrast on glass
    letterSpacing: -0.2,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  byText: {
    ...(TYPOGRAPHY.bodySmall as object),
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },

  authorName: {
    ...(TYPOGRAPHY.bodySmall as object),
    fontSize: 12,
    fontWeight: '500',
    color: '#374151', // Dark gray for secondary text
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  metaIcon: {
    marginLeft: 10,
  },

  metaText: {
    ...(TYPOGRAPHY.caption as object),
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 3,
    color: '#374151', // Dark gray for meta text - better visibility
  },
});
