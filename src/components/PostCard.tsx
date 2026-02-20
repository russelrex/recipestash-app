import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Avatar,
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authApi, postsApi, recipesApi, type Comment, type Post } from '../services/api';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../styles/modernStyles';
import { Colors } from '../theme';
import CommentItem from './CommentItem';
import ProfileAvatar from './ProfileAvatar';
import { UserName } from './UserName';

const placeholderImage = require('../../assets/images/recipe_placeholder.webp');

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Account for padding
const CARD_HEIGHT = 480; // Fixed height for all cards
const IMAGE_SECTION_HEIGHT = 280; // Fixed height for image section
const FEATURED_IMAGE_HEIGHT = 320; // Taller when linked recipe is featured
const HEADER_HEIGHT = 60; // Fixed height for header
const CONTENT_HEIGHT = 80; // Fixed height for content section
const ACTIONS_HEIGHT = 50; // Fixed height for actions

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onUpdate?: (post: Post) => void;
  showComments?: boolean;
  maxCommentsPreview?: number;
}

export default function PostCard({
  post,
  onLike,
  onDelete,
  onUpdate,
  showComments = true,
  maxCommentsPreview = 2,
}: PostCardProps) {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUserId();
  }, []);

  useEffect(() => {
    setLocalPost(prev => {
      const next = { ...post };
      // Preserve recipe fields if API (e.g. toggleLike) returns a partial post without them
      if (post.id === prev?.id) {
        if (next.recipeId == null && prev.recipeId != null) next.recipeId = prev.recipeId;
        if (next.recipeTitle == null && prev.recipeTitle != null) next.recipeTitle = prev.recipeTitle;
        if ((!next.recipeImages?.length) && prev.recipeImages?.length) next.recipeImages = prev.recipeImages;
        if (next.userIsPremium == null && prev.userIsPremium != null) next.userIsPremium = prev.userIsPremium;
        if (!next.userSubscription && prev.userSubscription) next.userSubscription = prev.userSubscription;
      }
      return next;
    });
    setUserAvatarUrl(null);
  }, [post]);

  // Fetch user avatar for post author
  useEffect(() => {
    let cancelled = false;

    const loadUserAvatar = async () => {
      if (!localPost.userId) return;
      if (userAvatarUrl) return;

      try {
        const userProfile = await authApi.getUserProfile(localPost.userId);
        if (!cancelled && userProfile.avatarUrl) {
          setUserAvatarUrl(userProfile.avatarUrl);
        }
      } catch (error) {
        console.warn('Failed to load user avatar:', error);
      }
    };

    loadUserAvatar();
    return () => {
      cancelled = true;
    };
  }, [localPost.userId]);

  // Hydrate recipe images if needed
  useEffect(() => {
    let cancelled = false;

    const hydrateRecipeImages = async () => {
      if (!localPost.recipeId) return;
      if (localPost.recipeImages && localPost.recipeImages.length > 0) return;

      try {
        const recipe = await recipesApi.getRecipe(localPost.recipeId);
        const images: string[] = [];
        if (recipe?.featuredImage) images.push(recipe.featuredImage);
        if (Array.isArray(recipe?.images) && recipe.images.length > 0) {
          const remaining = 3 - images.length;
          if (remaining > 0) images.push(...recipe.images.slice(0, remaining));
        }

        if (cancelled) return;
        if (images.length > 0) {
          setLocalPost(prev => ({ ...prev, recipeImages: images }));
        }
      } catch {
        // silent: recipe images are optional
      }
    };

    hydrateRecipeImages();
    return () => {
      cancelled = true;
    };
  }, [localPost.recipeId]);

  const loadCurrentUserId = async () => {
    const userId = await authApi.getCurrentUserId();
    setCurrentUserId(userId);
  };

  const loadComments = async () => {
    if (commentsLoaded) return;

    try {
      setLoadingComments(true);
      const fetchedComments = await postsApi.getComments(localPost.id);
      setComments(fetchedComments);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLikePress = () => {
    const isLiked = currentUserId
      ? localPost.likes.includes(currentUserId)
      : false;

    const newLikes = isLiked
      ? localPost.likes.filter(id => id !== currentUserId)
      : [...localPost.likes, currentUserId!];

    setLocalPost({
      ...localPost,
      likes: newLikes,
      likesCount: newLikes.length,
    });

    onLike(localPost.id);
  };

  const handleCommentPress = async () => {
    if (!commentsLoaded) {
      await loadComments();
    }
    setCommentsVisible(prev => !prev);
    setShowCommentInput(prev => !prev);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const newComment = await postsApi.createComment(localPost.id, {
        content: commentText.trim(),
      });

      setComments(prev => [...prev, newComment]);
      setCommentText('');
      setLocalPost({
        ...localPost,
        commentsCount: localPost.commentsCount + 1,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postsApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setLocalPost({
        ...localPost,
        commentsCount: Math.max(0, localPost.commentsCount - 1),
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete?.(localPost.id),
      },
    ]);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  // Combine all images into a single array
  const getAllImages = (): string[] => {
    const images: string[] = [];
    if (localPost.imageUrl) images.push(localPost.imageUrl);
    if (localPost.recipeImages && localPost.recipeImages.length > 0) {
      images.push(...localPost.recipeImages);
    }
    return images;
  };

  const images = getAllImages();
  const hasLinkedRecipe = localPost.recipeId && localPost.recipeTitle;

  const handleRecipePress = () => {
    if (localPost.recipeId) {
      navigation.navigate(
        'RecipeDetail' as never,
        { recipeId: localPost.recipeId } as never,
      );
    }
  };

  // Linked recipe: featured image as background with content overlay and recipe badge
  const renderLinkedRecipeFeatured = () => {
    const recipeImageUri =
      (localPost.recipeImages && localPost.recipeImages[0]) ||
      localPost.imageUrl ||
      null;
    const source = recipeImageUri
      ? { uri: recipeImageUri }
      : placeholderImage;

    return (
      <TouchableOpacity
        activeOpacity={0.98}
        onPress={handleRecipePress}
        style={styles.featuredImageTouchable}
      >
        <ImageBackground
          source={source}
          style={styles.recipeImageBackground}
          imageStyle={styles.recipeImageStyle}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']}
            locations={[0, 0.45, 1]}
            style={styles.recipeGradientOverlay}
          />
          <View style={styles.recipeContentOverlay} pointerEvents="box-none">
            <Text
              style={styles.recipeContentText}
              numberOfLines={3}
            >
              {localPost.content}
            </Text>
            <TouchableOpacity
              style={styles.recipeBadge}
              onPress={handleRecipePress}
              activeOpacity={0.8}
            >
              <View style={styles.recipeBadgeContent}>
                <Icon name="book-open-variant" size={18} color={COLORS.primary} />
                <Text style={styles.recipeBadgeText} numberOfLines={1}>
                  {localPost.recipeTitle}
                </Text>
                <Icon name="chevron-right" size={20} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  // Render images based on count (regular posts only)
  const renderImages = () => {
    // If no linked recipe and no images, don't show image section at all
    if (images.length === 0 && !hasLinkedRecipe) {
      return null;
    }

    if (images.length === 0) {
      // No images but has linked recipe - show placeholder (legacy path; featured uses renderLinkedRecipeFeatured)
      return (
        <Image
          source={placeholderImage}
          style={styles.singleImage}
          resizeMode="cover"
        />
      );
    }

    if (images.length === 1) {
      // Single image - full width
      return (
        <Image
          source={images[0] ? { uri: images[0] } : placeholderImage}
          defaultSource={placeholderImage}
          style={styles.singleImage}
          resizeMode="cover"
        />
      );
    }

    if (images.length === 2) {
      // Two images - side by side
      return (
        <View style={styles.twoImagesRow}>
          <Image
            source={images[0] ? { uri: images[0] } : placeholderImage}
            defaultSource={placeholderImage}
            style={styles.halfImage}
            resizeMode="cover"
          />
          <View style={styles.imageGap} />
          <Image
            source={images[1] ? { uri: images[1] } : placeholderImage}
            defaultSource={placeholderImage}
            style={styles.halfImage}
            resizeMode="cover"
          />
        </View>
      );
    }

    if (images.length === 3) {
      // Three images - one large, two small stacked
      return (
        <View style={styles.threeImagesContainer}>
          <Image
            source={images[0] ? { uri: images[0] } : placeholderImage}
            defaultSource={placeholderImage}
            style={styles.largeImage}
            resizeMode="cover"
          />
          <View style={styles.smallImagesColumn}>
            <Image
              source={images[1] ? { uri: images[1] } : placeholderImage}
              defaultSource={placeholderImage}
              style={styles.smallImage}
              resizeMode="cover"
            />
            <View style={styles.imageGap} />
            <Image
              source={images[2] ? { uri: images[2] } : placeholderImage}
              defaultSource={placeholderImage}
              style={styles.smallImage}
              resizeMode="cover"
            />
          </View>
        </View>
      );
    }

    // Four or more images - 2x2 grid with "+X" overlay on last image
    const displayImages = images.slice(0, 4);
    const remainingCount = images.length - 4;

    return (
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <Image
            source={displayImages[0] ? { uri: displayImages[0] } : placeholderImage}
            defaultSource={placeholderImage}
            style={styles.gridImage}
            resizeMode="cover"
          />
          <View style={styles.imageGap} />
          <Image
            source={displayImages[1] ? { uri: displayImages[1] } : placeholderImage}
            defaultSource={placeholderImage}
            style={styles.gridImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.imageGap} />
        <View style={styles.gridRow}>
          <Image
            source={displayImages[2] ? { uri: displayImages[2] } : placeholderImage}
            defaultSource={placeholderImage}
            style={styles.gridImage}
            resizeMode="cover"
          />
          <View style={styles.imageGap} />
          <View style={styles.gridImageContainer}>
            <Image
              source={displayImages[3] ? { uri: displayImages[3] } : placeholderImage}
              defaultSource={placeholderImage}
              style={styles.gridImage}
              resizeMode="cover"
            />
            {remainingCount > 0 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>+{remainingCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const isOwnPost = currentUserId === localPost.userId;
  const isLiked = currentUserId
    ? localPost.likes.includes(currentUserId)
    : false;

  const visibleComments = showComments && commentsLoaded && commentsVisible
    ? comments.slice(0, maxCommentsPreview)
    : [];
  const hasMoreComments = comments.length > maxCommentsPreview;

  // Calculate card height
  const shouldShowImageSection = images.length > 0 || hasLinkedRecipe;
  const contentSectionHeight = hasLinkedRecipe ? 0 : CONTENT_HEIGHT;
  const imageSectionHeight = shouldShowImageSection
    ? hasLinkedRecipe
      ? FEATURED_IMAGE_HEIGHT
      : IMAGE_SECTION_HEIGHT
    : 0;
  const baseCardHeight =
    HEADER_HEIGHT +
    contentSectionHeight +
    imageSectionHeight +
    ACTIONS_HEIGHT;

  // When comments are expanded, allow card to grow so comment list + input are visible
  const isCommentsExpanded = showComments && (commentsVisible || showCommentInput);
  const cardStyle = isCommentsExpanded
    ? [styles.card, { minHeight: baseCardHeight }]
    : [styles.card, { height: baseCardHeight }];

  return (
    <View style={cardStyle}>
      {/* Header - Fixed Height */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              'UserProfile' as never,
              { userId: localPost.userId } as never,
            )
          }
          style={styles.userInfo}
        >
          <ProfileAvatar
            name={localPost.userName}
            avatarUrl={userAvatarUrl || undefined}
            size={40}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <UserName
              name={localPost.userName}
              subscription={localPost.userSubscription}
              isPremium={localPost.userIsPremium}
              variant="titleMedium"
              style={styles.userName}
              badgeSize={16}
              numberOfLines={1}
            />
            <Text variant="bodySmall" style={styles.timestamp}>
              {formatTimeAgo(localPost.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        {isOwnPost && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onUpdate?.(localPost);
              }}
              title="Edit"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={handleDelete}
              title="Delete"
              leadingIcon="delete"
            />
          </Menu>
        )}
      </View>

      {/* Content Text - only when NO linked recipe (content moves to overlay when linked) */}
      {!hasLinkedRecipe && (
        <View style={styles.contentSection}>
          <Text variant="bodyLarge" style={styles.contentText} numberOfLines={3}>
            {localPost.content}
          </Text>
        </View>
      )}

      {/* Image Section: featured recipe background or regular images */}
      {shouldShowImageSection && (
        <View
          style={[
            styles.imageSection,
            hasLinkedRecipe && { height: FEATURED_IMAGE_HEIGHT },
          ]}
        >
          {hasLinkedRecipe ? renderLinkedRecipeFeatured() : renderImages()}
        </View>
      )}

      {/* Actions - Fixed Height */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLikePress}
          activeOpacity={0.7}
        >
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? '#EF4444' : COLORS.textSecondary}
          />
          <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
            {localPost.likesCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCommentPress}
          activeOpacity={0.7}
        >
          <Icon name="comment-outline" size={24} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>
            {localPost.commentsCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate(
              'PostDetail' as never,
              { postId: localPost.id } as never,
            )
          }
          activeOpacity={0.7}
        >
          <Icon name="eye-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Comments Section - Dynamic Height */}
      {showComments && commentsLoaded && commentsVisible && (
        <View style={styles.commentsSection}>
          {visibleComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDeleteComment}
            />
          ))}

          {hasMoreComments && (
            <TouchableOpacity
              style={styles.viewAllComments}
              onPress={() =>
                navigation.navigate(
                  'PostDetail' as never,
                  { postId: localPost.id } as never,
                )
              }
            >
              <Text style={styles.viewAllCommentsText}>
                View all {comments.length} comments
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loadingComments && (
        <View style={styles.loadingComments}>
          <Text style={styles.loadingCommentsText}>Loading comments...</Text>
        </View>
      )}

      {/* Comment Input */}
      {commentsVisible && showCommentInput && (
        <View style={styles.commentInputContainer}>
          <Avatar.Text
            size={32}
            label={
              currentUserId
                ? localPost.userName.substring(0, 2).toUpperCase()
                : '?'
            }
            style={styles.commentAvatar}
          />
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Write a comment..."
            mode="outlined"
            style={styles.commentInput}
            multiline
            maxLength={500}
            disabled={submittingComment}
            dense
          />
          <IconButton
            icon="send"
            size={20}
            onPress={handleAddComment}
            disabled={submittingComment || !commentText.trim()}
            iconColor={commentText.trim() ? COLORS.primary : COLORS.textLight}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Card Container - FIXED HEIGHT
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.small,
  },

  // Header Section - Fixed 60px
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatar: {
    backgroundColor: COLORS.primary,
  },

  userDetails: {
    marginLeft: 12,
    flex: 1,
  },

  userName: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },

  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  // Content Section - Fixed 80px
  contentSection: {
    height: CONTENT_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },

  contentText: {
    ...(TYPOGRAPHY.body as object),
    lineHeight: 20,
    color: COLORS.text,
  },

  // Image Section - Fixed 280px (or FEATURED_IMAGE_HEIGHT when linked recipe)
  imageSection: {
    height: IMAGE_SECTION_HEIGHT,
    backgroundColor: COLORS.border,
    width: '100%',
  },

  // Linked recipe featured layout
  featuredImageTouchable: {
    width: '100%',
    height: '100%',
  },
  recipeImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  recipeImageStyle: {
    borderRadius: 0,
  },
  recipeGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  recipeContentOverlay: {
    padding: 20,
    paddingBottom: 16,
  },
  recipeContentText: {
    ...(TYPOGRAPHY.body as object),
    color: '#fff',
    lineHeight: 22,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  recipeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  recipeBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  recipeBadgeText: {
    flex: 1,
    ...(TYPOGRAPHY.label as object),
    color: COLORS.text,
    fontSize: 15,
    marginLeft: 8,
  },

  // No images placeholder
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundAlt,
  },

  // Single Image
  singleImage: {
    width: '100%',
    height: '100%',
  },

  // Two Images
  twoImagesRow: {
    flex: 1,
    flexDirection: 'row',
  },

  imageGap: {
    width: 2,
    backgroundColor: COLORS.cardBackground,
  },

  halfImage: {
    flex: 1,
    height: '100%',
  },

  // Three Images
  threeImagesContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  largeImage: {
    flex: 2,
    height: '100%',
  },

  smallImagesColumn: {
    flex: 1,
  },

  smallImage: {
    flex: 1,
    width: '100%',
  },

  // Four+ Images (2x2 Grid)
  gridContainer: {
    flex: 1,
  },

  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },

  gridImage: {
    flex: 1,
    height: '100%',
  },

  gridImageContainer: {
    flex: 1,
    position: 'relative',
  },

  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  moreImagesText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },

  // Linked Recipe - Fixed 40px (if present)
  linkedRecipe: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.primaryAlpha10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  linkedRecipeText: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.primary,
    flex: 1,
    marginLeft: 8,
  },

  // Actions Section - Fixed 50px
  actions: {
    height: ACTIONS_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },

  actionText: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.textSecondary,
    marginLeft: 6,
  },

  actionTextActive: {
    color: '#EF4444',
  },

  // Comments Section - Dynamic Height
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  viewAllComments: {
    paddingVertical: 8,
  },

  viewAllCommentsText: {
    ...(TYPOGRAPHY.bodySmall as object),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  loadingComments: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  loadingCommentsText: {
    ...(TYPOGRAPHY.caption as object),
    color: COLORS.textLight,
    textAlign: 'center',
  },

  // Comment Input
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  commentAvatar: {
    backgroundColor: COLORS.primary,
  },

  commentInput: {
    flex: 1,
    maxHeight: 100,
    marginLeft: 8,
    marginRight: 8,
  },
});
