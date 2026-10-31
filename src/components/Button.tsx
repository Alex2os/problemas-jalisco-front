import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Feather from "@expo/vector-icons/Feather";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radius, size, space } from "@/constants/design";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "agave"
  | "text";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  title?: string;
  label?: string;
  variant?: ButtonVariant;
  secondary?: boolean;
  size?: ButtonSize;
  icon?: React.ReactNode | React.ComponentProps<typeof Feather>["name"];
  iconPosition?: "left" | "right";
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  label,
  variant,
  secondary = false,
  size: buttonSize = "md",
  icon,
  iconPosition = "left",
  loading = false,
  loadingLabel,
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

  const displayTitle = label ?? title ?? "";
  const effectiveVariant: ButtonVariant =
    variant ?? (secondary ? "secondary" : "primary");

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled || loading) return;
    if (haptic && effectiveVariant !== "text") {
      void Haptics.impactAsync(
        effectiveVariant === "primary"
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

  switch (effectiveVariant) {
    case "primary":
      backgroundColor = colors.primary;
      textColor = colors.onPrimary;
      break;
    case "secondary":
      backgroundColor = secondary ? colors.surface : colors.raised;
      textColor = colors.text;
      borderColor = colors.border;
      break;
    case "agave":
      backgroundColor = colors.accent;
      textColor = colors.onAccent;
      break;
    case "outline":
      backgroundColor = "transparent";
      textColor = colors.text;
      borderColor = colors.borderStrong;
      break;
    case "ghost":
      backgroundColor = "transparent";
      textColor = colors.primaryText;
      break;
    case "danger":
      backgroundColor = colors.danger;
      textColor = "#FFFFFF";
      break;
    case "text":
      backgroundColor = "transparent";
      textColor = colors.primaryText;
      break;
    default:
      backgroundColor = colors.primary;
      textColor = colors.onPrimary;
  }

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "string") {
      return (
        <Feather
          name={icon as React.ComponentProps<typeof Feather>["name"]}
          size={size.smallIcon}
          color={disabled && !loading ? colors.muted : textColor}
        />
      );
    }
    return null;
  };

  const renderedIcon = renderIcon();

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || displayTitle}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPressIn={(event) => { setPressed(true); onPressIn?.(event); }}
      onPressOut={(event) => { setPressed(false); onPressOut?.(event); }}
      style={[
        styles.base,
        {
          height,
          paddingHorizontal,
          backgroundColor: disabled && !loading ? colors.raised : backgroundColor,
          borderColor: disabled && !loading ? (secondary ? colors.border : colors.borderStrong) : borderColor,
          borderWidth: disabled && !loading ? 1 : borderColor ? 1.5 : 0,
          borderRadius: radius.control,
          opacity: pressed && !disabled && !loading ? (effectiveVariant === "text" ? 0.75 : 0.85) : 1,
          transform: [
            {
              scale: pressed && !disabled && !loading && effectiveVariant !== "text" ? 0.98 : 1,
            },
          ],
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={textColor} size="small" />
          {loadingLabel ? (
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
              {loadingLabel}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={[styles.contentRow, fullWidth && styles.fullWidthContent]}>
          {renderedIcon && iconPosition === "left" && <View style={styles.iconLeft}>{renderedIcon}</View>}
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
            {displayTitle}
          </Text>
          {renderedIcon && iconPosition === "right" && <View style={styles.iconRight}>{renderedIcon}</View>}
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
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  loadingRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  fullWidthContent: { width: "100%" },
  text: {
    flexShrink: 1,
    fontWeight: "700",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  iconLeft: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRight: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
