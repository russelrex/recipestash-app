import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Appbar, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authApi } from '../services/api';

import AddRecipePage from '../screens/AddRecipePage';
import CreatePostPage from '../screens/CreatePostPage';
import Dashboard from '../screens/Dashboard';
import FollowersPage from '../screens/FollowersPage';
import FollowingPage from '../screens/FollowingPage';
import HomePage from '../screens/HomePage';
import LoginPage from '../screens/LoginPage';
import NewsfeedPage from '../screens/NewsfeedPage';
import PostDetailPage from '../screens/PostDetailPage';
import ProfilePage from '../screens/ProfilePage';
import RecipeDetailPage from '../screens/RecipeDetailPage';
import RecipesPage from '../screens/RecipesPage';
import RegistrationPage from '../screens/RegistrationPage';
import SettingsPage from '../screens/SettingsPage';
import UserProfilePage from '../screens/UserProfilePage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Header Component
function CustomAppBar({ navigation, route, options, back }: any) {
  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={options.title || route.name} />
    </Appbar.Header>
  );
}

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const [showModal, setShowModal] = useState(false);

  const handleCenterPress = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Skip the middle placeholder route
          if (route.name === 'CreateAction') {
            return <View key={route.key} style={styles.tabItem} />;
          }

          let iconName = 'home';
          if (route.name === 'Newsfeed') {
            iconName = isFocused ? 'newspaper-variant' : 'newspaper-variant-outline';
          } else if (route.name === 'Recipes') {
            iconName = isFocused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
          } else if (route.name === 'Dashboard') {
            iconName = isFocused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Profile') {
            iconName = isFocused ? 'account' : 'account-outline';
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? '#d84315' : '#888'}
              />
            </TouchableOpacity>
          );
        })}

        {/* Center FAB */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleCenterPress}
            activeOpacity={0.8}
          >
            <Icon
              name={showModal ? 'close' : 'plus'}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Modal */}
      {showModal && (
        <View style={styles.actionModal}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setShowModal(false);
              navigation.navigate('AddRecipe');
            }}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="book-plus" size={24} color="#d84315" />
            </View>
            <View style={styles.actionTextContainer}>
              <View style={styles.actionTitleRow}>
                <Icon name="book-open-page-variant" size={16} color="#d84315" />
                <Text style={styles.actionTitle}>Add Recipe</Text>
              </View>
              <Text style={styles.actionDescription}>Create a new recipe</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setShowModal(false);
              navigation.navigate('CreatePost');
            }}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="text-box-plus" size={24} color="#d84315" />
            </View>
            <View style={styles.actionTextContainer}>
              <View style={styles.actionTitleRow}>
                <Icon name="newspaper-variant" size={16} color="#d84315" />
                <Text style={styles.actionTitle}>Create Post</Text>
              </View>
              <Text style={styles.actionDescription}>Share your cooking journey</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Backdrop */}
      {showModal && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => setShowModal(false)}
          activeOpacity={1}
        />
      )}
    </>
  );
}

// Tab Navigator for authenticated users
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Newsfeed"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Newsfeed" 
        component={NewsfeedPage}
        options={{ title: 'Newsfeed' }}
      />
      <Tab.Screen 
        name="Recipes" 
        component={RecipesPage}
        options={{ title: 'My Recipes' }}
      />
      {/* Placeholder for center button */}
      <Tab.Screen
        name="CreateAction"
        component={View}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfilePage}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator with Auth Check
export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authenticated = await authApi.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const initialRouteName = isAuthenticated ? 'MainTabs' : 'Home';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: true,
          header: (props) => <CustomAppBar {...props} />,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Registration" 
          component={RegistrationPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddRecipe" 
          component={AddRecipePage}
          options={{ title: 'Add Recipe' }}
        />
        <Stack.Screen 
          name="CreatePost" 
          component={CreatePostPage}
          options={{ title: 'Create Post' }}
        />
        <Stack.Screen 
          name="RecipeDetail" 
          component={RecipeDetailPage}
          options={{ title: 'Recipe' }}
        />
        <Stack.Screen 
          name="PostDetail" 
          component={PostDetailPage}
          options={{ title: 'Post' }}
        />
        <Stack.Screen 
          name="UserProfile" 
          component={UserProfilePage}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen 
          name="Followers" 
          component={FollowersPage}
          options={{ title: 'Followers' }}
        />
        <Stack.Screen 
          name="Following" 
          component={FollowingPage}
          options={{ title: 'Following' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsPage}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 5,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    left: '50%',
    top: -28,
    marginLeft: -28,
    zIndex: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d84315',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
  },
  actionModal: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff8e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
});
