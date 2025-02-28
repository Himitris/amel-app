// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { EventsProvider } from '../context/EventsContext';
import { SlotsProvider } from '../context/SlotsContext';
import { COLORS } from '../constants/theme';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.frameworkReady?.();
    }
  }, []);

  return (
    <AuthProvider>
      <EventsProvider>
        <SlotsProvider>
          <Stack 
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="slot-details" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="create-slot" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
          </Stack>
          <StatusBar style="auto" />
        </SlotsProvider>
      </EventsProvider>
    </AuthProvider>
  );
}