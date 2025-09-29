import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../contexts/AppContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContexto';

export default function RootLayout() {
  const { isAuthenticated } = useAuth();



  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="pedido"
              options={{
                headerShown: true,
                title: 'Fazer Pedido',
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                headerShown: true,
                title: 'Login'
              }}
            />
          </Stack>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}