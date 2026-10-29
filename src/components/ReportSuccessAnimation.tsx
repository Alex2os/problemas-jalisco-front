import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  cancelAnimation, Easing, Extrapolation, interpolate, useAnimatedStyle,
  useReducedMotion, useSharedValue, withDelay, withSpring, withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/use-app-theme";

function Spark({ angle, progress, color }: { angle: number; progress: SharedValue<number>; color: string }) {
  const radians = angle * Math.PI / 180;
  const style = useAnimatedStyle(() => {
    const distance = interpolate(progress.value, [0, 1], [64, 108]);
    return {
      opacity: interpolate(progress.value, [0, 0.12, 0.65, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: Math.cos(radians) * distance },
        { translateY: Math.sin(radians) * distance },
        { rotate: `${angle + progress.value * 60}deg` },
        { scale: interpolate(progress.value, [0, 0.25, 1], [0.5, 1, 0.4]) },
      ],
    };
  });
  return <Animated.View style={[styles.spark, { backgroundColor: color }, style]} />;
}

export function ReportSuccessAnimation() {
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const badge = useSharedValue(reducedMotion ? 1 : 0);
  const check = useSharedValue(reducedMotion ? 1 : 0);
  const burst = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      badge.value = 1;
      check.value = 1;
      burst.value = 1;
      return;
    }
    badge.value = withDelay(100, withSpring(1, { damping: 13, stiffness: 150, mass: 0.7 }));
    check.value = withDelay(240, withSpring(1, { damping: 11, stiffness: 180, mass: 0.6 }));
    burst.value = withDelay(240, withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) }));
    return () => { cancelAnimation(badge); cancelAnimation(check); cancelAnimation(burst); };
  }, [badge, check, burst, reducedMotion]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, badge.value),
    transform: [{ scale: 0.6 + badge.value * 0.4 }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, check.value),
    transform: [{ scale: check.value }, { rotate: `${(1 - check.value) * -12}deg` }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - burst.value) * 0.35,
    transform: [{ scale: 0.7 + burst.value * 0.65 }],
  }));

  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.stage}>
      <Animated.View style={[styles.ring, { borderColor: colors.success }, ringStyle]} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
        <Spark key={angle} angle={angle} progress={burst} color={index % 3 === 0 ? colors.accent : colors.success} />
      ))}
      <Animated.View style={[styles.badge, { backgroundColor: colors.successSoft }, badgeStyle]}>
        <View style={[styles.innerCircle, { backgroundColor: colors.success }]}>
          <Animated.View style={checkStyle}>
            <Ionicons name="checkmark" size={54} color={colors.background} allowFontScaling={false}
              style={styles.checkmark} />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: 224, height: 224, alignSelf: "center", alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: 160, height: 160, borderRadius: 80, borderWidth: 2 },
  badge: { width: 136, height: 136, borderRadius: 68, alignItems: "center", justifyContent: "center" },
  innerCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  checkmark: { width: 54, height: 54, lineHeight: 54, includeFontPadding: false, textAlign: "center", textAlignVertical: "center" },
  spark: { position: "absolute", width: 7, height: 7, borderRadius: 2 },
});
