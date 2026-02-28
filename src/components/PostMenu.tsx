import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../styles/modernStyles';

interface PostMenuProps {
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const PostMenu: React.FC<PostMenuProps> = ({
  isOwner,
  onEdit,
  onDelete,
}) => {
  const [visible, setVisible] = useState(false);

  if (!isOwner) return null;

  const handleEdit = () => {
    setVisible(false);
    onEdit();
  };

  const handleDelete = () => {
    setVisible(false);
    onDelete();
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="dots-vertical" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEdit}
            >
              <Icon name="pencil" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Edit Post</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDelete}
            >
              <Icon name="delete" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, styles.deleteText]}>
                Delete Post
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 4,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dropdownContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    width: 200,
    ...SHADOWS.large,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },

  menuItemText: {
    ...TYPOGRAPHY.label,
    fontSize: 15,
  },

  deleteText: {
    color: COLORS.error,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
