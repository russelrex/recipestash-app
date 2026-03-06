import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.65;

const EMOJI_CATEGORIES: Record<
  string,
  { title: string; icon: string; emojis: string[] }
> = {
  smileys: {
    title: 'Smileys & People',
    icon: 'emoticon-happy-outline',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
      '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
      '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    ],
  },
  food: {
    title: 'Food & Drink',
    icon: 'food',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆',
      '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄',
      '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨',
      '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖',
      '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙',
      '🥘', '🍝', '🥫', '🥗', '🍲', '🍛', '🍜', '🍣',
      '🍱', '🍤', '🍙', '🍚', '🍘', '🍥', '🥮', '🍢',
      '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂',
      '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰',
      '☕', '🍵', '🥤', '🧃', '🧉', '🍶', '🍺', '🍻',
      '🥂', '🍷', '🥃', '🍸', '🍹', '🧊', '🥢', '🍴',
    ],
  },
  activities: {
    title: 'Activities',
    icon: 'soccer',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
      '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
      '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊',
      '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷',
    ],
  },
  hearts: {
    title: 'Hearts',
    icon: 'heart',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️',
    ],
  },
  symbols: {
    title: 'Symbols',
    icon: 'star',
    emojis: [
      '⭐', '🌟', '✨', '⚡', '💥', '🔥', '🌈', '☀️',
      '⛅', '☁️', '⛈', '🌧', '⛄', '❄️', '💨', '💧',
      '💦', '☔', '🌊', '🌙', '✅', '❌', '⭕', '❗',
      '❓', '💯', '🔔', '🔕', '🎵', '🎶', '🎤', '🎧',
    ],
  },
};

const CATEGORY_KEYS = Object.keys(EMOJI_CATEGORIES);

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({
  visible,
  onClose,
  onEmojiSelect,
}: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(CATEGORY_KEYS[0]);

  const handleEmojiPress = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  if (!visible) return null;

  const category = EMOJI_CATEGORIES[activeCategory];
  const emojis = category?.emojis ?? [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalWrapper}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Select Emoji</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.categoryTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabsContent}
            >
              {CATEGORY_KEYS.map(key => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryTab,
                    activeCategory === key && styles.activeCategoryTab,
                  ]}
                  onPress={() => setActiveCategory(key)}
                >
                  <Icon
                    name={EMOJI_CATEGORIES[key].icon as any}
                    size={24}
                    color={activeCategory === key ? '#D97706' : '#9CA3AF'}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            style={styles.emojiScrollView}
            contentContainerStyle={styles.emojiGridContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.emojiContainer}>
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={`${activeCategory}-${index}`}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiPress(emoji)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: MODAL_HEIGHT,
    maxHeight: MODAL_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 4,
  },
  categoryTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryTabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeCategoryTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#D97706',
  },
  emojiScrollView: {
    flex: 1,
  },
  emojiGridContent: {
    paddingBottom: 20,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  emojiButton: {
    width: SCREEN_WIDTH / 8,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
  },
  emoji: {
    fontSize: 32,
  },
});
