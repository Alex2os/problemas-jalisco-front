import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";

export interface RecommendationLocationNoticeProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function RecommendationLocationNotice({
  message,
  actionLabel,
  onAction,
}: RecommendationLocationNoticeProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>
      {!!actionLabel && !!onAction && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.action}
        >
          <Text style={[styles.actionText, { color: colors.primaryText }]}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: space.xs,
  },
  text: { fontSize: 13, lineHeight: 18, flexShrink: 1 },
  action: {
    minHeight: size.touch,
    justifyContent: "center",
    paddingHorizontal: space.xs,
  },
  actionText: { fontSize: 13, fontWeight: "700" },
});
