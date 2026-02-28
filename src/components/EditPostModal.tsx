import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../styles/modernStyles';

interface EditPostModalProps {
  visible: boolean;
  post: { id: string; content: string } | null;
  loading?: boolean;
  onSave: (content: string) => void;
  onCancel: () => void;
}

const MAX_CHARACTERS = 500;

export const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  post,
  loading = false,
  onSave,
  onCancel,
}) => {
  const [content, setContent] = useState(post?.content ?? '');

  useEffect(() => {
    if (post) {
      setContent(post.content ?? '');
    }
  }, [post, visible]);

  const remainingChars = MAX_CHARACTERS - content.length;

  const getCharCountColor = () => {
    if (remainingChars < 0) return COLORS.error;
    if (remainingChars < 50) return COLORS.warning;
    return COLORS.textSecondary;
  };

  const handleSave = () => {
    if (content.trim() && content.length <= MAX_CHARACTERS) {
      onSave(content.trim());
    }
  };

  const canSave =
    content.trim().length > 0 &&
    content.length <= MAX_CHARACTERS &&
    !loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} disabled={loading}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Post</Text>
            <TouchableOpacity
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor={COLORS.textLight}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={MAX_CHARACTERS}
              textAlignVertical="top"
              autoFocus
              editable={!loading}
            />

            <View style={styles.charCountContainer}>
              <Text
                style={[styles.charCount, { color: getCharCountColor() }]}
              >
                {remainingChars} characters remaining
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    ...SHADOWS.large,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  title: {
    ...TYPOGRAPHY.h3,
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },

  saveButtonDisabled: {
    backgroundColor: COLORS.cardBackgroundAlt,
    opacity: 0.5,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  inputContainer: {
    padding: 20,
  },

  input: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },

  charCountContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  charCount: {
    fontSize: 12,
    fontWeight: '500',
  },
});
