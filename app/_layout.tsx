import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useReducedMotion } from "react-native-reanimated";

import { AppThemeProvider, useAppTheme } from "@/hooks/use-app-theme";
import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Navigation />
    </AppThemeProvider>
  );
}

function Navigation() {
  const reducedMotion = useReducedMotion();
  const { dark, colors, ready } = useAppTheme();

  if (!ready) return null;

  return (
    <ThemeProvider
      value={{
        ...(dark ? DarkTheme : DefaultTheme),
        colors: {
          ...(dark ? DarkTheme : DefaultTheme).colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.accent,
        },
      }}
    >
      <Stack
        screenOptions={{
          animation: reducedMotion ? "none" : "default",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Cómo participar" }}
        />

        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />

        <Stack.Screen
          name="reports/[report_id]"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style={dark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
