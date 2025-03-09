import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
        const isTabsGroup = segments[0] === '(tabs)';
        const isLoginScreen = segments[0] === 'login';
        
        if (!isAuthenticated && isTabsGroup) {
          router.replace('/login');
        } else if (isAuthenticated && !isTabsGroup && !isLoginScreen) {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      }
    };

    checkAuth();
  }, [segments]);
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useProtectedRoute();

  useEffect(() => {
    // Handle deep linking
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('Deep link URL:', url);
      
      if (url.includes('reset-success')) {
        // Handle password reset success
        // You can navigate to a specific screen or show a message
      }
    };

    // Add event listener for deep links when app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep link if app was opened through one
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      // Clean up the event listener
      subscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
