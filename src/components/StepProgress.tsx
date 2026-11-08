import React, { useEffect } from "react";
import Animated, { Easing, FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { motion, space } from "@/constants/design";

export interface StepProgressProps {
  currentStep: number;
  totalSteps?: number;
  stepTitle: string;
  onBack?: () => void;
  backDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function StepProgress({
  currentStep,
  totalSteps = 4,
  stepTitle,
  onBack,
  backDisabled = false,
  style,
}: StepProgressProps) {
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const progressRatio = Math.min(Math.max(currentStep / Math.max(1, totalSteps), 0), 1);
  const progress = useSharedValue(progressRatio);
  useEffect(() => {
    progress.value = withTiming(progressRatio, {
      duration: reducedMotion ? 0 : motion.progress,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, progressRatio, reducedMotion]);
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  const handleBack = () => {
    if (backDisabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable
            onPress={handleBack}
            disabled={backDisabled}
            accessibilityState={{ disabled: backDisabled }}
            accessibilityRole="button"
            accessibilityLabel={currentStep === 1 ? "Volver al mapa" : "Atrás"}
            hitSlop={12}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}

        <Animated.Text
          key={stepTitle}
          entering={reducedMotion ? undefined : FadeIn.duration(motion.micro)}
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {stepTitle}
        </Animated.Text>

        <View style={styles.backBtn} />
      </View>

      {/* Thin Minimal Track */}
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: totalSteps, now: currentStep }}
        accessibilityLabel="Progreso del reporte" style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.fill,
            fillStyle,
            {
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: space.md,
    paddingTop: space.xs,
    paddingBottom: space.xs,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  track: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 2,
  },
  fill: {
    width: "100%",
    height: "100%",
    transformOrigin: "left",
  },
});
