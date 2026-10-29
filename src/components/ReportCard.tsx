import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { radius, shadows, size, space } from "@/src/constants/design";
import { categoryDefFor } from "@/src/constants/report-categories";
import { StatusChip } from "./StatusChip";
import type { Report } from "@/src/services/types";

export interface ReportCardProps {
  report: Report;
  onPress: (report: Report) => void;
  style?: StyleProp<ViewStyle>;
}

export function ReportCard({ report, onPress, style }: ReportCardProps) {
  const { colors, dark } = useAppTheme();
  const categoryDef = categoryDefFor(report.category || report.type);

  const photoUrl =
    report.photos && report.photos.length > 0
      ? typeof report.photos[0] === "string"
        ? (report.photos[0] as string)
        : (report.photos[0] as any).url
      : null;

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(report);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${categoryDef.label}. ${report.ubication}. ${report.status}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        shadows.sm as any,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {/* Photo Thumbnail */}
        <View style={[styles.thumbnailWrap, { backgroundColor: colors.raised }]}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.iconPlaceholder,
                { backgroundColor: dark ? "#243242" : categoryDef.bgLight },
              ]}
            >
              <Ionicons
                name={categoryDef.ionicon as any}
                size={30}
                color={categoryDef.color}
              />
            </View>
          )}

          {report.photos && report.photos.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Ionicons name="images" size={10} color="#FFFFFF" />
              <Text style={styles.photoCountText}>{report.photos.length}</Text>
            </View>
          )}
        </View>

        {/* Content Details */}
        <View style={styles.infoCol}>
          {/* Top meta: Category pill + Date */}
          <View style={styles.metaRow}>
            <View style={styles.categoryPill}>
              <View
                style={[styles.colorDot, { backgroundColor: categoryDef.color }]}
              />
              <Text style={[styles.categoryName, { color: colors.text }]}>
                {categoryDef.shortLabel}
              </Text>
            </View>

            <Text style={[styles.dateText, { color: colors.muted }]}>
              {formatDate(report.created_at)}
            </Text>
          </View>

          {/* Location line with address & municipality */}
          <View style={styles.locationRow}>
            <Ionicons
              name="location-sharp"
              size={13}
              color={colors.accent}
              style={{ marginRight: 3 }}
            />
            <Text
              style={[styles.locationText, { color: colors.text }]}
              numberOfLines={1}
            >
              {report.ubication}
            </Text>
          </View>

          {/* Bottom row: Status chip + Upvote count ("Lo vi") */}
          <View style={styles.bottomRow}>
            <StatusChip status={report.status} size="sm" />

            <View style={styles.upvoteRow}>
              <Ionicons
                name={report.liked_by_me ? "hand-right" : "hand-right-outline"}
                size={13}
                color={report.liked_by_me ? colors.accent : colors.muted}
              />
              <Text
                style={[
                  styles.upvoteText,
                  { color: report.liked_by_me ? colors.accent : colors.muted },
                ]}
              >
                {report.like_count} apoyos
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.group,
    borderWidth: 1,
    padding: space.md,
    marginBottom: space.sm,
  },
  contentRow: {
    flexDirection: "row",
    gap: space.md,
  },
  thumbnailWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  iconPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCountBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  infoCol: {
    flex: 1,
    justifyContent: "space-between",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  upvoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  upvoteText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
