import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CategoryIcon } from "@/features/reports/components/CategoryIcon";
import { StatusChip } from "@/features/reports/components/StatusChip";
import { radius, size, space } from "@/constants/design";
import { categoryDefFor } from "@/constants/report-categories";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getReportDisplayTitle, reportShortDate } from "@/services/report-format";
import type { Report } from "@/services/types";

export interface ProfileReportItemProps {
  report: Report;
  onPress: (report: Report) => void;
}

export function ProfileReportItem({ report, onPress }: ProfileReportItemProps) {
  const { colors, dark } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const categoryDef = categoryDefFor(report.category || report.type);
  const title = getReportDisplayTitle(report);
  const date = reportShortDate(report.created_at);
  const photoUrl = report.photos?.[0]?.url ?? null;
  const supports =
    report.like_count === 1 ? "1 apoyo" : `${report.like_count} apoyos`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${categoryDef.label}. ${report.status}. ${supports}`}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(report);
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.pressable, { backgroundColor: pressed ? colors.raised : "transparent" }]}
    >
      <View style={styles.row}>
      <View style={[styles.thumb, { backgroundColor: colors.raised }]}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View
            style={[
              styles.image,
              styles.center,
              { backgroundColor: dark ? colors.raised : categoryDef.bgLight },
            ]}
          >
            <CategoryIcon category={categoryDef} size={32} color={categoryDef.color} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.topLine}>
          <Text style={[styles.category, { color: categoryDef.color }]} numberOfLines={1}>
            {categoryDef.shortLabel}
          </Text>
          {!!date && (
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
              {date}
            </Text>
          )}
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.bottom}>
          <StatusChip status={report.status} size="sm" neutral />
          <View style={styles.support}>
            <Ionicons
              name={report.liked_by_me ? "hand-right" : "hand-right-outline"}
              size={13}
              color={colors.textSecondary}
            />
            <Text style={[styles.supportText, { color: colors.textSecondary }]}>
              {supports}
            </Text>
          </View>
        </View>
      </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: "100%", borderRadius: radius.md },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.sm,
    minHeight: size.touch,
  },
  thumb: {
    width: 92,
    height: 92,
    flexShrink: 0,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  image: { width: "100%", height: "100%" },
  center: { alignItems: "center", justifyContent: "center" },
  info: { flex: 1, minWidth: 0, gap: space.xs, justifyContent: "center" },
  meta: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
  category: { flexShrink: 1, fontSize: 12, lineHeight: 16, fontWeight: "700" },
  title: { fontSize: 15, lineHeight: 20, fontWeight: "700" },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  support: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 },
  supportText: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
});
