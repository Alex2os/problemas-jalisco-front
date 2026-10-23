import { useCallback, useEffect, useRef, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useReducedMotion } from "react-native-reanimated";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import {
  Screen,
  TopBar,
  AppText,
  Field,
  Button,
  Notice,
  IconButton,
  Divider,
  EmptyState,
  ui,
} from "@/components/app/ui";
import { ReportPhotos } from "@/components/app/report-photos";
import { ReportStatusPanel } from "@/components/app/report-status";
import { ReportInteractions } from "@/components/app/report-interactions";
import { reportDate } from "@/components/app/report-row";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  useAuthSession,
  useCacheValue,
  useLiveReport,
} from "@/hooks/use-report-state";
import { categoryFor } from "@/constants/report-categories";
import { space } from "@/constants/design";
import { sessionVersion } from "@/services/session";
import { ApiError } from "@/services/api";
import { GetReportById } from "@/services/GetReportById";
import { GetCommentsPage } from "@/services/GetCommentsByReportId";
import { CreateComment } from "@/services/CreateNewComment";
import { DeleteComment } from "@/services/ReportInteractions";
import type { Report, ReportComment } from "@/services/types";

export default function ReportDetails() {
  const { report_id, comments } = useLocalSearchParams<{
    report_id: string;
    comments?: string;
  }>();
  return (
    <ReportContent
      key={report_id}
      id={Number(report_id)}
      openComments={comments === "1"}
    />
  );
}

function mergeComments(current: ReportComment[], incoming: ReportComment[]) {
  const comments = new Map(current.map((comment) => [comment.id, comment]));
  for (const comment of incoming) comments.set(comment.id, comment);
  return [...comments.values()].sort((a, b) => a.id - b.id);
}

