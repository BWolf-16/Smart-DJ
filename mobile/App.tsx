import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/theme';
import { AuthProvider } from './src/contexts/AuthContext';
import { MusicProvider } from './src/contexts/MusicContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <NavigationContainer>
              <AuthProvider>
                <MusicProvider>
                  <AppNavigator />
                  <StatusBar style="auto" />
                </MusicProvider>
              </AuthProvider>
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}