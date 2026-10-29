import { space } from "@/src/constants/design";
import { categoryFor } from "@/src/constants/report-categories";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useLiveReport } from "@/src/hooks/use-report-state";
import type { Report } from "@/src/services/types";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ReportInteractions } from "./report-interactions";
import { ReportImage } from "./report-photos";
import { StatusIndicator } from "./report-status";
import { AppText } from "./ui";

import { reportDate } from "@/src/services/report-format";
export { reportDate } from "@/src/services/report-format";

export function ReportRow({ report: initial }: { report: Report }) {
  const report = useLiveReport(initial) || initial;
  const { colors } = useAppTheme();
  const category = categoryFor(report.type);
  return (
    <View style={{ paddingBottom: space.sm }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${category.label}. ${report.ubication || "Ver ubicación"}. Ver detalles`}
        onPress={() => router.push(`/reports/${report.id}`)}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: pressed ? colors.raised : "transparent" },
        ]}
      >
        <View style={{ gap: space.sm, flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: space.sm,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: category.color,
              }}
            />
            <AppText variant="label" style={{ flex: 1 }}>
              {category.label}
            </AppText>
          </View>
          <AppText numberOfLines={2}>
            {report.ubication || "Ubicación en el mapa"}
          </AppText>
          {!!report.description && (
            <AppText tone="muted" variant="caption" numberOfLines={2}>
              {report.description}
            </AppText>
          )}
          <StatusIndicator report={report} />
          <AppText tone="muted" variant="caption">
            {reportDate(report.created_at)}
          </AppText>
        </View>
        {!!report.photos?.[0] && (
          <ReportImage
            key={report.photos[0].url}
            url={report.photos[0].url}
            thumbnail
          />
        )}
        <Feather name="chevron-right" size={16} color={colors.muted} />
      </Pressable>
      <ReportInteractions report={report} />
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    minHeight: 100,
    paddingVertical: space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
  },
});
