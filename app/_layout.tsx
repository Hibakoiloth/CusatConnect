import React from 'react';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'TTRamillas': require('../assets/fonts/tt_ramillas/TT Ramillas Trial Regular.ttf'),
    'Oswald-Bold': require('../assets/fonts/Oswald/static/Oswald-Bold.ttf'),
    'Oswald-SemiBold': require('../assets/fonts/Oswald/static/Oswald-SemiBold.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto/static/Roboto-Medium.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto/static/Roboto-Regular.ttf'),
  });

  // Set up deep linking
  useEffect(() => {
    // Handle URLs when app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Handle URLs that launched the app
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    })();

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle deep links for password reset and other auth flows
  const handleDeepLink = ({ url }: { url: string }) => {
    if (url && url.includes('password-confirm')) {
      // Extract auth parameters and set the supabase session
      const parsedURL = Linking.parse(url);
      console.log("Deep link received:", url);
      console.log("Parsed URL:", parsedURL);
      
      // Check if we have auth-related params
      if (parsedURL.queryParams) {
        const { access_token, refresh_token, type } = parsedURL.queryParams as {
          access_token?: string;
          refresh_token?: string;
          type?: string;
        };

        console.log("Auth params:", { access_token: !!access_token, type });

        // If we have tokens, set the session
        if (access_token && type === 'recovery') {
          console.log("Setting session from deep link");
          // Set the session
          supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });
        }
      }
    }
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"  />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="password-confirm" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(teacher-tabs)" />
        <Stack.Screen name="(staff-tabs)" />
      </Stack>
    </>
  );
}
