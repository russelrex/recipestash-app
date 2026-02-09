import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DebugPanel } from './src/components/DebugPanel';
import AppNavigator from './src/navigation/AppNavigator';
import { API_BASE_URL } from './src/services/api/config';
import { lightTheme } from './src/theme/theme';

export default function App() {
  // Log API configuration on app start
  console.log('🚀 RecipeStash Starting...');
  console.log('🌐 EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL || 'NOT SET');
  console.log('🌐 API_BASE_URL:', API_BASE_URL);
  console.log('📱 Build Profile:', process.env.EAS_BUILD_PROFILE || 'development');

  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <AppNavigator />
        {/* Debug panel - shows floating 🐛 button */}
        <DebugPanel />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
