import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radius, space } from "@/constants/design";
import { normalizeReportStatus, reportStatusLabels } from "@/services/report-status";
import type { ReportStatus } from "@/services/types";

export interface StatusChipProps {
  status: ReportStatus;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
}

export function StatusChip({ status, size = "md", style }: StatusChipProps) {
  const { colors } = useAppTheme();

  const normalizedKey = normalizeReportStatus(status);
  const label = reportStatusLabels[normalizedKey];
  const iconName: React.ComponentProps<typeof Ionicons>["name"] =
    normalizedKey === "resuelto" ? "checkmark-circle-outline" : "document-text-outline";

  const themeStatus = colors.status[normalizedKey];
  const isSm = size === "sm";

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: themeStatus.bg,
          borderColor: themeStatus.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : space.sm,
        },
        style,
      ]}
    >
      <Ionicons
        name={iconName}
        size={isSm ? 12 : 14}
        color={themeStatus.text}
        style={{ marginRight: 3 }}
      />
      <Text
        style={[
          styles.text,
          {
            color: themeStatus.text,
            fontSize: isSm ? 11 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
  },
  text: {
    fontWeight: "700",
  },
});
