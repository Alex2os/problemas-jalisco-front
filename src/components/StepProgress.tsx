import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { size, space } from "@/src/constants/design";

export interface StepProgressProps {
  currentStep: number;
  totalSteps?: number;
  stepTitle: string;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StepProgress({
  currentStep,
  totalSteps = 4,
  stepTitle,
  onBack,
  style,
}: StepProgressProps) {
  const { colors } = useAppTheme();
  const progressRatio = Math.min(Math.max(currentStep / totalSteps, 0), 1);

  const handleBack = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        {onBack && currentStep > 1 ? (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Atrás"
            hitSlop={12}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}

        <Text style={[styles.title, { color: colors.text }]}>{stepTitle}</Text>

        <View style={styles.backBtn} />
      </View>

      {/* Thin Minimal Track */}
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: colors.accent,
              width: `${progressRatio * 100}%`,
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
    height: "100%",
  },
});
