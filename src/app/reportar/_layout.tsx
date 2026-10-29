import { Stack } from "expo-router";
import { useReducedMotion } from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/use-app-theme";

export default function ReportarLayout() {
  const reducedMotion = useReducedMotion();
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reducedMotion ? "none" : "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="categoria" />
      <Stack.Screen name="ubicacion" />
      <Stack.Screen name="evidencia" />
      <Stack.Screen name="revisar" />
      <Stack.Screen
        name="exito"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
