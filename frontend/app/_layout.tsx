import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export default function RootLayout() {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // 1. Re-run this check whenever the 'segments' change
  useEffect(() => {
    async function loadToken() {
      try {
        if (Platform.OS !== 'web') {
          const savedToken = await SecureStore.getItemAsync('userToken');
          setToken(savedToken);
        }
      } catch (e) {
        console.error("Token load error", e);
      } finally {
        setIsReady(true);
      }
    }
    loadToken();
  }, [segments]); // Add segments here to catch the login transition

  useEffect(() => {
    if (!navigationState?.key || !isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, isReady, navigationState?.key, segments]);

  return <Slot />;
}