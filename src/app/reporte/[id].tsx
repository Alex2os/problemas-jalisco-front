import { CategoryIcon } from "@/features/reports/components/CategoryIcon";
import React, { useCallback, useRef, useState, type ComponentRef } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/ErrorBanner";
import { ReportPhotos } from "@/features/reports/components/ReportPhotos";
import { ReportDetailHeader } from "@/features/reports/components/ReportDetailHeader";
import { ReportLocationSection } from "@/features/reports/components/ReportLocationSection";
import { ReportCommentsPreview } from "@/features/reports/components/ReportCommentsPreview";
import { ReportCommentsSheet } from "@/features/reports/components/ReportCommentsSheet";
import { useBackendReport } from "@/hooks/useBackendReports";
import { useAuthSession, useCacheValue } from "@/hooks/useReportState";
import {
  SetReportLike,
  DeleteComment,
  likePendingKey,
} from "@/services/report-interactions";
import { shareReport } from "@/services/share-report";
import { ApiError } from "@/services/api";
import { GetCommentsByReportId } from "@/services/get-comments-by-report-id";
import { CreateComment } from "@/services/create-new-comment";
import { sessionVersion } from "@/services/session";
import type { ReportComment } from "@/services/types";
import {
  reportDate,
  getReportDisplayTitle,
  getReportLocationSummary,
} from "@/services/report-format";
import { StatusChip } from "@/features/reports/components/StatusChip";
import { categoryDefFor } from "@/constants/report-categories";
import { palette } from "@/constants/palette";
import { radius, space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ReporteDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useAppTheme();
  const [locationExpanded, setLocationExpanded] = useState(false);
  const [locationPressed, setLocationPressed] = useState(false);
  const [sharePressed, setSharePressed] = useState(false);
  const { id, comments } = useLocalSearchParams<{
    id: string;
    comments?: string;
  }>();
  const [commentsSheetVisible, setCommentsSheetVisible] = useState(
    () => comments === "1",
  );
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const { report, loading, error, retry } = useBackendReport(id || "");
  const authenticated = useAuthSession();
  const identity = useCacheValue<number>("session:version") || 0;
  const likePending =
    useCacheValue<boolean>(likePendingKey(Number(id))) === true;

  // Manejo de comentarios
  const [commentsList, setCommentsList] = useState<ReportComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const commentGeneration = useRef(0);
  const commentReadPending = useRef<symbol | null>(null);
  const commentWritePending = useRef<symbol | null>(null);

  const loadComments = useCallback(
    async (background = false) => {
      const reportNum = Number(id);
      if (!reportNum || commentReadPending.current || commentWritePending.current) return;
      const op = Symbol();
      commentReadPending.current = op;
      const gen = commentGeneration.current;
      const ver = sessionVersion();
      if (!background) setCommentsLoading(true);
      try {
        const fetched = await GetCommentsByReportId(reportNum, true);
        if (gen !== commentGeneration.current || ver !== sessionVersion()) return;
        setCommentsList(fetched);
        setCommentsError("");
      } catch (err) {
        if (gen === commentGeneration.current && ver === sessionVersion()) {
          setCommentsError(
            err instanceof Error ? err.message : "Error al cargar comentarios",
          );
        }
      } finally {
        if (commentReadPending.current === op) commentReadPending.current = null;
        if (gen === commentGeneration.current) setCommentsLoading(false);
      }
    },
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      if (identity !== sessionVersion()) return;
      commentReadPending.current = null;
      commentWritePending.current = null;
      void loadComments();
      const interval = setInterval(() => void loadComments(true), 15000);
      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active") void loadComments(true);
      });
      return () => {
        commentGeneration.current++;
        clearInterval(interval);
        sub.remove();
      };
    }, [loadComments, identity]),
  );

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
  const liked = !!report.liked_by_me;
  const supportedBg = dark ? palette.dark.text : palette.dark.background;
  const supportedFg = dark ? palette.dark.background : palette.dark.text;
  const cardColors = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  };

  const handleMenuPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!authenticated || !report.can_manage) {
      void shareReport(report, categoryDef.label);
      return;
    }

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "Editar reporte", "Compartir reporte"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            router.push({
              pathname: "/reporte/editar/[id]",
              params: { id: String(report.id) },
            });
          } else if (buttonIndex === 2) {
            void shareReport(report, categoryDef.label);
          }
        },
      );
    } else {
      Alert.alert("Opciones del reporte", undefined, [
        {
          text: "Editar reporte",
          onPress: () => {
            router.push({
              pathname: "/reporte/editar/[id]",
              params: { id: String(report.id) },
            });
          },
        },
        {
          text: "Compartir",
          onPress: () => {
            void shareReport(report, categoryDef.label);
          },
        },
        { text: "Cancelar", style: "cancel" },
      ]);
    }
  };

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

  const handlePostComment = async (commentText: string) => {
    const op = Symbol();
    commentWritePending.current = op;
    const gen = commentGeneration.current;
    const ver = sessionVersion();
    try {
      const res = await CreateComment(commentText, report.id);
      if (gen !== commentGeneration.current || ver !== sessionVersion()) return;
      setCommentsList((curr) => [...curr, res.comment]);
    } finally {
      if (commentWritePending.current === op) commentWritePending.current = null;
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const op = Symbol();
    commentWritePending.current = op;
    const gen = commentGeneration.current;
    const ver = sessionVersion();
    try {
      await DeleteComment(report.id, commentId);
      if (gen !== commentGeneration.current || ver !== sessionVersion()) return;
      setCommentsList((curr) => curr.filter((c) => c.id !== commentId));
    } finally {
      if (commentWritePending.current === op) commentWritePending.current = null;
    }
  };

  const openCommentsSheet = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCommentsSheetVisible(true);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Barra superior fija con flecha a la izquierda y menú 3 puntos a la derecha */}
      <ReportDetailHeader onMenuPress={handleMenuPress} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: space.sm,
            paddingBottom: insets.bottom + space.xxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {!!error && (
          <ErrorBanner message={error} retrying={loading} onRetry={retry} />
        )}

        {/* CONTENEDOR 1: Publicación principal */}
        <View style={[styles.card, cardColors]}>
          {/* Cabecera reorganizada: Izquierda: Categoría + Autor + Fecha. Derecha: StatusChip */}
          <View style={styles.headerRow}>
            <View style={styles.metaLeftGroup}>
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
                <CategoryIcon
                  category={categoryDef}
                  size={20}
                  color={categoryDef.color}
                />
              </View>

              <View style={styles.metaTextCol}>
                <Text
                  style={[styles.categoryTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {categoryDef.label}
                </Text>
                <Text
                  style={[styles.metaSubtext, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {report.username || "Usuario"}
                  {locationSummary ? ` · ${locationSummary}` : ""}
                  {report.created_at ? ` · ${reportDate(report.created_at)}` : ""}
                </Text>
              </View>
            </View>

            {/* Estado alineado en la parte superior derecha */}
            <View style={styles.statusWrap}>
              <StatusChip status={report.status} size="sm" />
            </View>
          </View>

          {/* Título destacado */}
          <Text
            accessibilityRole="header"
            style={[styles.reportTitle, { color: colors.text }]}
          >
            {getReportDisplayTitle(report)}
          </Text>

          {/* Descripción completa */}
          {!!report.description?.trim() && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {report.description.trim()}
            </Text>
          )}

          {/* Galería de fotografías (solo si existen fotos) */}
          {!!report.photos?.length && (
            <View style={styles.evidenceWrap}>
              <ReportPhotos report={report} hero />
            </View>
          )}

          {/* Fila de participación: apoyos y compartir */}
          <View style={styles.footerRow}>
            {/* Apoyos */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${report.like_count} apoyos. ${liked ? "Retirar mi confirmación" : "Yo también lo vi"}`}
              accessibilityState={{
                selected: liked,
                disabled: likePending,
                busy: likePending,
              }}
              disabled={likePending}
              onPress={handleUpvote}
              style={[
                styles.supportBadge,
                {
                  backgroundColor: liked ? supportedBg : colors.raised,
                  borderColor: "transparent",
                  opacity: likePending ? 0.6 : 1,
                },
              ]}
            >
              {likePending ? (
                <ActivityIndicator
                  size="small"
                  color={liked ? supportedFg : colors.textSecondary}
                />
              ) : (
                <Ionicons
                  name={liked ? "hand-right" : "hand-right-outline"}
                  size={14}
                  color={liked ? supportedFg : colors.textSecondary}
                />
              )}
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
            </Pressable>

            {/* Compartir alineado al extremo derecho */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartir reporte"
              onPress={() => void shareReport(report, categoryDef.label)}
              onPressIn={() => setSharePressed(true)}
              onPressOut={() => setSharePressed(false)}
              hitSlop={8}
              style={[
                styles.shareButton,
                { backgroundColor: sharePressed ? colors.surface : colors.raised },
              ]}
            >
              <Ionicons
                name="share-social-outline"
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* CONTENEDOR 2: Ubicación del problema */}
        <View style={[styles.card, cardColors]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: locationExpanded }}
            accessibilityLabel={
              locationExpanded
                ? "Ocultar ubicación"
                : "Ver ubicación del problema"
            }
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLocationExpanded((expanded) => !expanded);
            }}
            onPressIn={() => setLocationPressed(true)}
            onPressOut={() => setLocationPressed(false)}
            style={[
              styles.locationHeader,
              { backgroundColor: locationPressed ? colors.raised : "transparent" },
            ]}
          >
            <View style={styles.locationTitleRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.accentText}
              />
              <View style={styles.locationCopy}>
                <Text
                  accessibilityRole="header"
                  style={[styles.sectionHeading, { color: colors.text }]}
                >
                  {es.detail.locationTitle}
                </Text>
                {!!report.ubication?.trim() && (
                  <Text
                    style={[
                      styles.locationAddress,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={locationExpanded ? undefined : 2}
                  >
                    {report.ubication}
                  </Text>
                )}
              </View>
            </View>

            <Ionicons
              name={locationExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>

          {/* Mapa montado condicionalmente solo al expandir */}
          {locationExpanded && <ReportLocationSection report={report} />}
        </View>

        {/* CONTENEDOR 3: Vista previa de comentarios (estilo YouTube) */}
        <View style={[styles.card, cardColors]}>
          <ReportCommentsPreview
            comments={commentsList}
            commentCount={Math.max(report.comment_count, commentsList.length)}
            loading={commentsLoading}
            onOpenSheet={openCommentsSheet}
          />
        </View>
      </ScrollView>

      {/* PANEL INFERIOR (Bottom Sheet) de Comentarios */}
      <ReportCommentsSheet
        visible={commentsSheetVisible}
        onClose={() => setCommentsSheetVisible(false)}
        reportId={report.id}
        comments={commentsList}
        totalCount={Math.max(report.comment_count, commentsList.length)}
        loading={commentsLoading}
        onPostComment={handlePostComment}
        onDeleteComment={handleDeleteComment}
        error={commentsError}
      />
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
  content: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: space.lg,
    gap: space.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.sm,
  },
  metaLeftGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  categoryBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  metaTextCol: {
    flex: 1,
    gap: 2,
  },
  categoryTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  metaSubtext: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  statusWrap: {
    alignItems: "flex-end",
    paddingTop: 2,
  },
  reportTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "400",
  },
  evidenceWrap: {
    width: "100%",
    borderRadius: radius.md,
    overflow: "hidden",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: space.xs,
  },
  supportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  supportText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  shareButton: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    borderRadius: radius.control,
    marginHorizontal: -space.xs,
    paddingHorizontal: space.xs,
    paddingVertical: space.xs,
  },
  locationTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  locationCopy: {
    flex: 1,
    gap: 2,
  },
  sectionHeading: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  locationAddress: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
});
