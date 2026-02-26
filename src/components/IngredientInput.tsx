import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Text, TextInput } from 'react-native-paper';
import { Colors } from '../theme';

interface IngredientInputProps {
  index: number;
  value: string;
  onChange: (text: string) => void;
  onRemove: () => void;
}

export default function IngredientInput({
  index,
  value,
  onChange,
  onRemove,
}: IngredientInputProps) {
  const badgeLabel = (index + 1).toString();

  return (
    <Card style={styles.card} elevation={2}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Ingredient {badgeLabel}</Text>
        </View>

        <View style={styles.headerActions}>
          <IconButton
            icon="delete-outline"
            size={20}
            iconColor={Colors.status?.error || '#C62828'}
            onPress={onRemove}
          />
        </View>
      </View>

      <TextInput
        label="Ingredient"
        value={value}
        onChangeText={onChange}
        mode="outlined"
        style={styles.input}
        placeholder="e.g., 2 cups flour"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: Colors.background?.paper || '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border?.light || '#ECECEC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginTop: 8,
  },
});

