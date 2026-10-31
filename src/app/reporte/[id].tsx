import React, { useRef, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/ErrorBanner";
import { ReportPhotos } from "@/features/reports/components/ReportPhotos";
import { ReportDetailHeader } from "@/features/reports/components/ReportDetailHeader";
import { ReportLocationSection } from "@/features/reports/components/ReportLocationSection";
import { ReportEditButton } from "@/features/reports/components/ReportEditButton";
import { useBackendReport } from "@/hooks/useBackendReports";
import { useAuthSession, useCacheValue } from "@/hooks/useReportState";
import { SetReportLike, likePendingKey } from "@/services/report-interactions";
import { ApiError } from "@/services/api";
import { ReportComments } from "@/features/reports/components/ReportComments";
import { reportDate } from "@/services/report-format";
import { StatusChip } from "@/features/reports/components/StatusChip";
import { categoryDefFor } from "@/constants/report-categories";
import { radius, space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ReporteDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useAppTheme();
  const { id, comments } = useLocalSearchParams<{ id: string; comments?: string }>();
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const commentsOffset = useRef(0);
  const didAutoScroll = useRef(false);

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

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ReportDetailHeader report={report} categoryLabel={categoryDef.label} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        onContentSizeChange={() => {
          if (comments === "1" && commentsOffset.current > 0 && !didAutoScroll.current) {
            didAutoScroll.current = true;
            scrollViewRef.current?.scrollTo({
              y: commentsOffset.current,
              animated: true,
            });
          }
        }}
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
            {report.description?.trim() || "No hay descripción."}
          </Text>

          <ReportEditButton report={report} />

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

          <ReportLocationSection report={report} />
          <View
            onLayout={(event) => {
              commentsOffset.current = event.nativeEvent.layout.y;
              if (comments === "1" && !didAutoScroll.current) {
                didAutoScroll.current = true;
                scrollViewRef.current?.scrollTo({
                  y: event.nativeEvent.layout.y,
                  animated: true,
                });
              }
            }}
          >
            <ReportComments key={report.id} reportId={report.id} />
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
});
