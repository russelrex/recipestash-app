import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authApi } from '../services/api';

import AddRecipePage from '../screens/AddRecipePage';
import CreatePostPage from '../screens/CreatePostPage';
import Dashboard from '../screens/Dashboard';
import HomePage from '../screens/HomePage';
import LoginPage from '../screens/LoginPage';
import NewsfeedPage from '../screens/NewsfeedPage';
import PostDetailPage from '../screens/PostDetailPage';
import ProfilePage from '../screens/ProfilePage';
import RecipesPage from '../screens/RecipesPage';
import RegistrationPage from '../screens/RegistrationPage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Header Component with Glassmorphism
function CustomAppBar({ navigation, route, options, back }: any) {
  const theme = useTheme();
  return (
    <Appbar.Header
      style={[
        styles.appBar,
        {
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.6)',
        },
      ]}
    >
      {back ? (
        <Appbar.BackAction 
          onPress={navigation.goBack} 
          color={theme.colors.onSurface}
        />
      ) : null}
      <Appbar.Content 
        title={options.title || route.name}
        titleStyle={{ color: theme.colors.onSurface }}
      />
    </Appbar.Header>
  );
}

// Tab Navigator for authenticated users
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Newsfeed"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'newspaper';

          if (route.name === 'Newsfeed') {
            iconName = focused ? 'newspaper' : 'newspaper-variant-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Recipes') {
            iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8BC34A',
        tabBarInactiveTintColor: '#37474F',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.6)',
          elevation: 0,
          shadowOpacity: 0,
        },
        header: props => <CustomAppBar {...props} />,
      })}
    >
      <Tab.Screen
        name="Newsfeed"
        component={NewsfeedPage}
        options={{ title: 'Newsfeed', headerShown: false }}
      />
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesPage}
        options={{ title: 'My Recipes' }}
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

    checkAuthentication();
  }, []);

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
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Registration" component={RegistrationPage} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen 
          name="AddRecipe" 
          component={AddRecipePage}
          options={{ 
            headerShown: true,
            title: 'Add Recipe',
            header: (props) => <CustomAppBar {...props} />,
          }}
        />
        <Stack.Screen 
          name="CreatePost" 
          component={CreatePostPage}
          options={{ 
            headerShown: true,
            title: 'Create Post',
            header: (props) => <CustomAppBar {...props} />,
          }}
        />
        <Stack.Screen 
          name="PostDetail" 
          component={PostDetailPage}
          options={{ 
            headerShown: true,
            title: 'Post Details',
            header: (props) => <CustomAppBar {...props} />,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  appBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
});
