import { CategoryIcon } from "@/features/reports/components/CategoryIcon";
import React, { useState } from "react";
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
import { palette } from "@/constants/palette";
import { shareReport } from "@/services/share-report";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radius, size, space } from "@/constants/design";
import { categoryDefFor } from "@/constants/report-categories";
import {
  getReportDisplayTitle,
  getReportLocationSummary,
  reportShortDate,
} from "@/services/report-format";
import type { Report } from "@/services/types";

export interface ReportFeedItemProps {
  report: Report;
  onPress: (report: Report) => void;
  recommendationNote?: string;
  style?: StyleProp<ViewStyle>;
}

export function ReportFeedItem({
  report,
  onPress,
  recommendationNote,
  style,
}: ReportFeedItemProps) {
  const { colors, dark } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  const categoryDef = categoryDefFor(report.category || report.type);
  const displayTitle = getReportDisplayTitle(report);
  const locationSummary = getReportLocationSummary(report);
  const dateLabel = reportShortDate(report.created_at);
  const photoUrl = report.photos?.[0]?.url ?? null;
  const photoCount = report.photos?.length ?? 0;

  const supportedBg = dark ? palette.dark.text : palette.dark.background;
  const supportedFg = dark ? palette.dark.background : palette.dark.text;
  const liked = !!report.liked_by_me;

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(report);
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`${displayTitle}. ${categoryDef.label}. ${locationSummary || "Ubicación disponible en el detalle"}. ${report.status}. ${report.like_count} apoyos`}
      style={[
        styles.post,
        {
          backgroundColor: pressed ? colors.raised : colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {!!recommendationNote && (
        <View style={styles.recommendationRow}>
          <Ionicons
            name="navigate-circle-outline"
            size={14}
            color={colors.accentText}
          />
          <Text
            style={[styles.recommendationText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {recommendationNote}
          </Text>
        </View>
      )}

      {/* 1. Compact Header + 2. Status Chip */}
      <View style={styles.headerRow}>
        <View style={styles.metaInfo}>
          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: dark
                  ? categoryDef.bgDark || colors.raised
                  : categoryDef.bgLight,
              },
            ]}
          >
            <CategoryIcon category={categoryDef}
              size={14}
              color={categoryDef.color}
            />
          </View>

          <Text
            style={[styles.metaText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            <Text style={[styles.categoryLabel, { color: colors.text }]}>
              {categoryDef.shortLabel}
            </Text>
            {locationSummary ? ` · ${locationSummary}` : ""}
            {dateLabel ? ` · ${dateLabel}` : ""}
          </Text>
        </View>

        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color={colors.textSecondary}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </View>

      {/* 3. Main Title */}
      <Text
        style={[styles.title, { color: colors.text }]}
        numberOfLines={3}
      >
        {displayTitle}
      </Text>

      {/* Optional snippet of citizen description when present and different from title */}
      {!!report.description?.trim() &&
        report.description.trim() !== displayTitle && (
          <Text
            style={[styles.descriptionPreview, { color: colors.textSecondary }]}
            numberOfLines={photoUrl ? 2 : 3}
          >
            {report.description.trim()}
          </Text>
        )}

      {/* 4. Evidence Photo (only rendered when report has photos) */}
      {!!photoUrl && (
        <View
          style={[
            styles.mediaContainer,
            { backgroundColor: colors.raised, borderColor: colors.border },
          ]}
        >
          <Image
            source={{ uri: photoUrl }}
            style={styles.mediaImage}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          {photoCount > 1 && (
            <View style={styles.photoCountBadge}>
              <Ionicons name="images-outline" size={12} color="#FFFFFF" />
              <Text style={styles.photoCountText}>1/{photoCount}</Text>
            </View>
          )}
        </View>
      )}

      {/* 5. Footer: Support + Comments */}
      <View style={styles.footerRow}>
        <View
          style={[
            styles.supportBadge,
            {
              backgroundColor: liked ? supportedBg : colors.raised,
              borderColor: "transparent",
            },
          ]}
        >
          <Ionicons
            name={report.liked_by_me ? "hand-right" : "hand-right-outline"}
            size={14}
            color={liked ? supportedFg : colors.textSecondary}
          />
          <Text
            style={[
              styles.supportText,
              { color: liked ? supportedFg : colors.textSecondary },
            ]}
          >
            {report.like_count === 1
              ? "1 apoyo"
              : `${report.like_count} apoyos`}
          </Text>
        </View>

        <View
          style={[
            styles.supportBadge,
            { backgroundColor: colors.raised, borderColor: "transparent" },
          ]}
          accessibilityLabel={
            typeof report.comment_count === "number"
              ? `${report.comment_count} comentarios`
              : "Comentarios"
          }
        >
          <Ionicons
            name="chatbubble-outline"
            size={14}
            color={colors.textSecondary}
          />
          {typeof report.comment_count === "number" && (
            <Text style={[styles.supportText, { color: colors.textSecondary }]}>
              {report.comment_count}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => void shareReport(report, categoryDef.label)}
          accessibilityRole="button"
          accessibilityLabel="Compartir reporte"
          hitSlop={8}
          style={[styles.shareButton, { backgroundColor: colors.raised }]}
        >
          <Ionicons name="share-social-outline" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  post: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: space.lg,
    gap: space.xs + 2,
    minHeight: size.touch,
  },
  recommendationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  metaInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  categoryBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  metaText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  categoryLabel: {
    fontWeight: "700",
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  descriptionPreview: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    position: "relative",
    marginTop: space.xs,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  photoCountBadge: {
    position: "absolute",
    bottom: space.sm,
    right: space.sm,
    backgroundColor: "rgba(13, 14, 16, 0.78)",
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: space.sm,
    marginTop: space.xs,
    paddingTop: space.xs,
  },
  shareButton: {
    marginLeft: "auto",
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  supportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  supportText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
});
