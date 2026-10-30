import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radius, size, space } from "@/constants/design";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "agave";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  variant = "primary",
  size: buttonSize = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  haptic = true,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const { colors } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  const handlePress = (e: any) => {
    if (disabled || loading) return;
    if (haptic) {
      void Haptics.impactAsync(
        variant === "primary"
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }
    onPress?.(e);
  };

  // Dimensions
  const height =
    buttonSize === "lg" ? size.buttonLg : buttonSize === "sm" ? size.minTouch : size.control;
  const paddingHorizontal = buttonSize === "lg" ? space.xl : buttonSize === "sm" ? space.md : space.lg;
  const fontSize = buttonSize === "lg" ? 17 : buttonSize === "sm" ? 15 : 16;

  // Background and borders per variant
  let backgroundColor: string;
  let textColor: string;
  let borderColor: string | undefined;

  switch (variant) {
    case "primary":
      backgroundColor = colors.accent;
      textColor = colors.onAccent;
      break;
    case "secondary":
      backgroundColor = colors.primary;
      textColor = colors.onPrimary;
      break;
    case "agave":
      backgroundColor = colors.agave;
      textColor = colors.onAgave;
      break;
    case "outline":
      backgroundColor = "transparent";
      textColor = colors.text;
      borderColor = colors.borderStrong;
      break;
    case "ghost":
      backgroundColor = "transparent";
      textColor = colors.accent;
      break;
    case "danger":
      backgroundColor = colors.danger;
      textColor = "#FFFFFF";
      break;
    default:
      backgroundColor = colors.accent;
      textColor = colors.onAccent;
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPressIn={(event) => { setPressed(true); onPressIn?.(event); }}
      onPressOut={(event) => { setPressed(false); onPressOut?.(event); }}
      style={[
        styles.base,
        {
          height,
          paddingHorizontal,
          backgroundColor: disabled && !loading ? colors.raised : backgroundColor,
          borderColor: disabled && !loading ? colors.borderStrong : borderColor,
          borderWidth: disabled && !loading ? 1 : borderColor ? 1.5 : 0,
          borderRadius: radius.control,
          opacity: pressed && !disabled && !loading ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled && !loading ? 0.98 : 1 }],
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === "left" && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: disabled ? colors.muted : textColor,
                fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: size.minTouch,
    minWidth: size.minTouch,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "700",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  iconLeft: {
    marginRight: space.sm,
  },
  iconRight: {
    marginLeft: space.sm,
  },
});
