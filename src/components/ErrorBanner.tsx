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
import { Button } from "@/components/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radius, size, space } from "@/constants/design";

export interface ErrorBannerProps {
  message: string;
  variant?: "danger" | "warning";
  onRetry?: () => void;
  retrying?: boolean;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ErrorBanner({
  message,
  variant = "danger",
  onRetry,
  retrying = false,
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
      <View style={styles.messageRow}>
        <Ionicons
          name={isDanger ? "alert-circle" : "warning"}
          size={22}
          color={textColor}
          style={styles.icon}
        />
        <View style={styles.contentCol}>
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        </View>
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Cerrar aviso"
            style={styles.dismissBtn}
          >
            <Ionicons name="close" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {onRetry && (
        <Button
          title={retrying ? "Reintentando…" : "Reintentar"}
          accessibilityLabel="Reintentar operación"
          variant="danger"
          size="sm"
          style={styles.retryButton}
          textStyle={styles.retryLabel}
          hitSlop={{ top: space.xs, bottom: space.xs }}
          fullWidth
          loading={retrying}
          icon={<Ionicons name="reload-outline" size={16} color="#FFFFFF" />}
          onPress={onRetry}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    flexShrink: 0,
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginVertical: space.sm,
  },
  messageRow: { flexDirection: "row", alignItems: "flex-start" },
  retryButton: { height: size.touch - space.sm, minHeight: size.touch - space.sm },
  retryLabel: { fontSize: 13 },
  icon: {
    marginRight: space.sm,
    marginTop: 1,
  },
  contentCol: {
    flex: 1,
    minWidth: 0,
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  dismissBtn: {
    minWidth: size.touch,
    minHeight: size.touch,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: space.xs,
  },
});
