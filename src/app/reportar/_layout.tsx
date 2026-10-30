import { router, usePathname } from "expo-router";
import { Stack, CardStyleInterpolators } from "expo-router/js-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Easing, KeyboardAvoidingView, Platform, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StepProgress } from "@/components/StepProgress";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDraftStore } from "@/store/useDraftStore";

const steps = [
  { route: "categoria", title: "Categoría" },
  { route: "ubicacion", title: "Ubicación" },
  { route: "evidencia", title: "Evidencia" },
  { route: "revisar", title: "Revisar" },
];

export default function ReportarLayout() {
  const reducedMotion = useReducedMotion();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const submitting = useDraftStore((state) => state.isSubmitting);
  const index = steps.findIndex((step) => pathname.endsWith(`/${step.route}`));
  const step = steps[index];

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {step && (
        <View style={{ paddingTop: insets.top }}>
          <StepProgress
            currentStep={index + 1}
            totalSteps={steps.length}
            stepTitle={step.title}
            backDisabled={submitting}
            onBack={() => {
              if (submitting) return;
              if (index === 0) router.dismissTo("/mapa");
              else if (router.canGoBack()) router.back();
              else router.replace("/mapa");
            }}
          />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Stack
          detachInactiveScreens={false}
          screenOptions={{
            headerShown: false,
            animation: reducedMotion ? "none" : "slide_from_right",
            cardStyleInterpolator: reducedMotion ? CardStyleInterpolators.forNoAnimation : CardStyleInterpolators.forHorizontalIOS,
            transitionSpec: {
              open: { animation: "timing", config: { duration: 320, easing: Easing.out(Easing.cubic) } },
              close: { animation: "timing", config: { duration: 320, easing: Easing.out(Easing.cubic) } },
            },
            gestureDirection: "horizontal",
            gestureResponseDistance: 24,
            detachPreviousScreen: false,
            gestureEnabled: !submitting,
            cardStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="categoria" />
          <Stack.Screen name="ubicacion" />
          <Stack.Screen name="evidencia" />
          <Stack.Screen name="revisar" />
          <Stack.Screen name="exito" options={{
            gestureEnabled: false,
            animation: reducedMotion ? "none" : "fade",
            cardStyleInterpolator: reducedMotion ? CardStyleInterpolators.forNoAnimation : CardStyleInterpolators.forFadeFromCenter,
          }} />
        </Stack>
      </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
