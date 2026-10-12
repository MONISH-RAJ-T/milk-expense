import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { MilkDataProvider } from './src/context/MilkDataContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const ThemedContent: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MilkDataProvider>
            <ThemedContent />
          </MilkDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

