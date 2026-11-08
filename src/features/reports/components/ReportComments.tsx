import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CharacterCount } from "@/components/CharacterCount";
import { UserAvatar } from "@/components/UserAvatar";
import { radius, size, space, type } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthSession, useCacheValue } from "@/hooks/useReportState";
import { GetCommentsByReportId } from "@/services/get-comments-by-report-id";
import { CreateComment } from "@/services/create-new-comment";
import { DeleteComment } from "@/services/report-interactions";
import { reportDate } from "@/services/report-format";
import { sessionVersion } from "@/services/session";
import type { ReportComment } from "@/services/types";

function merge(current: ReportComment[], incoming: ReportComment[]) {
  return [
    ...new Map(
      [...current, ...incoming].map((comment) => [comment.id, comment]),
    ).values(),
  ].sort((a, b) => a.id - b.id);
}

export function ReportComments({ reportId }: { reportId: number }) {
  const { colors } = useAppTheme();
  const authenticated = useAuthSession();
  const identity = useCacheValue<number>("session:version") || 0;
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [text, setText] = useState("");
  const [collapsedIds, setCollapsedIds] = useState<number[]>([]);
  const [composerFocused, setComposerFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const generation = useRef(0);
  const readPending = useRef<symbol | null>(null);
  const writePending = useRef<symbol | null>(null);
  const mutationRevision = useRef(0);
  const loadedIdentity = useRef<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pressedCommentId, setPressedCommentId] = useState<number | null>(null);

  const load = useCallback(
    async (background = false) => {
      if (readPending.current || writePending.current) return;
      const operation = Symbol();
      readPending.current = operation;
      const revision = mutationRevision.current;
      const request = generation.current;
      const version = sessionVersion();
      if (!background) setLoading(true);
      try {
        const updatedComments = await GetCommentsByReportId(reportId, true);
        if (
          request !== generation.current ||
          version !== sessionVersion() ||
          revision !== mutationRevision.current
        )
          return;
        setComments(updatedComments);
        setLoadError("");
        setLoaded(true);
        loadedIdentity.current = version;
      } catch (failure) {
        if (
          request === generation.current &&
          version === sessionVersion() &&
          revision === mutationRevision.current
        )
          setLoadError(
            failure instanceof Error
              ? failure.message
              : "No se pudieron cargar los comentarios.",
          );
      } finally {
        if (readPending.current === operation) readPending.current = null;
        if (request === generation.current) setLoading(false);
      }
    },
    [reportId],
  );

  useFocusEffect(
    useCallback(() => {
      if (identity !== sessionVersion()) return;
      readPending.current = null;
      writePending.current = null;
      setBusy(false);
      setDeletingId(null);
      const hasCurrentComments = loadedIdentity.current === identity;
      if (!hasCurrentComments) {
        setText("");
        setComments([]);
        setCollapsedIds([]);
        setLoaded(false);
        setError("");
        setLoadError("");
      }
      void load(hasCurrentComments);
      const refresh = () => {
        if (AppState.currentState === "active") void load(true);
      };
      const interval = setInterval(refresh, 15000);
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") void load(true);
      });
      return () => {
        generation.current++;
        clearInterval(interval);
        subscription.remove();
      };
    }, [load, identity]),
  );

  async function save(commentId?: number) {
    if (
      !authenticated ||
      writePending.current ||
      (commentId === undefined && !text.trim())
    )
      return;
    const operation = Symbol();
    writePending.current = operation;
    mutationRevision.current++;
    const request = generation.current;
    const version = sessionVersion();
    setBusy(true);
    setDeletingId(commentId ?? null);
    setError("");
    try {
      if (commentId === undefined) {
        const result = await CreateComment(text.trim(), reportId);
        if (request !== generation.current || version !== sessionVersion())
          return;
        setComments((current) => merge(current, [result.comment]));
        setText("");
      } else {
        await DeleteComment(reportId, commentId);
        if (request !== generation.current || version !== sessionVersion())
          return;
        setComments((current) =>
          current.filter((comment) => comment.id !== commentId),
        );
      }
    } catch (failure) {
      if (request === generation.current && version === sessionVersion())
        setError(
          failure instanceof Error
            ? failure.message
            : "No se pudo guardar el cambio. Intenta de nuevo.",
        );
    } finally {
      if (writePending.current === operation) writePending.current = null;
      if (request === generation.current) {
        setBusy(false);
        setDeletingId(null);
      }
    }
  }

  return (
    <View style={styles.section}>
      {authenticated ? (
        <View style={styles.composer}>
          <View style={styles.inputHeader}>
            <Text style={[styles.author, { color: colors.text, flex: 1 }]}>
              Escribe un comentario
            </Text>
            <CharacterCount count={text.length} limit={100} />
          </View>
          <TextInput
            accessibilityLabel="Escribe un comentario"
            placeholder="Agrega información sobre el problema"
            placeholderTextColor={colors.muted}
            onFocus={() => setComposerFocused(true)}
            onBlur={() => setComposerFocused(false)}
            value={text}
            onChangeText={setText}
            maxLength={100}
            multiline
            scrollEnabled={false}
            editable={!busy}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: composerFocused
                  ? colors.primary
                  : colors.borderStrong,
              },
            ]}
          />
          <View style={styles.publishRow}>
            <Button
              title="Publicar comentario"
              variant="primary"
              size="sm"
              style={styles.formButton}
              icon={
                <Ionicons
                  name="send-outline"
                  size={18}
                  color={
                    !text.trim() || loading || busy
                      ? colors.muted
                      : colors.onPrimary
                  }
                />
              }
              loading={busy && deletingId === null}
              disabled={!text.trim() || loading || busy}
              onPress={() => {
                void save();
              }}
            />
          </View>
        </View>
      ) : (
        <Button
          title="Inicia sesión para comentar"
          variant="outline"
          fullWidth
          style={styles.formButton}
          onPress={() =>
            router.push({
              pathname: "/auth/login",
              params: { returnTo: `/reporte/${reportId}` },
            })
          }
        />
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <View
        style={[styles.commentsHeader, { borderBottomColor: colors.border }]}
      >
        <Text
          accessibilityRole="header"
          style={[styles.heading, { color: colors.text }]}
        >
          Comentarios
        </Text>
        {loaded && (
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {comments.length}
          </Text>
        )}
      </View>
      {comments.map((comment) => {
        const collapsed = collapsedIds.includes(comment.id);
        const toggleCollapsed = () =>
          setCollapsedIds((ids) =>
            collapsed
              ? ids.filter((id) => id !== comment.id)
              : [...ids, comment.id],
          );
        return (
          <View
            key={comment.id}
            style={[styles.comment, { borderBottomColor: colors.border }]}
          >
            <View style={styles.commentHeader}>
              <UserAvatar size={28} tone="soft" />
              <View style={styles.commentMeta}>
                <Text style={[styles.author, { color: colors.text }]}>
                  {comment.username || "Usuario"}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {reportDate(comment.created_at)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${collapsed ? "Expandir" : "Contraer"} comentario de ${comment.username || "Usuario"}`}
                accessibilityState={{ expanded: !collapsed }}
                onPressIn={() => setPressedCommentId(comment.id)}
                onPressOut={() => setPressedCommentId(null)}
                onPress={toggleCollapsed}
                style={[
                  styles.collapseControl,
                  {
                    backgroundColor:
                      pressedCommentId === comment.id
                        ? colors.raised
                        : colors.background,
                  },
                ]}
              >
                <Ionicons
                  name={collapsed ? "chevron-down" : "chevron-up"}
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
            <View style={styles.commentContent}>
              {collapsed ? (
                <Text style={[styles.date, { color: colors.muted }]}>
                  Comentario oculto
                </Text>
              ) : (
                <>
                  <Text style={[styles.body, { color: colors.textSecondary }]}>
                    {comment.user_comment}
                  </Text>
                  {authenticated && comment.can_delete && (
                    <View style={styles.commentOptions}>
                      <Button
                        title="Eliminar comentario"
                        variant="ghost"
                        size="sm"
                        icon={
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color={colors.danger}
                          />
                        }
                        disabled={loading || busy}
                        loading={busy && deletingId === comment.id}
                        style={styles.deleteButton}
                        textStyle={{ color: colors.danger }}
                        onPress={() =>
                          Alert.alert(
                            "Eliminar comentario",
                            "¿Quieres eliminar este comentario?",
                            [
                              { text: "Cancelar", style: "cancel" },
                              {
                                text: "Eliminar",
                                style: "destructive",
                                onPress: () => {
                                  void save(comment.id);
                                },
                              },
                            ],
                          )
                        }
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        );
      })}
      {loading && !loadError && (
        <ActivityIndicator
          color={colors.primary}
          accessibilityLabel="Cargando comentarios"
        />
      )}
      {loaded && !loading && !comments.length && !loadError && (
        <Text style={{ color: colors.muted }}>Aún no hay comentarios.</Text>
      )}
      {!!loadError && (
        <ErrorBanner
          message={loadError}
          retrying={loading}
          onRetry={() => {
            void load();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: space.md,
  },
  composer: { gap: space.sm },
  publishRow: { alignItems: "flex-end" },
  formButton: {
    height: "auto",
    minHeight: size.touch,
    paddingVertical: space.sm,
    maxWidth: "100%",
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingTop: space.md,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heading: { ...type.heading },
  comment: {
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: space.sm },
  commentMeta: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: space.sm,
    rowGap: space.xs,
  },
  collapseControl: {
    width: size.touch,
    minHeight: size.touch,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    padding: space.sm,
  },
  commentContent: { paddingLeft: space.section, gap: space.xs },
  commentOptions: { alignSelf: "flex-start", maxWidth: "100%" },
  deleteButton: {
    height: "auto",
    minHeight: size.touch,
    paddingVertical: space.sm,
  },
  author: { ...type.caption, fontWeight: "700" },
  inputHeader: { flexDirection: "row", alignItems: "center", gap: space.sm },
  date: { ...type.caption },
  body: { ...type.body, paddingVertical: space.xs },
  input: {
    ...type.body,
    minHeight: 72,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: space.md,
    textAlignVertical: "top",
  },
});
