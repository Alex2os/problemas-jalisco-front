import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";

export function ReportStepFooter({
  title,
  onPress,
  icon = "arrow-forward",
  disabled = false,
  loading = false,
  continuous = false,
}: {
  continuous?: boolean;
  title: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [pressed, setPressed] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const inactive = disabled || loading;
  const bottomPadding = keyboardVisible
    ? space.md
    : insets.bottom + (continuous ? space.md : space.xxl);

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: continuous ? colors.background : colors.surface,
          borderTopColor: colors.border,
          paddingTop: keyboardVisible ? space.md : space.lg,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={() => {
          if (!inactive) onPress();
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[
          styles.button,
          continuous && styles.continuousButton,
          {
            backgroundColor:
              continuous && disabled
                ? colors.raised
                : pressed && !inactive
                  ? colors.primaryDark
                  : colors.primary,
            opacity: disabled && !continuous ? 0.5 : 1,
            transform: continuous
              ? undefined
              : [{ scale: pressed && !inactive ? 0.99 : 1 }],
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: continuous && disabled ? colors.muted : colors.onPrimary },
          ]}
        >
          {title}
        </Text>
        <View pointerEvents="none" style={styles.icon}>
          {loading ? (
            <ActivityIndicator
              color={continuous && disabled ? colors.muted : colors.onPrimary}
            />
          ) : (
            <Ionicons
              name={icon}
              size={22}
              color={continuous && disabled ? colors.muted : colors.onPrimary}
            />
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  continuousButton: {
    maxWidth: 640,
    minHeight: size.control,
    borderRadius: radius.control,
    paddingVertical: space.md,
  },
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