function ReportContent({
  id,
  openComments,
}: {
  id: number;
  openComments: boolean;
}) {
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const authenticated = useAuthSession();
  const sessionError = useCacheValue<string>("session:error") || "";
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [report, setReport] = useState<Report>();
  const live = useLiveReport(report);
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [nextAfterId, setNextAfterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [success, setSuccess] = useState("");
  const [userComment, setUserComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const operation = useRef(false);
  const requestId = useRef(0);
  const list = useRef<FlatList<ReportComment>>(null);
  const commentOffset = useRef(0);
  const didScroll = useRef(false);

  const load = useCallback(
    (refresh = false) => {
      const request = ++requestId.current;
      const valid = Number.isSafeInteger(id) && id > 0;
      return Promise.allSettled([
        valid
          ? GetReportById(id, refresh)
          : Promise.reject(new Error("El reporte no es válido.")),
        valid
          ? GetCommentsPage(id, refresh)
          : Promise.reject(new Error("El reporte no es válido.")),
      ]).then(([reportResult, commentResult]) => {
        if (request !== requestId.current) return;
        if (reportResult.status === "fulfilled") setReport(reportResult.value);
        else if (
          reportResult.reason instanceof ApiError &&
          reportResult.reason.status === 404
        )
          setReport(undefined);
        if (commentResult.status === "fulfilled") {
          setComments(commentResult.value.comments);
          setNextAfterId(commentResult.value.next_after_id);
        }
        const failure = [reportResult, commentResult].find(
          (result) => result.status === "rejected",
        );
        setError(
          failure?.status === "rejected"
            ? failure.reason instanceof Error
              ? failure.reason.message
              : "No se pudo cargar la información."
            : "",
        );
        setLoading(false);
        setRefreshing(false);
      });
    },
    [id],
  );
  useFocusEffect(
    useCallback(() => {
      if (!authenticated)
        setComments((current) =>
          current.map((comment) => ({ ...comment, can_delete: false })),
        );
      void load();
      return () => {
        requestId.current++;
      };
      // Identity changes invalidate personalized caches before the focused page reads again.
    }, [load, authenticated]),
  );

  function refresh() {
    if (operation.current || refreshing || loadingMore) return;
    setRefreshing(true);
    setCommentError("");
    setSuccess("");
    void load(true);
  }
  async function loadMore() {
    if (!nextAfterId || operation.current || loadingMore || refreshing) return;
    operation.current = true;
    setLoadingMore(true);
    setCommentError("");
    const request = requestId.current;
    try {
      const page = await GetCommentsPage(id, false, nextAfterId);
      if (request !== requestId.current) return;
      setComments((current) => mergeComments(current, page.comments));
      setNextAfterId(page.next_after_id);
    } catch (error) {
      if (request === requestId.current)
        setCommentError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar más comentarios.",
        );
    } finally {
      operation.current = false;
      if (mounted.current) setLoadingMore(false);
    }
  }
  async function postComment() {
    if (operation.current || refreshing || !userComment.trim()) return;
    operation.current = true;
    setSubmitting(true);
    setCommentError("");
    setSuccess("");
    const identity = sessionVersion();
    try {
      const result = await CreateComment(userComment, id);
      if (!mounted.current || identity !== sessionVersion()) return;
      setComments((current) => mergeComments(current, [result.comment]));
      setUserComment("");
      setSuccess("Comentario publicado.");
    } catch (error) {
      if (mounted.current && identity === sessionVersion())
        setCommentError(
          error instanceof Error
            ? error.message
            : "No se pudo publicar el comentario.",
        );
    } finally {
      operation.current = false;
      if (mounted.current) setSubmitting(false);
    }
  }
  async function removeComment(commentId: number) {
    if (!mounted.current || operation.current || refreshing) return;
    operation.current = true;
    setDeletingId(commentId);
    setCommentError("");
    setSuccess("");
    const identity = sessionVersion();
    try {
      await DeleteComment(id, commentId);
      if (!mounted.current || identity !== sessionVersion()) return;
      setComments((current) =>
        current.filter((comment) => comment.id !== commentId),
      );
      setSuccess("Comentario eliminado.");
    } catch (error) {
      if (!mounted.current || identity !== sessionVersion()) return;
      if (error instanceof ApiError && error.status === 404) await load(true);
      if (!mounted.current || identity !== sessionVersion()) return;
      setCommentError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el comentario.",
      );
    } finally {
      operation.current = false;
      // A 404 reconciliation may have advanced the read request ID, but the page is still focused.
      if (mounted.current) setDeletingId(null);
    }
  }
  function confirmDelete(comment: ReportComment) {
    Alert.alert(
      "Eliminar comentario",
      "Esta acción eliminará tu comentario del reporte.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void removeComment(comment.id);
          },
        },
      ],
    );
  }
  function scrollToComments() {
    list.current?.scrollToOffset({
      offset: commentOffset.current,
      animated: !reducedMotion,
    });
  }
  const category = live ? categoryFor(live.type) : undefined;
  const busy = submitting || deletingId !== null || loadingMore;
  return (
    <Screen
      bottom
      scroll={false}
      header={
        <TopBar
          title="Reporte"
          back
          trailing={
            <IconButton
              icon="refresh-cw"
              label="Actualizar reporte"
              loading={refreshing}
              disabled={loading || busy}
              onPress={refresh}
            />
          }
        />
      }
    >
      <FlatList
        ref={list}
        data={live ? comments : []}
        keyExtractor={(comment) => String(comment.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[ui.content, { gap: 0 }]}
        onContentSizeChange={() => {
          if (
            openComments &&
            !loading &&
            commentOffset.current > 0 &&
            !didScroll.current
          ) {
            didScroll.current = true;
            list.current?.scrollToOffset({
              offset: commentOffset.current,
              animated: false,
            });
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            enabled={!busy}
            onRefresh={refresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: space.xl }}>
            {loading ? (
              <View style={{ paddingVertical: space.section, gap: space.lg }}>
                <ActivityIndicator color={colors.accent} />
                <AppText tone="muted" style={{ textAlign: "center" }}>
                  Cargando reporte…
                </AppText>
              </View>
            ) : live && category ? (
              <>
                <View style={{ gap: space.md }}>
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
                    <AppText tone="muted" variant="caption">
                      Reporte #{live.id}
                    </AppText>
                  </View>
                  <AppText variant="title" accessibilityRole="header">
                    {category.label}
                  </AppText>
                  <AppText>
                    {live.ubication || "Ubicación señalada en el mapa"}
                  </AppText>
                  <AppText tone="muted" variant="caption">
                    {reportDate(live.created_at)} ·{" "}
                    {live.username || "Comunidad"}
                  </AppText>
                </View>
                <Divider />
                <AppText style={{ lineHeight: 27 }}>
                  {live.description || "Sin descripción adicional."}
                </AppText>
                <ReportStatusPanel report={live} />
                <ReportPhotos report={live} />
                <ReportInteractions
                  report={live}
                  onCommentsPress={scrollToComments}
                />
                <Notice message={error} />
                <Divider />
                <View
                  onLayout={(event) => {
                    commentOffset.current = event.nativeEvent.layout.y;
                  }}
                  style={{
                    flexDirection: "row",
                    gap: space.sm,
                    alignItems: "center",
                    paddingBottom: space.sm,
                  }}
                >
                  <AppText variant="heading">Comentarios</AppText>
                  <AppText tone="muted" variant="caption">
                    {live.comment_count}
                  </AppText>
                </View>
              </>
            ) : (
              <>
                <EmptyState
                  icon="alert-circle"
                  title="No se pudo abrir el reporte"
                  description={error || "Vuelve a intentarlo en un momento."}
                />
                <Button label="Reintentar" onPress={refresh} />
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingVertical: space.lg, gap: space.sm }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.md,
              }}
            >
              <View style={{ flex: 1, gap: space.xs }}>
                <AppText variant="label">
                  {item.username || "Comunidad"}
                </AppText>
                <AppText tone="muted" variant="caption">
                  {reportDate(item.created_at)}
                </AppText>
              </View>
              {authenticated && item.can_delete && (
                <IconButton
                  icon="trash-2"
                  label="Eliminar tu comentario"
                  loading={deletingId === item.id}
                  disabled={busy || refreshing}
                  onPress={() => confirmDelete(item)}
                />
              )}
            </View>
            <AppText>{item.user_comment}</AppText>
          </View>
        )}
        ItemSeparatorComponent={Divider}
        ListFooterComponent={
          !loading && live ? (
            <View style={{ gap: space.lg, paddingTop: space.lg }}>
              {!comments.length && !error && (
                <AppText tone="muted">
                  Aún no hay comentarios. Puedes aportar el primero.
                </AppText>
              )}
              {nextAfterId !== null && (
                <Button
                  secondary
                  label="Ver más comentarios"
                  loading={loadingMore}
                  disabled={busy || refreshing}
                  onPress={loadMore}
                />
              )}
              <Notice message={sessionError || commentError} />
              <Notice message={success} success />
              <Divider />
              {authenticated ? (
                <>
                  <Field
                    label="Añadir un comentario"
                    maxLength={100}
                    placeholder="Comparte información sobre este reporte"
                    value={userComment}
                    onChangeText={setUserComment}
                    editable={!busy && !refreshing}
                    multiline
                    style={{ minHeight: 88, textAlignVertical: "top" }}
                  />
                  <AppText tone="muted" variant="caption">
                    {userComment.length}/100
                  </AppText>
                  <Button
                    label="Publicar comentario"
                    loading={submitting}
                    loadingLabel="Publicando…"
                    disabled={!userComment.trim() || busy || refreshing}
                    onPress={postComment}
                  />
                </>
              ) : (
                <Button
                  secondary
                  label="Inicia sesión para comentar"
                  onPress={() => router.push("/auth/login")}
                />
              )}
            </View>
          ) : null
        }
      />
    </Screen>
  );
}
