import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useReducedMotion } from "react-native-reanimated";

import { AppThemeProvider, useAppTheme } from "@/hooks/useAppTheme";
import { useAppFonts } from "@/hooks/useAppFonts";
import { clearLegacyStorage } from "@/services/clear-legacy-storage";
import { useReportsStore } from "@/store/useReportsStore";
import "../../global.css";

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
  const { fontsLoaded } = useAppFonts();
  const initializeReports = useReportsStore((s) => s.initialize);

  useEffect(() => {
    void initializeReports();
    void clearLegacyStorage().catch(() => undefined);
  }, [initializeReports]);

  if (!ready || !fontsLoaded) return null;

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
          primary: colors.primary,
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

        {/* Report Stepper Flow */}
        <Stack.Screen
          name="reportar"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />

        {/* Report Detail Screen */}
        <Stack.Screen
          name="reporte/[id]"
          options={{
            headerShown: false,
          }}
        />

        {/* Perfil → historial completo: horizontal push, 220 ms where the platform honors it */}
        <Stack.Screen
          name="perfil/reportes"
          options={{
            headerShown: false,
            animation: reducedMotion ? "none" : "slide_from_right",
            animationDuration: 220,
          }}
        />

        <Stack.Screen name="reporte/editar/[id]" options={{ headerShown: false }} />

        {/* Legacy routes preserved */}
        <Stack.Screen
          name="reports/[report_id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Cómo participar" }}
        />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={dark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
