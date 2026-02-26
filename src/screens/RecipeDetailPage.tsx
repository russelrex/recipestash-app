import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Divider,
  Menu,
  Snackbar,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authApi, postsApi, recipesApi, type Post, type Recipe } from '../services/api';
import type { RecipeStep } from '../services/api/recipesApi';
import { Colors } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 380;
const THUMB_SIZE = 68;
const THUMB_GAP = 10;

export default function RecipeDetailPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const recipeId = (route.params as any)?.recipeId as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');

  // Hero / thumbnail selection
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Gallery modal
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    loadRecipeDetails();
    loadCurrentUserId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  const loadCurrentUserId = async () => {
    const userId = await authApi.getCurrentUserId();
    setCurrentUserId(userId);
  };

  const loadRecipeDetails = async () => {
    try {
      setLoading(true);
      const [recipeData, posts] = await Promise.all([
        recipesApi.getRecipe(recipeId),
        postsApi.getPostsByRecipe(recipeId),
      ]);
      setRecipe(recipeData);
      setRelatedPosts(posts);
    } catch (error: any) {
      console.error('Error loading recipe:', error);
      setSnackbarType('error');
      setSnackbarMessage('Failed to load recipe details');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    try {
      const updatedRecipe = await recipesApi.toggleFavorite(recipe._id);
      setRecipe(updatedRecipe);
      setSnackbarType('success');
      setSnackbarMessage(
        updatedRecipe.isFavorite ? 'Added to favorites ❤️' : 'Removed from favorites',
      );
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarType('error');
      setSnackbarMessage('Failed to update favorite');
      setSnackbarVisible(true);
    }
  };

  const handleEdit = () => {
    if (!recipe) return;
    setMenuVisible(false);
    
    // Navigate to AddRecipe page in edit mode with recipe data
    (navigation as any).navigate('AddRecipe', { 
      recipeId: recipe._id,
      mode: 'edit'
    });
  };

  const handleToggleFeatured = async () => {
    if (!recipe) return;
    setMenuVisible(false);
    
    try {
      const updatedRecipe = await recipesApi.updateRecipe(recipe._id, {
        featured: !recipe.featured,
      });
      setRecipe(updatedRecipe);
      setSnackbarType('success');
      setSnackbarMessage(
        updatedRecipe.featured 
          ? 'Recipe set as featured ⭐' 
          : 'Recipe removed from featured',
      );
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error('Error toggling featured status:', error);
      setSnackbarType('error');
      setSnackbarMessage(error.message || 'Failed to update featured status');
      setSnackbarVisible(true);
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe? This action cannot be undone and will also remove all associated posts.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              await recipesApi.deleteRecipe(recipe!._id);
              
              setSnackbarType('success');
              setSnackbarMessage('Recipe deleted successfully ✓');
              setSnackbarVisible(true);
              
              // Navigate back after short delay
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            } catch (error: any) {
              console.error('Error deleting recipe:', error);
              setSnackbarType('error');
              setSnackbarMessage(error.message || 'Failed to delete recipe');
              setSnackbarVisible(true);
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const getDifficultyIcon = (difficulty: string) => {
    const map: Record<string, string> = {
      easy: 'emoticon-happy',
      medium: 'emoticon-neutral',
      hard: 'fire',
    };
    return map[difficulty.toLowerCase()] || 'help';
  };

  // ─── merged image list (featured first, no dupes) ───
  const getAllImages = useCallback((): string[] => {
    if (!recipe) return [];
    const set = new Set<string>();
    const result: string[] = [];
    const add = (url: string | undefined) => {
      if (url && !set.has(url)) {
        set.add(url);
        result.push(url);
      }
    };
    add(recipe.featuredImage);
    recipe.images?.forEach(add);
    return result;
  }, [recipe]);

  // ─── open gallery starting at the tapped thumbnail ───
  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryVisible(true);
  };

  // ─── gallery swipe helpers ───
  const galleryNext = () => {
    const images = getAllImages();
    setGalleryIndex(prev => (prev + 1) % images.length);
  };
  const galleryPrev = () => {
    const images = getAllImages();
    setGalleryIndex(prev => (prev - 1 + images.length) % images.length);
  };

  // ─── loading ─────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  // ─── empty ───────────────────────────────────────
  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color={Colors.text.secondary} />
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnRecipe = currentUserId === recipe.userId;
  const totalTime = recipe.prepTime + recipe.cookTime;
  const allImages = getAllImages();
  const hasImages = allImages.length > 0;
  const hasMultiple = allImages.length > 1;

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* ─── Hero ──────────────────────────────────── */}
        <View style={styles.heroWrapper}>
          {hasImages ? (
            <Image source={{ uri: allImages[selectedImageIndex] }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.placeholderBox]}>
              <Icon name="food" size={72} color={Colors.text.disabled} />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          {/* gradient overlay */}
          <View style={styles.heroOverlay} />

          {/* back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>

          {/* fav + menu */}
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroActionBtn} onPress={handleToggleFavorite}>
              <Icon
                name={recipe.isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={recipe.isFavorite ? Colors.interaction.like : '#fff'}
              />
            </TouchableOpacity>
            {isOwnRecipe && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity style={styles.heroActionBtn} onPress={() => setMenuVisible(true)}>
                    <Icon name="dots-vertical" size={22} color="#fff" />
                  </TouchableOpacity>
                }
              >
                <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
                <Menu.Item 
                  onPress={handleToggleFeatured} 
                  title={recipe.featured ? "Remove from featured" : "Set as featured"} 
                  leadingIcon={recipe.featured ? "star-off" : "star"} 
                />
                <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
              </Menu>
            )}
          </View>

          {/* counter badge */}
          {hasMultiple && (
            <View style={styles.counterBadge}>
              <Icon name="image" size={13} color="#fff" />
              <Text style={styles.counterText}>
                {selectedImageIndex + 1}/{allImages.length}
              </Text>
            </View>
          )}
        </View>

        {/* ─── White card (thumbnails live INSIDE here) ── */}
        <View style={styles.cardSheet}>

          {/* thumbnail row – only when 2+ images */}
          {hasMultiple && (
            <View style={styles.thumbRow}>
              <FlatList
                data={allImages}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                ItemSeparatorComponent={() => <View style={{ width: THUMB_GAP }} />}
                contentContainerStyle={styles.thumbList}
                renderItem={({ item, index }) => {
                  const active = index === selectedImageIndex;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      style={[styles.thumbOuter, active && styles.thumbOuterActive]}
                      onPress={() => {
                        setSelectedImageIndex(index);
                        openGallery(index);
                      }}
                    >
                      <Image source={{ uri: item }} style={styles.thumbImg} />
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}

          {/* title + category */}
          <Text style={styles.recipeName}>{recipe.title}</Text>
          <Text style={styles.recipeCategory}>{recipe.category}</Text>

          {/* stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primary.light + '1A' }]}>
                <Icon name="clock-outline" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.statValue}>{totalTime}</Text>
              <Text style={styles.statLabel}>Total time</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primary.main + '1A' }]}>
                <Icon name="food-fork-drink" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.statValue}>{recipe.servings}</Text>
              <Text style={styles.statLabel}>Servings</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors.secondary.main + '1A' }]}>
                <Icon name={getDifficultyIcon(recipe.difficulty)} size={20} color={Colors.secondary.main} />
              </View>
              <Text style={styles.statValue}>{recipe.difficulty}</Text>
              <Text style={styles.statLabel}>Difficulty</Text>
            </View>
          </View>

          {/* description */}
          {recipe.description ? <Text style={styles.description}>{recipe.description}</Text> : null}

          {/* related posts */}
          {/* {relatedPosts.length > 0 && (
            <View style={styles.postsSection}>
              <Text style={styles.postsSectionTitle}>Posted by</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postsScroll}>
                {relatedPosts.map(post => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.postThumb}
                    onPress={() => (navigation as any).navigate('PostDetail', { postId: post.id })}
                  >
                    {post.imageUrl ? (
                      <Image source={{ uri: post.imageUrl }} style={styles.postThumbImg} />
                    ) : (
                      <View style={styles.postThumbPlaceholder}>
                        <Icon name="image-outline" size={22} color={Colors.text.disabled} />
                      </View>
                    )}
                    <View style={styles.postThumbUserBadge}>
                      <Icon name="account" size={14} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ))}
                <View style={styles.postThumbMore}>
                  <Icon name="chevron-right" size={22} color={Colors.text.secondary} />
                </View>
              </ScrollView>
            </View>
          )} */}
        </View>

        {/* ─── Tabs ──────────────────────────────────── */}
        <View style={styles.tabBar}>
          {(['ingredients', 'instructions'] as const).map(tab => {
            const active = activeTab === tab;
            const label = tab === 'ingredients' ? 'Ingredients' : 'Instructions';
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Tab content ───────────────────────────── */}
        <View style={styles.tabContent}>
          {activeTab === 'ingredients'
            ? recipe.ingredients.map((item, i) => (
                <View key={i} style={styles.ingredientRow}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientText}>{item}</Text>
                </View>
              ))
            : (
              <View>
                {Array.isArray((recipe as any).steps) && (recipe as any).steps.length > 0
                  ? ((recipe as any).steps as RecipeStep[]).map((step, index) => {
                      const stepNumber = (step as any).stepNumber || index + 1;
                      return (
                        <View key={step._id || index} style={styles.stepCard}>
                          <View style={styles.stepCardHeader}>
                            <View style={styles.stepBadge}>
                              <Text style={styles.stepBadgeNum}>{stepNumber}</Text>
                            </View>
                            <Text style={styles.stepTitle}>Step {stepNumber}</Text>
                          </View>

                          {step.imageUrl ? (
                            <View style={styles.stepImageWrapper}>
                              <Image source={{ uri: step.imageUrl }} style={styles.stepImage} />
                            </View>
                          ) : null}

                          <Text style={styles.stepDescription}>
                            {step.description}
                          </Text>
                        </View>
                      );
                    })
                  : recipe.instructions.map((item, i) => (
                      <View key={i} style={styles.instructionRow}>
                        <View style={styles.stepBadge}>
                          <Text style={styles.stepBadgeNum}>{i + 1}</Text>
                        </View>
                        <Text style={styles.instructionText}>{item}</Text>
                      </View>
                    ))}
              </View>
            )}
        </View>

        {/* ─── Time breakdown ────────────────────────── */}
        <View style={styles.timeBar}>
          <View style={styles.timeItem}>
            <Icon name="chef-hat" size={22} color={Colors.primary.main} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeValue}>{recipe.prepTime} min</Text>
              <Text style={styles.timeLabel}>Prep time</Text>
            </View>
          </View>
          <Divider style={styles.timeDivider} />
          <View style={styles.timeItem}>
            <Icon name="pot-steam" size={22} color={Colors.primary.main} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeValue}>{recipe.cookTime} min</Text>
              <Text style={styles.timeLabel}>Cook time</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ═══ FULL-SCREEN GALLERY MODAL ═══ */}
      <Modal
        visible={galleryVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGalleryVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.galleryRoot}>
          {/* background */}
          <View style={styles.galleryBg} />

          {/* main image */}
          <View style={styles.galleryImageWrapper}>
            <Image
              source={{ uri: allImages[galleryIndex] }}
              style={styles.galleryImage}
              resizeMode="contain"
            />
          </View>

          {/* top bar: close + counter */}
          <View style={styles.galleryTopBar}>
            <TouchableOpacity style={styles.galleryCloseBtn} onPress={() => setGalleryVisible(false)}>
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <View style={styles.galleryCounter}>
              <Icon name="image" size={15} color="#fff" />
              <Text style={styles.galleryCounterText}>
                {galleryIndex + 1} / {allImages.length}
              </Text>
            </View>
          </View>

          {/* prev / next arrows */}
          {allImages.length > 1 && (
            <>
              <TouchableOpacity style={[styles.galleryArrow, styles.galleryArrowLeft]} onPress={galleryPrev}>
                <Icon name="chevron-left" size={32} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.galleryArrow, styles.galleryArrowRight]} onPress={galleryNext}>
                <Icon name="chevron-right" size={32} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* bottom thumbnail strip */}
          <View style={styles.galleryThumbStrip}>
            <FlatList
              data={allImages}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => `g${i}`}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
              contentContainerStyle={styles.galleryThumbList}
              renderItem={({ item, index }) => {
                const active = index === galleryIndex;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setGalleryIndex(index)}
                    style={[styles.galleryThumb, active && styles.galleryThumbActive]}
                  >
                    <Image source={{ uri: item }} style={styles.galleryThumbImg} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

        <Snackbar 
          visible={snackbarVisible} 
          onDismiss={() => setSnackbarVisible(false)} 
          duration={3000}
          style={[
            styles.snackbar,
            snackbarType === 'success' && styles.snackbarSuccess,
            snackbarType === 'error' && styles.snackbarError,
          ]}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // ─── root ──────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  container: { flex: 1, backgroundColor: Colors.background.default },
  scrollView: { flex: 1 },

  // ─── loading / error ───────────────────────────────────────
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.background.default,
  },
  loadingText: { marginTop: 10, color: Colors.text.secondary },
  errorContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 20, backgroundColor: Colors.background.default,
  },
  errorText: { fontSize: 18, marginTop: 16, marginBottom: 24, color: Colors.text.secondary },
  errorButton: {
    paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: Colors.primary.main, borderRadius: 8,
  },
  errorButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  snackbar: {
    backgroundColor: Colors.status.info,
  },
  snackbarSuccess: {
    backgroundColor: Colors.status.success,
  },
  snackbarError: {
    backgroundColor: Colors.status.error,
  },

  // ─── hero ──────────────────────────────────────────────────
  heroWrapper: { height: HEADER_HEIGHT, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  placeholderBox: {
    backgroundColor: Colors.border.light,
    justifyContent: 'center', alignItems: 'center',
  },
  placeholderText: { marginTop: 8, fontSize: 14, color: Colors.text.secondary },
  heroOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(12,22,7,0.32)',
  },
  backBtn: {
    position: 'absolute', top: 50, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroActions: {
    position: 'absolute', top: 50, right: 16,
    flexDirection: 'row', gap: 10,
  },
  heroActionBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center', alignItems: 'center',
  },
  counterBadge: {
    position: 'absolute', bottom: 14, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.52)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  counterText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // ─── white card sheet ──────────────────────────────────────
  cardSheet: {
    backgroundColor: Colors.background.paper,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -26,
    paddingBottom: 8,
  },

  // ─── thumbnails (inside the card) ──────────────────────────
  thumbRow: {
    paddingTop: 18,
    paddingBottom: 4,
  },
  thumbList: { paddingHorizontal: 20 },
  thumbOuter: {
    width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbOuterActive: {
    borderColor: Colors.primary.main,
  },
  thumbImg: { width: '100%', height: '100%' },

  // ─── title / category ──────────────────────────────────────
  recipeName: {
    fontSize: 26, fontWeight: 'bold',
    color: Colors.text.primary,
    paddingHorizontal: 24, marginTop: 14, marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 15, color: Colors.text.secondary,
    paddingHorizontal: 24, marginBottom: 22,
  },

  // ─── stats ─────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 24, marginBottom: 20,
  },
  statItem: { alignItems: 'center' },
  statIcon: {
    width: 48, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  statValue: { fontSize: 17, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 2 },
  statLabel: { fontSize: 12, color: Colors.text.secondary },

  // ─── description ───────────────────────────────────────────
  description: {
    fontSize: 15, lineHeight: 22, color: Colors.text.secondary,
    paddingHorizontal: 24, marginBottom: 20,
  },

  // ─── related posts ─────────────────────────────────────────
  postsSection: { paddingHorizontal: 24, marginBottom: 8 },
  postsSectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, marginBottom: 10 },
  postsScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
  postThumb: {
    width: 76, height: 76, borderRadius: 14,
    marginRight: 10, overflow: 'hidden', position: 'relative',
  },
  postThumbImg: { width: '100%', height: '100%' },
  postThumbPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: Colors.border.light,
    justifyContent: 'center', alignItems: 'center',
  },
  postThumbUserBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  postThumbMore: {
    width: 76, height: 76, borderRadius: 14,
    backgroundColor: Colors.border.light,
    justifyContent: 'center', alignItems: 'center',
  },

  // ─── tabs ──────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.paper,
    paddingHorizontal: 24, paddingTop: 12,
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary.main },
  tabText: { fontSize: 16, fontWeight: '500', color: Colors.text.secondary },
  tabTextActive: { color: Colors.primary.main, fontWeight: '600' },

  // ─── tab content ───────────────────────────────────────────
  tabContent: {
    backgroundColor: Colors.background.paper,
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
  },
  ingredientRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  ingredientDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.primary.main,
    marginTop: 9, marginRight: 12,
  },
  ingredientText: { flex: 1, fontSize: 16, lineHeight: 24, color: Colors.text.primary },
  // Legacy simple instruction rows (fallback when no structured steps)
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepBadgeNum: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    paddingTop: 4,
  },

  // New step cards with optional images and metadata
  stepCard: {
    borderRadius: 16,
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  stepImageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 10,
  },
  stepImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.border.light,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.primary,
    marginTop: 4,
  },

  // ─── time bar ──────────────────────────────────────────────
  timeBar: {
    flexDirection: 'row', backgroundColor: Colors.background.paper,
    padding: 24, marginTop: 8,
  },
  timeItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  timeInfo: { marginLeft: 12 },
  timeValue: { fontSize: 16, fontWeight: 'bold', color: Colors.text.primary },
  timeLabel: { fontSize: 12, color: Colors.text.secondary },
  timeDivider: { width: 1, marginHorizontal: 16, backgroundColor: Colors.border.main },

  // ═══ GALLERY MODAL ═════════════════════════════════════════
  galleryRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  galleryBg: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },

  // ─── main image ────────────────────────────────────────────
  galleryImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.6,
  },

  // ─── top bar ───────────────────────────────────────────────
  galleryTopBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 44,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    zIndex: 2,
  },
  galleryCloseBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  galleryCounter: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  galleryCounterText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // ─── arrows ────────────────────────────────────────────────
  galleryArrow: {
    position: 'absolute',
    top: '50%',
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 2,
  },
  galleryArrowLeft: { left: 8, transform: [{ translateY: -22 }] },
  galleryArrowRight: { right: 8, transform: [{ translateY: -22 }] },

  // ─── bottom thumbnail strip ────────────────────────────────
  galleryThumbStrip: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 28,
    left: 0, right: 0,
    zIndex: 2,
  },
  galleryThumbList: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  galleryThumb: {
    width: 60, height: 60, borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  galleryThumbActive: {
    borderColor: Colors.primary.main,
  },
  galleryThumbImg: { width: '100%', height: '100%' },
});
