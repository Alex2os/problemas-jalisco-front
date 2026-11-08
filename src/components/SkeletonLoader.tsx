import React, { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAppTheme } from "@/hooks/useAppTheme";
import { motion, radius, space } from "@/constants/design";

export interface SkeletonProps {
  width?: number | `${number}%` | "100%";
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonItem({
  width = "100%",
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonProps) {
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 0.6;
      return;
    }
    opacity.value = 0.4;
    opacity.value = withRepeat(
      withTiming(0.85, { duration: motion.pulse, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.raised,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonReportCard() {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.cardSkeleton,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.row}>
        <SkeletonItem width={88} height={88} borderRadius={radius.md} />
        <View style={styles.col}>
          <SkeletonItem width="60%" height={14} style={{ marginBottom: 8 }} />
          <SkeletonItem width="90%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonItem width="75%" height={12} style={{ marginBottom: 12 }} />
          <View style={styles.bottomRow}>
            <SkeletonItem width={80} height={24} borderRadius={radius.full} />
            <SkeletonItem width={60} height={16} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    borderRadius: radius.group,
    borderWidth: 1,
    padding: space.md,
    marginBottom: space.md,
  },
  row: {
    flexDirection: "row",
    gap: space.md,
  },
  col: {
    flex: 1,
    justifyContent: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
