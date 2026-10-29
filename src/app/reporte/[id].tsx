import React from "react";
import {
  ActivityIndicator,
  Alert,
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

import { ErrorBanner } from "@/src/components/ErrorBanner";
import { ReportPhotos } from "@/src/components/app/report-photos";
import { ReportStatusActions } from "@/src/components/ReportStatusActions";
import { useBackendReport } from "@/src/hooks/use-backend-reports";
import { useAuthSession, useCacheValue } from "@/src/hooks/use-report-state";
import { SetReportLike, likePendingKey } from "@/src/services/ReportInteractions";
import { ApiError } from "@/src/services/api";
import { ReportComments } from "@/src/components/ReportComments";
import { reportDate } from "@/src/services/report-format";
import { StatusChip } from "@/src/components/StatusChip";
import { categoryDefFor } from "@/src/constants/report-categories";
import { radius, shadows, space } from "@/src/constants/design";
import { es } from "@/src/constants/es";
import { useAppTheme } from "@/src/hooks/use-app-theme";

export default function ReporteDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { report, loading, error } = useBackendReport(id || "");
  const authenticated = useAuthSession();
  const likePending = useCacheValue<boolean>(likePendingKey(Number(id))) === true;

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
        {loading ? <ActivityIndicator color={colors.accent} /> : <ErrorBanner message={error || "No se encontró el reporte."} />}
      </View>
    );
  }

  const categoryDef = categoryDefFor(report.category || report.type);
  const handleUpvote = async () => {
    if (!authenticated) { router.push({ pathname: "/auth/login", params: { returnTo: `/reporte/${report.id}` } }); return; }
    if (likePending) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try { await SetReportLike(report.id, !report.liked_by_me); }
    catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) router.push({ pathname: "/auth/login", params: { returnTo: `/reporte/${report.id}` } });
      else Alert.alert("No se pudo guardar", failure instanceof Error ? failure.message : "Intenta de nuevo.");
    }
  };

  const handleShare = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: `Reporte #${report.folio}`,
        message: `${categoryDef.label} en ${report.ubication}. Reporte #${report.id} en ProblemasJalisco.`,
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        {!report.photos.length && (
          <View style={[styles.noPhotoBanner, { backgroundColor: dark ? colors.raised : categoryDef.bgLight }]}>
            <Ionicons
              name={categoryDef.ionicon}
              size={48}
              color={categoryDef.color}
              accessibilityLabel={categoryDef.label}
            />
          </View>
        )}
        <ReportPhotos report={report} hero />
        <View style={styles.body}>
          {!!error && <ErrorBanner message={error} />}
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

          <View style={styles.authorRow}>
            <View style={[styles.authorAvatar, { backgroundColor: colors.raised }]}>
              <Ionicons name="person-outline" size={20} color={colors.muted} />
            </View>
            <View style={{ flex: 1, gap: space.xs }}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                Reportado por: {report.username || "Usuario"}
              </Text>
              <Text style={[styles.authorLabel, { color: colors.muted }]}>
                {reportDate(report.created_at)}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text }]}>
            {report.description}
          </Text>

          <ReportStatusActions key={`${report.id}:${report.can_manage}`} report={report} />

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
              onPress={() => { void handleUpvote(); }}
              disabled={likePending}
              accessibilityState={{ disabled: likePending, busy: likePending }}
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
          <ReportComments key={report.id} reportId={report.id} />
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
  noPhotoBanner: {
    width: "100%",
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
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  authorLabel: { fontSize: 12 },
  authorName: { fontSize: 15, fontWeight: "700" },
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
