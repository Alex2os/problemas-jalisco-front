import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/use-color-scheme';
import "../global.css";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // we can load fonts like this. we declare a useFonts variable and then load the fonts we want, in this-
  // case we have them locally.
  const [loaded] = useFonts({
    ArchivoBlack: require('@/assets/fonts/ArchivoBlack-Regular.ttf'),
  });

  // if we obtain nothing, dont render anything.
  if(!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal'}} />

        <Stack.Screen name="auth/login" options={{headerShown: false}} />
        <Stack.Screen name="auth/register" options={{headerShown: false}} />

        <Stack.Screen name="reports/[report_id]" options={{headerShown: false}} />

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}