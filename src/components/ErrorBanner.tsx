import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { radius, space } from "@/src/constants/design";

export interface ErrorBannerProps {
  message: string;
  variant?: "danger" | "warning";
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ErrorBanner({
  message,
  variant = "danger",
  onRetry,
  onDismiss,
  style,
}: ErrorBannerProps) {
  const { colors } = useAppTheme();

  const isDanger = variant === "danger";
  const bgColor = isDanger ? colors.dangerSoft : colors.warningSoft;
  const textColor = isDanger ? colors.danger : colors.warning;
  const borderColor = isDanger ? colors.danger : colors.warning;

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.banner,
        {
          backgroundColor: bgColor,
          borderColor,
        },
        style,
      ]}
    >
      <Ionicons
        name={isDanger ? "alert-circle" : "warning"}
        size={22}
        color={textColor}
        style={styles.icon}
      />

      <View style={styles.contentCol}>
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>

        {onRetry && (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Reintentar operación"
            style={({ pressed }) => [
              styles.retryBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="reload" size={14} color={textColor} />
            <Text style={[styles.retryText, { color: textColor }]}>Reintentar</Text>
          </Pressable>
        )}
      </View>

      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
          hitSlop={8}
          style={styles.dismissBtn}
        >
          <Ionicons name="close" size={18} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginVertical: space.sm,
  },
  icon: {
    marginRight: space.sm,
    marginTop: 1,
  },
  contentCol: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: space.xs,
    alignSelf: "flex-start",
    paddingVertical: 2,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  dismissBtn: {
    padding: 2,
    marginLeft: space.sm,
  },
});
