import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal as RNModal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Divider,
  IconButton,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { useImagePicker } from '../hooks/useImagePicker';
import { authApi, UserProfile } from '../services/api';
import { imageUploadService } from '../services/imageUploadService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85; // 85% so all content visible

const Colors = {
  primary: '#B15912',
  accentRed: '#CB4D44',
  avatarBg: '#B15912',
  border: '#E0D5C5',
  muted: '#888888',
};

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
  currentProfile: UserProfile | null;
}

export default function EditProfileModal({
  visible, onClose, onSave, currentProfile,
}: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const { pickFromLibrary, pickFromCamera, isLoading: pickingImage } = useImagePicker({
    aspect: [1, 1],
    quality: 0.8,
    allowsEditing: true,
    maxSizeMB: 5, // 5MB max for profile pictures
  });

  useEffect(() => {
    if (visible && currentProfile) {
      setName(currentProfile.name || '');
      setBio(currentProfile.bio || '');
      setAvatarPreview(currentProfile.avatarUrl || null);
      setAvatarUri(null);
    }
  }, [visible, currentProfile]);

  // Slide up / down animation
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 90,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            stiffness: 90,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleBackdropPress = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  // ── image picker ──────────────────────────────────────────────────────
  const handlePickFromGallery = useCallback(async () => {
    setImagePickerVisible(false);
    try {
      const img = await pickFromLibrary();
      if (img) {
        setAvatarPreview(img.uri);
        setAvatarUri(img.uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  }, [pickFromLibrary]);

  const handleTakePhoto = useCallback(async () => {
    setImagePickerVisible(false);
    try {
      const img = await pickFromCamera();
      if (img) {
        setAvatarPreview(img.uri);
        setAvatarUri(img.uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to take photo');
    }
  }, [pickFromCamera]);

  const handleRemoveAvatar = useCallback(() => {
    setImagePickerVisible(false);
    setAvatarPreview(null);
    setAvatarUri(null);
  }, []);

  // ── validation ────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!name.trim()) return 'Name cannot be empty';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must not exceed 50 characters';
    if (bio.length > 200) return 'Bio must not exceed 200 characters';
    return null;
  };

  // ── save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Validation Error', err);
      return;
    }

    setSaving(true);
    try {
      const payload: { name?: string; bio?: string; avatarUrl?: string } = {
        name: name.trim(),
        bio: bio.trim(),
      };
      
      if (avatarUri) {
        setUploading(true);
        try {
          const token = await authApi.getAuthToken();
          const hasToken = !!(token && token !== 'null' && token !== 'offline' && token.trim() !== '');
          if (!hasToken) {
            throw new Error('Authentication required. Please log in again.');
          }

          const uploadResult = await imageUploadService.uploadProfilePicture(
            avatarUri,
            token,
          );

          if (!uploadResult?.url) {
            throw new Error(
              'Upload succeeded but no image URL was returned from the server.',
            );
          }

          // Defer method: first upload, then update profile with URL
          payload.avatarUrl = uploadResult.url;
          (payload as any).profilePicture = uploadResult.url;
        } finally {
          setUploading(false);
        }
      } else if (avatarPreview === null && currentProfile?.avatarUrl) {
        // User removed avatar - send empty string to clear it
        payload.avatarUrl = '';
        (payload as any).profilePicture = '';
      }

      const updated = await authApi.updateProfile(payload);
      onSave(updated);
      onClose();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  // ── avatar ────────────────────────────────────────────────────────────
  const renderAvatar = () => avatarPreview
    ? <Avatar.Image size={100} source={{ uri: avatarPreview }} style={styles.avatar} />
    : <Avatar.Text
        size={100}
        label={(name || currentProfile?.name || '').substring(0, 2).toUpperCase()}
        style={[styles.avatar, { backgroundColor: Colors.avatarBg }]}
      />;

  // ── Choose Avatar sheet (RNModal so it appears ON TOP of Edit Profile) ──
  const renderImagePickerSheet = () => (
    <RNModal
      visible={imagePickerVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setImagePickerVisible(false)}
      statusBarTranslucent
    >
      <View style={styles.avatarPickerOuter}>
        <TouchableWithoutFeedback onPress={() => setImagePickerVisible(false)}>
          <View style={styles.avatarPickerBackdrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.actionSheetContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.actionSheetHandle} />
        <Text style={styles.actionSheetTitle}>Choose Avatar</Text>
        <Divider style={styles.actionSheetDivider} />

        <TouchableOpacity style={styles.actionRow} onPress={handleTakePhoto}>
          <IconButton icon="camera" size={22} iconColor={Colors.primary} style={styles.actionIcon} />
          <Text style={styles.actionLabel}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={handlePickFromGallery}>
          <IconButton icon="image" size={22} iconColor={Colors.primary} style={styles.actionIcon} />
          <Text style={styles.actionLabel}>Choose from Gallery</Text>
        </TouchableOpacity>

        {(avatarPreview || currentProfile?.avatarUrl) && (
          <>
            <Divider style={styles.actionSheetDivider} />
            <TouchableOpacity style={styles.actionRow} onPress={handleRemoveAvatar}>
              <IconButton icon="delete-outline" size={22} iconColor={Colors.accentRed} style={styles.actionIcon} />
              <Text style={[styles.actionLabel, { color: Colors.accentRed }]}>Remove Photo</Text>
            </TouchableOpacity>
          </>
        )}
        </View>
      </View>
    </RNModal>
  );

  const bottomPadding = Math.max(insets.bottom, 20);

  // ── main modal (bottom sheet) ────────────────────────────────────────
  return (
    <>
      <RNModal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              height: BOTTOM_SHEET_HEIGHT,
              paddingBottom: bottomPadding,
              transform: [{ translateY }],
            },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <KeyboardAvoidingView
            style={styles.kvFlex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : insets.top + 8}
          >
            <View style={styles.modalHeader}>
              <Button onPress={onClose} textColor={Colors.muted} disabled={saving || uploading || pickingImage}>Cancel</Button>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Button onPress={handleSave} textColor={Colors.primary} disabled={saving || uploading || pickingImage}>
                {saving || uploading ? 'Saving…' : 'Save'}
              </Button>
            </View>
            <Divider />

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => !saving && !uploading && !pickingImage && setImagePickerVisible(true)}
                activeOpacity={0.7}
                disabled={saving || uploading || pickingImage}
              >
                {renderAvatar()}
                <Surface style={styles.cameraChip}>
                  <IconButton icon="camera" size={18} iconColor="#fff" style={styles.cameraIcon} />
                </Surface>
                {(uploading || pickingImage) && (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.changePhotoHint}>
                {uploading ? 'Uploading...' : pickingImage ? 'Processing...' : 'Tap to change photo'}
              </Text>

              <View style={styles.fieldsContainer}>
                <TextInput
                  label="Name" value={name} onChangeText={setName}
                  style={styles.input} maxLength={50} editable={!saving && !uploading && !pickingImage}
                  mode="outlined" outlineColor={Colors.border} activeOutlineColor={Colors.primary}
                />
                <TextInput
                  label="Bio" value={bio} onChangeText={setBio}
                  style={[styles.input, styles.bioInput]}
                  maxLength={200} multiline numberOfLines={3} editable={!saving && !uploading && !pickingImage}
                  mode="outlined" outlineColor={Colors.border} activeOutlineColor={Colors.primary}
                  placeholder="Tell others about yourself…"
                />
                <Text style={styles.charCount}>{bio.length}/200</Text>
              </View>

              <View style={styles.saveButtonContainer}>
                <Button
                  mode="contained" onPress={handleSave} disabled={saving || uploading || pickingImage}
                  style={styles.saveButton} contentStyle={styles.saveButtonContent}
                  buttonColor={Colors.primary} textColor="#fff"
                >
                  {saving || uploading ? 'Saving…' : 'Save Changes'}
                </Button>
              </View>
            </ScrollView>

            {(saving || uploading) && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>
                  {uploading ? 'Uploading image…' : 'Saving your profile…'}
                </Text>
              </View>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </RNModal>
      {renderImagePickerSheet()}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  kvFlex: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },

  avatarContainer: { alignItems: 'center', marginTop: 24, marginBottom: 4 },
  avatar: { borderWidth: 2, borderColor: Colors.border },
  cameraChip: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cameraIcon: { margin: 0 },
  changePhotoHint: { textAlign: 'center', color: Colors.primary, fontSize: 13, marginBottom: 20 },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fieldsContainer: { paddingHorizontal: 20 },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  bioInput: { minHeight: 90 },
  charCount: { textAlign: 'right', fontSize: 12, color: Colors.muted, marginTop: -12, marginBottom: 8 },

  saveButtonContainer: { paddingHorizontal: 20, marginTop: 12 },
  saveButton: { borderRadius: 12 },
  saveButtonContent: { height: 50 },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingText: { marginTop: 12, color: Colors.primary, fontWeight: '600', fontSize: 14 },

  avatarPickerOuter: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  avatarPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  actionSheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  actionSheetTitle: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  actionSheetDivider: { marginVertical: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  actionIcon: { margin: 0, marginRight: 12 },
  actionLabel: { fontSize: 15, color: '#1a1a1a' },
});
