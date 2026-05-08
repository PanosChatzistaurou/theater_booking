import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return;

    async function checkAuth() {
      const token = await SecureStore.getItemAsync('userToken');
      const inAuthGroup = segments[0] === '(auth)';

      if (!token && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (token && inAuthGroup) {
        router.replace('/(drawer)');
      }
      setIsReady(true);
    }
    
    checkAuth();
  }, [segments, navState?.key]);

  if (!isReady) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}