import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme';

interface CustomHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: () => void;
  rightIcon?: string;
}

export function CustomHeader({ title, onBack, rightAction, rightIcon }: CustomHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.header, 
        { paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 8 }
      ]}
    >
      <View style={styles.headerContent}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.headerButton}>
            <Icon name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        )}
        
        <Text style={styles.headerTitle}>{title}</Text>
        
        <View style={styles.headerRight}>
          {rightAction && rightIcon && (
            <TouchableOpacity onPress={rightAction} style={styles.headerButton}>
              <Icon name={rightIcon} size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.background.default, // Match body color
    borderBottomWidth: 0, // No border
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48, // Reduced from default 56-64
    paddingHorizontal: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
});
