import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authApi } from '../services/api';

import HomePage from '../screens/HomePage';
import LoginPage from '../screens/LoginPage';
import RegistrationPage from '../screens/RegistrationPage';
import Dashboard from '../screens/Dashboard';
import RecipesPage from '../screens/RecipesPage';
import ProfilePage from '../screens/ProfilePage';

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

// Tab Navigator for authenticated users
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'view-dashboard';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Recipes') {
            iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#d84315',
        tabBarInactiveTintColor: 'gray',
        header: props => <CustomAppBar {...props} />,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ title: 'Dashboard' }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
