import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusChip } from "@/src/components/StatusChip";
import { categoryDefFor } from "@/src/constants/report-categories";
import { radius, shadows, size, space } from "@/src/constants/design";
import { es } from "@/src/constants/es";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useReportsStore } from "@/src/store/useReportsStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ReporteDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const getReportById = useReportsStore((s) => s.getReportById);
  const toggleUpvote = useReportsStore((s) => s.toggleUpvote);

  const report = getReportById(id || "");

  if (!report) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Pressable onPress={() => router.back()} style={{ padding: space.md }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>
    );
  }

  const categoryDef = categoryDefFor(report.category || report.type);
  const photos =
    report.photos && report.photos.length > 0
      ? report.photos.map((p) => (typeof p === "string" ? p : (p as any).url))
      : [];

  const handleUpvote = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleUpvote(report.id);
  };

  const handleShare = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: `Reporte #${report.folio}`,
        message: `${categoryDef.label} en ${report.ubication}. Folio #${report.folio} en ProblemasJalisco.`,
      });
    } catch {
      // Ignored
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Header */}
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
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Compartir reporte"
          hitSlop={12}
          style={styles.navBtn}
        >
          <Ionicons name="share-social-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Carousel / Single Photo */}
        {photos.length > 0 ? (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: photos[0] }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View
            style={[
              styles.noPhotoBanner,
              { backgroundColor: dark ? "#1E2A38" : categoryDef.bgLight },
            ]}
          >
            <Ionicons
              name={categoryDef.ionicon as any}
              size={48}
              color={categoryDef.color}
            />
          </View>
        )}

        <View style={styles.body}>
          {/* Status Chip & Category Row */}
          <View style={styles.metaRow}>
            <StatusChip status={report.status} size="md" />

            <View style={styles.catBadge}>
              <View
                style={[styles.colorDot, { backgroundColor: categoryDef.color }]}
              />
              <Text style={[styles.catName, { color: colors.text }]}>
                {categoryDef.label}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text }]}>
            {report.description}
          </Text>

          {/* "Yo también lo vi" Upvote Card */}
          <View
            style={[
              styles.upvoteCard,
              {
                backgroundColor: report.liked_by_me
                  ? dark
                    ? "#2C1E14"
                    : "#FFF5ED"
                  : colors.surface,
                borderColor: report.liked_by_me ? colors.accent : colors.border,
              },
              shadows.sm as any,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.upvoteCountText, { color: colors.text }]}>
                {report.like_count} vecinos lo han confirmado
              </Text>
              <Text style={[styles.upvoteHint, { color: colors.muted }]}>
                {es.detail.upvoteHint}
              </Text>
            </View>

            <Pressable
              onPress={handleUpvote}
              accessibilityRole="button"
              accessibilityLabel="Confirmar problema"
              style={[
                styles.upvoteBtn,
                {
                  backgroundColor: report.liked_by_me
                    ? colors.accent
                    : colors.surface,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Ionicons
                name={report.liked_by_me ? "hand-right" : "hand-right-outline"}
                size={18}
                color={report.liked_by_me ? "#FFFFFF" : colors.accent}
              />
              <Text
                style={[
                  styles.upvoteBtnText,
                  { color: report.liked_by_me ? "#FFFFFF" : colors.accent },
                ]}
              >
                {report.liked_by_me ? es.detail.upvoted : es.detail.upvote}
              </Text>
            </Pressable>
          </View>

          {/* Location & Mini Map Section */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              shadows.sm as any,
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {es.detail.locationTitle}
            </Text>

            <View style={styles.locationTextRow}>
              <Ionicons name="location-sharp" size={16} color={colors.accent} />
              <Text style={[styles.locationText, { color: colors.text }]}>
                {report.ubication}
              </Text>
            </View>

            <View style={styles.miniMapWrapper}>
              <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: report.latitude,
                    longitude: report.longitude,
                  }}
                  pinColor={categoryDef.color}
                />
              </MapView>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  content: {
    paddingBottom: 40,
  },
  photoContainer: {
    width: SCREEN_WIDTH,
    height: 240,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  noPhotoBanner: {
    width: SCREEN_WIDTH,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: space.lg,
    gap: space.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  upvoteCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: space.md,
    borderRadius: radius.group,
    borderWidth: 1.5,
    gap: space.md,
  },
  upvoteCountText: {
    fontSize: 14,
    fontWeight: "800",
  },
  upvoteHint: {
    fontSize: 12,
    marginTop: 2,
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    borderRadius: radius.control,
    borderWidth: 1.5,
  },
  upvoteBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  sectionCard: {
    borderRadius: radius.group,
    borderWidth: 1,
    padding: space.md,
    gap: space.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  locationTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  miniMapWrapper: {
    height: 160,
    borderRadius: radius.md,
    overflow: "hidden",
    marginTop: space.xs,
  },
});
