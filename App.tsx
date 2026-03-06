import * as ImagePicker from 'expo-image-picker';
import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import imageCacheService from './src/services/imageCacheService';
import { lightTheme } from './src/theme/theme';

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await ImagePicker.requestCameraPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    imageCacheService.initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
