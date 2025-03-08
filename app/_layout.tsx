import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export const unstable_settings = {
  // Initial route name
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'LexendDeca': require('../assets/fonts/Lexend_Deca/LexendDeca-VariableFont_wght.ttf'),
    'Playfair': require('../assets/fonts/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf'),
    'TTRamillas': require('../assets/fonts/tt_ramillas/TT Ramillas Trial Italic.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack 
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'none'
        }}
      >
        <Stack.Screen 
          name="(auth)"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="(tabs)"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="(office-tabs)"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="(teacher-tabs)"
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
