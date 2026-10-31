import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";

export function ReportStepFooter({
  title, onPress, icon = "arrow-forward", disabled = false, loading = false,
}: {
  title: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [pressed, setPressed] = useState(false);
  const inactive = disabled || loading;
  return (
    <View style={[styles.footer, {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      paddingBottom: insets.bottom + space.xxl,
    }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={() => { if (!inactive) onPress(); }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[styles.button, {
          backgroundColor: pressed && !inactive ? colors.primaryDark : colors.primary,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !inactive ? 0.99 : 1 }],
        }]}
      >
        <Text style={[styles.label, { color: colors.onPrimary }]}>{title}</Text>
        <View pointerEvents="none" style={styles.icon}>
          {loading ? <ActivityIndicator color={colors.onPrimary} />
            : <Ionicons name={icon} size={22} color={colors.onPrimary} />}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexShrink: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 480,
    minHeight: 56,
    borderRadius: radius.group,
    paddingVertical: space.lg,
    paddingHorizontal: 48,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    alignSelf: "center",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
  },
  icon: {
    position: "absolute",
    right: space.lg,
    top: 0,
    bottom: 0,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
