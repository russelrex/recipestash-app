import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Avatar, Button, List, Divider, Switch, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../services/api';

export default function ProfilePage() {
  const [userName, setUserName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const name = await authApi.getCurrentUserName();
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await authApi.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' as never }],
            });
          } catch (error) {
            console.error('Error during logout:', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={userName.substring(0, 2).toUpperCase()}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {userName}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            Recipe Enthusiast 👨‍🍳
          </Text>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Notifications"
          description="Recipe reminders and updates"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          )}
        />
        <Divider />
        <List.Item
          title="Dietary Preferences"
          description="Set your dietary restrictions"
          left={props => <List.Icon {...props} icon="food-apple" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Measurement Units"
          description="Metric or Imperial"
          left={props => <List.Icon {...props} icon="ruler" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Data & Storage</List.Subheader>
        <List.Item
          title="Export Recipes"
          description="Backup your recipe collection"
          left={props => <List.Icon {...props} icon="export" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Import Recipes"
          description="Import from other apps"
          left={props => <List.Icon {...props} icon="import" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Support</List.Subheader>
        <List.Item
          title="Help & FAQ"
          left={props => <List.Icon {...props} icon="help-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="About RecipeStash"
          description="Version 1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
      </List.Section>

      <Button
        mode="contained"
        buttonColor="#d84315"
        style={styles.logoutButton}
        onPress={handleLogout}
        icon="logout"
      >
        Logout
      </Button>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Made with ❤️ for food lovers
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#8BC34A',
  },
  name: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  email: {
    color: '#37474F',
    marginTop: 4,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#37474F',
  },
});

