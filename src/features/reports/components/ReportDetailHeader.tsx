import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { shareReport } from "@/services/share-report";
import type { Report } from "@/services/types";

export interface ReportDetailHeaderProps {
  report: Pick<Report, "id" | "folio" | "ubication">;
  categoryLabel: string;
}

export function ReportDetailHeader({
  report,
  categoryLabel,
}: ReportDetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const handleShare = () => shareReport(report, categoryLabel);

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Atrás"
        hitSlop={12}
        style={styles.navBtn}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>

      <Text style={[styles.folioTitle, { color: colors.text }]}>
        #{report.folio}
      </Text>

      <Pressable
        onPress={() => {
          void handleShare();
        }}
        accessibilityRole="button"
        accessibilityLabel="Compartir reporte"
        hitSlop={12}
        style={styles.navBtn}
      >
        <Ionicons name="share-social-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.sm,
    paddingBottom: space.xs,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  folioTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
});

