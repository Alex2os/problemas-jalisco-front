import { CategoryIcon } from "@/features/reports/components/CategoryIcon";
import React, { useEffect, useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useReducedMotion } from "react-native-reanimated";
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
import {
  reportDate,
  getReportDisplayTitle,
  getReportLocationSummary,
} from "@/services/report-format";
import { StatusChip } from "@/features/reports/components/StatusChip";
import { categoryDefFor } from "@/constants/report-categories";
import { radius, size, space, type } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ReporteDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [locationReportId, setLocationReportId] = useState<string | null>(null);
  const [supportPressed, setSupportPressed] = useState(false);
  const [commentsPressed, setCommentsPressed] = useState(false);
  const [locationPressed, setLocationPressed] = useState(false);
  const { id, comments } = useLocalSearchParams<{
    id: string;
    comments?: string;
  }>();
  const locationVisible = locationReportId === id;
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const commentsOffset = useRef(0);
  const didAutoScroll = useRef(false);

  const { report, loading, error, retry } = useBackendReport(id || "");
  const authenticated = useAuthSession();
  const likePending =
    useCacheValue<boolean>(likePendingKey(Number(id))) === true;

  useEffect(() => {
    didAutoScroll.current = false;
    commentsOffset.current = 0;
  }, [id]);

  if (!report) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ReportDetailHeader />
        <View style={styles.initialState}>
          {error ? (
            <ErrorBanner message={error} retrying={loading} onRetry={retry} />
          ) : loading ? (
            <ActivityIndicator
              color={colors.primary}
              accessibilityLabel="Cargando reporte"
            />
          ) : (
            <ErrorBanner message="No se encontró el reporte." onRetry={retry} />
          )}
        </View>
      </View>
    );
  }

  const categoryDef = categoryDefFor(report.category || report.type);
  const locationSummary = getReportLocationSummary(report);
  const handleUpvote = async () => {
    if (!authenticated) {
      router.push({
        pathname: "/auth/login",
        params: { returnTo: `/reporte/${report.id}` },
      });
      return;
    }
    if (likePending) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await SetReportLike(report.id, !report.liked_by_me);
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401)
        router.push({
          pathname: "/auth/login",
          params: { returnTo: `/reporte/${report.id}` },
        });
      else
        Alert.alert(
          "No se pudo guardar",
          failure instanceof Error ? failure.message : "Intenta de nuevo.",
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ReportDetailHeader report={report} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="never"
        onContentSizeChange={() => {
          if (
            comments === "1" &&
            commentsOffset.current > 0 &&
            !didAutoScroll.current
          ) {
            didAutoScroll.current = true;
            scrollViewRef.current?.scrollTo({
              y: commentsOffset.current,
              animated: !reducedMotion,
            });
          }
        }}
      >
        <View style={styles.postHeader}>
          {!!error && (
            <ErrorBanner message={error} retrying={loading} onRetry={retry} />
          )}
          <View style={styles.authorRow}>
            <View
              style={[styles.authorAvatar, { backgroundColor: colors.raised }]}
            >
              <CategoryIcon
                category={categoryDef}
                size={20}
                color={categoryDef.color}
              />
            </View>
            <View style={styles.authorInfo}>
              <Text style={[styles.category, { color: colors.text }]}>
                {categoryDef.label}
              </Text>
              {locationSummary && (
                <Text
                  style={[styles.metadata, { color: colors.textSecondary }]}
                >
                  {locationSummary}
                </Text>
              )}
              <Text style={[styles.metadata, { color: colors.textSecondary }]}>
                {report.username || "Usuario"} · {reportDate(report.created_at)}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <StatusChip
              status={report.status}
              size="md"
              style={{ alignSelf: "center" }}
            />
            <ReportEditButton report={report} compact />
          </View>
          <Text
            accessibilityRole="header"
            style={[styles.reportTitle, { color: colors.text }]}
          >
            {getReportDisplayTitle(report)}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {report.description?.trim() || "No hay descripción."}
          </Text>
        </View>
        {!!report.photos.length && (
          <View style={styles.evidence}>
            <ReportPhotos report={report} hero />
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${report.like_count} apoyos. ${report.liked_by_me ? "Retirar mi confirmación" : "Yo también lo vi"}`}
              accessibilityState={{
                selected: report.liked_by_me,
                disabled: likePending,
                busy: likePending,
              }}
              disabled={likePending}
              onPressIn={() => setSupportPressed(true)}
              onPressOut={() => setSupportPressed(false)}
              onPress={() => {
                void handleUpvote();
              }}
              style={[
                styles.action,
                {
                  backgroundColor: supportPressed
                    ? colors.raised
                    : report.liked_by_me
                      ? colors.secondarySoft
                      : colors.surface,
                },
              ]}
            >
              {likePending ? (
                <ActivityIndicator size="small" color={colors.secondaryText} />
              ) : (
                <Ionicons
                  name={
                    report.liked_by_me ? "hand-right" : "hand-right-outline"
                  }
                  size={18}
                  color={
                    report.liked_by_me
                      ? colors.secondaryText
                      : colors.textSecondary
                  }
                />
              )}
              <Text
                style={[
                  styles.actionLabel,
                  {
                    color: report.liked_by_me
                      ? colors.secondaryText
                      : colors.textSecondary,
                  },
                ]}
              >
                {report.like_count} apoyos
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver ${report.comment_count} comentarios`}
              onPressIn={() => setCommentsPressed(true)}
              onPressOut={() => setCommentsPressed(false)}
              onPress={() =>
                scrollViewRef.current?.scrollTo({
                  y: commentsOffset.current,
                  animated: !reducedMotion,
                })
              }
              style={[
                styles.action,
                {
                  backgroundColor: commentsPressed
                    ? colors.raised
                    : colors.surface,
                },
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.actionLabel, { color: colors.textSecondary }]}
              >
                {report.comment_count}{" "}
                {report.comment_count === 1 ? "comentario" : "comentarios"}
              </Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: locationVisible }}
            accessibilityLabel={
              locationVisible
                ? "Ocultar ubicación"
                : "Ver ubicación del reporte"
            }
            onPressIn={() => setLocationPressed(true)}
            onPressOut={() => setLocationPressed(false)}
            onPress={() =>
              setLocationReportId((current) => (current === id ? null : id))
            }
            style={[
              styles.locationLink,
              {
                backgroundColor: locationPressed
                  ? colors.raised
                  : colors.background,
              },
            ]}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.accentText}
            />
            <View style={styles.locationCopy}>
              <Text
                style={[styles.locationTitle, { color: colors.accentText }]}
              >
                {locationVisible ? "Ocultar ubicación" : "Ver ubicación"}
              </Text>
              {!!report.ubication?.trim() && (
                <Text
                  style={[
                    styles.locationLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  {report.ubication}
                </Text>
              )}
            </View>
            <Ionicons
              name={locationVisible ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.muted}
            />
          </Pressable>
          {locationVisible && <ReportLocationSection report={report} />}
        </View>
        <View
          onLayout={(event) => {
            commentsOffset.current = event.nativeEvent.layout.y;
            if (comments === "1" && !didAutoScroll.current) {
              didAutoScroll.current = true;
              scrollViewRef.current?.scrollTo({
                y: event.nativeEvent.layout.y,
                animated: !reducedMotion,
              });
            }
          }}
        >
          <ReportComments key={report.id} reportId={report.id} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  initialState: {
    padding: space.lg,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  evidence: { paddingHorizontal: space.lg },
  content: { width: "100%", maxWidth: 640, alignSelf: "center" },
  postHeader: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
    gap: space.md,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  authorInfo: { flex: 1, gap: space.xs },
  category: { ...type.label },
  metadata: { ...type.caption },
  reportTitle: { ...type.title },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  description: { ...type.body },
  body: { paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.xs },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.md,
  },
  action: {
    maxWidth: "100%",
    flexShrink: 1,
    minHeight: size.touch,
    minWidth: size.touch,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.full,
  },
  actionLabel: { ...type.caption, fontWeight: "600", flexShrink: 1 },
  locationLink: {
    minHeight: size.touch,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    padding: space.sm,
    borderRadius: radius.control,
  },
  locationCopy: { flex: 1, gap: space.xs },
  locationTitle: { ...type.label },
  locationLabel: { ...type.caption },
});
