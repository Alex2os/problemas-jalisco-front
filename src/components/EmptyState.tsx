import React from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { useAppTheme } from "@/hooks/useAppTheme";
import { space } from "@/constants/design";
import { Button } from "./Button";

export type EmptyStateIcon =
  | React.ComponentProps<typeof Ionicons>["name"]
  | React.ComponentProps<typeof Feather>["name"];

export interface EmptyStateProps {
  icon?: EmptyStateIcon;
  iconFamily?: "ionicons" | "feather";
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = "folder-open-outline",
  iconFamily = "ionicons",
  title,
  description,
  actionTitle,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors, dark } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: dark ? "#1E2B3A" : "#FFF7ED" },
        ]}
      >
        {iconFamily === "feather" ? (
          <Feather
            name={icon as React.ComponentProps<typeof Feather>["name"]}
            size={40}
            color={colors.accent}
          />
        ) : (
          <Ionicons
            name={icon as React.ComponentProps<typeof Ionicons>["name"]}
            size={48}
            color={colors.accent}
          />
        )}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        {description}
      </Text>

      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          variant="primary"
          size="md"
          onPress={onAction}
          style={styles.actionBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: space.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: space.xs,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
    marginBottom: space.lg,
  },
  actionBtn: {
    minWidth: 200,
  },
});
