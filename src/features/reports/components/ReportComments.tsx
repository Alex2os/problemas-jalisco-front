import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "@/components/Button";
import { radius, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthSession, useCacheValue } from "@/hooks/useReportState";
import { GetCommentsByReportId } from "@/services/get-comments-by-report-id";
import { CreateComment } from "@/services/create-new-comment";
import { DeleteComment } from "@/services/report-interactions";
import { reportDate } from "@/services/report-format";
import { sessionVersion } from "@/services/session";
import type { ReportComment } from "@/services/types";

function merge(current: ReportComment[], incoming: ReportComment[]) {
  return [...new Map([...current, ...incoming].map((comment) => [comment.id, comment])).values()]
    .sort((a, b) => a.id - b.id);
}

export function ReportComments({ reportId }: { reportId: number }) {
  const { colors } = useAppTheme();
  const authenticated = useAuthSession();
  const identity = useCacheValue<number>("session:version") || 0;
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const generation = useRef(0);
  const readPending = useRef<symbol | null>(null);
  const writePending = useRef<symbol | null>(null);
  const mutationRevision = useRef(0);

  const load = useCallback(async (background = false) => {
    if (readPending.current || writePending.current) return;
    const operation = Symbol();
    readPending.current = operation;
    const revision = mutationRevision.current;
    const request = generation.current;
    const version = sessionVersion();
    if (!background) setLoading(true);
    try {
      const updatedComments = await GetCommentsByReportId(reportId, true);
      if (request !== generation.current || version !== sessionVersion() || revision !== mutationRevision.current) return;
      setComments(updatedComments);
      setLoadError("");
      setLoaded(true);
    } catch (failure) {
      if (request === generation.current && version === sessionVersion() && revision === mutationRevision.current)
        setLoadError(failure instanceof Error ? failure.message : "No se pudieron cargar los comentarios.");
    } finally {
      if (readPending.current === operation) readPending.current = null;
      if (request === generation.current) setLoading(false);
    }
  }, [reportId]);

  useFocusEffect(useCallback(() => {
    if (identity !== sessionVersion()) return;
    readPending.current = null;
    writePending.current = null;
    setBusy(false);
    if (!authenticated) setText("");
    setComments([]);
    setLoaded(false);
    void load();
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
  }, [load, authenticated, identity]));

  async function save(commentId?: number) {
    if (!authenticated || writePending.current || (commentId === undefined && !text.trim())) return;
    const operation = Symbol();
    writePending.current = operation;
    mutationRevision.current++;
    const request = generation.current;
    const version = sessionVersion();
    setBusy(true);
    setError("");
    try {
      if (commentId === undefined) {
        const result = await CreateComment(text.trim(), reportId);
        if (request !== generation.current || version !== sessionVersion()) return;
        setComments((current) => merge(current, [result.comment]));
        setText("");
      } else {
        await DeleteComment(reportId, commentId);
        if (request !== generation.current || version !== sessionVersion()) return;
        setComments((current) => current.filter((comment) => comment.id !== commentId));
      }
    } catch (failure) {
      if (request === generation.current && version === sessionVersion())
        setError(failure instanceof Error ? failure.message : "No se pudo guardar el cambio. Intenta de nuevo.");
    } finally {
      if (writePending.current === operation) writePending.current = null;
      if (request === generation.current) setBusy(false);
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>Comentarios</Text>
      {authenticated ? (
        <>
          <View style={styles.inputHeader}>
            <Text style={[styles.author, { color: colors.text, flex: 1 }]}>Escribe un comentario</Text>
            <Text accessibilityLabel={`${text.length} de 100 caracteres`} style={[styles.date, { color: colors.muted }]}>{text.length}/100</Text>
          </View>
          <TextInput
            accessibilityLabel="Escribe un comentario"
            placeholder="Agrega información sobre el problema"
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            maxLength={100}
            multiline
            editable={!busy}
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          />
          <Button title="Publicar comentario" variant="secondary"
            icon={<Ionicons name="send-outline" size={18} color={!text.trim() || loading || busy ? colors.muted : colors.onPrimary} />}
            loading={busy} disabled={!text.trim() || loading || busy}
            onPress={() => { void save(); }} fullWidth />
        </>
      ) : <Button title="Inicia sesión para comentar" variant="outline" fullWidth onPress={() => router.push({ pathname: "/auth/login", params: { returnTo: `/reporte/${reportId}` } })} />}
      {!!error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}
      {comments.map((comment) => (
        <View key={comment.id} style={[styles.comment, { borderBottomColor: colors.border }]}>
          <Text style={[styles.author, { color: colors.text }]}>{comment.username || "Usuario"}</Text>
          <Text style={[styles.date, { color: colors.muted }]}>{reportDate(comment.created_at)}</Text>
          <Text style={[styles.body, { color: colors.text }]}>{comment.user_comment}</Text>
          {authenticated && comment.can_delete && (
            <Button title="Eliminar comentario" variant="ghost" size="sm" disabled={loading || busy}
              onPress={() => Alert.alert("Eliminar comentario", "¿Quieres eliminar este comentario?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => { void save(comment.id); } },
              ])} />
          )}
        </View>
      ))}
      {loading && <ActivityIndicator color={colors.accent} accessibilityLabel="Cargando comentarios" />}
      {loaded && !loading && !comments.length && !loadError && <Text style={{ color: colors.muted }}>Aún no hay comentarios.</Text>}
      {!!loadError && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{loadError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.group, padding: space.md, gap: space.md },
  heading: { fontSize: 18, fontWeight: "700" },
  comment: { gap: space.xs, paddingVertical: space.sm, borderBottomWidth: 1 },
  author: { fontSize: 14, fontWeight: "700" },
  inputHeader: { flexDirection: "row", alignItems: "center", gap: space.sm },
  date: { fontSize: 12 },
  body: { fontSize: 15, lineHeight: 22, paddingVertical: space.xs },
  input: { minHeight: 96, borderWidth: 1, borderRadius: radius.control, padding: space.md, fontSize: 16, textAlignVertical: "top" },
});
