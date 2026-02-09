import * as ImagePicker from 'expo-image-picker';
import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { lightTheme } from './src/theme/theme';

export default function App() {
  // Request permissions on app start (silent, no alerts)
  useEffect(() => {
    (async () => {
      try {
        await ImagePicker.requestCameraPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Image permissions requested');
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
