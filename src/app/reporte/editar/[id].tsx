import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams, usePreventRemove } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { PhotoPicker } from "@/features/reports/components/PhotoPicker";
import { ReportStepFooter } from "@/features/reports/components/ReportStepFooter";
import { StatusChip } from "@/features/reports/components/StatusChip";
import { radius, space } from "@/constants/design";
import { categoryDefFor } from "@/constants/report-categories";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useBackendReport } from "@/hooks/useBackendReports";
import { useAuthSession, useCacheValue } from "@/hooks/useReportState";
import { GetReportById } from "@/services/get-report-by-id";
import { ReportEditFailure, SaveReportEdits } from "@/services/report-editing";
import type { SelectedPhoto } from "@/services/report-media";
import { normalizeReportStatus, type SimpleReportStatus } from "@/services/report-status";
import { sessionVersion } from "@/services/session";
import type { Report } from "@/services/types";

function returnToReport(id: string) {
  if (router.canGoBack()) router.back();
  else router.replace({ pathname: "/reporte/[id]", params: { id } });
}
function EditorHeader({ id, disabled = false }: { id: string; disabled?: boolean }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  return <View style={[styles.header, { paddingTop: insets.top + space.xs, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
    <Pressable accessibilityRole="button" accessibilityLabel="Volver al reporte" disabled={disabled}
      accessibilityState={{ disabled }} onPress={() => returnToReport(id)} style={styles.navButton}>
      <Ionicons name="arrow-back" size={24} color={disabled ? colors.muted : colors.text} />
    </Pressable>
    <Text style={[styles.headerTitle, { color: colors.text }]}>Editar reporte</Text>
    <View style={styles.navButton} />
  </View>;
}

export default function EditReportScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const authenticated = useAuthSession();
  const identity = useCacheValue<number>("session:version") || 0;
  const { report, loading, error } = useBackendReport(id);
  if (authenticated && report?.can_manage) return <EditorContent key={`${report.id}:${identity}`} initialReport={report} />;
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <EditorHeader id={id} />
    <View style={styles.empty}>
      {loading && !report ? <ActivityIndicator color={colors.primary} /> : !authenticated ? (
        <EmptyState title="Inicia sesión para editar" description="Solo el autor puede modificar este reporte."
          actionTitle="Iniciar sesión" onAction={() => router.push({ pathname: "/auth/login", params: { returnTo: `/reporte/editar/${id}` } })} />
      ) : error && !report ? <ErrorBanner message={error} /> : (
        <EmptyState title="No puedes editar este reporte" description="Solo el autor puede cambiar sus fotos y su estado." />
      )}
    </View>
  </View>;
}

function EditorContent({ initialReport }: { initialReport: Report }) {
  const { colors } = useAppTheme();
  const [baseline, setBaseline] = useState(initialReport);
  const [status, setStatus] = useState<SimpleReportStatus>(normalizeReportStatus(initialReport.status));
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsReload, setNeedsReload] = useState(false);
  const [allowLeave, setAllowLeave] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const retained = baseline.photos.filter((photo) => !removed.includes(photo.id));
  const changedStatus = status !== normalizeReportStatus(baseline.status);
  const dirty = changedStatus || photos.length > 0 || removed.length > 0;
  const inactive = busy || picking || needsReload;
  const disablePrevention = usePreventRemove((dirty || busy || picking) && !allowLeave, ({ repeat }) => {
    if (pending.current || picking) return;
    Alert.alert("¿Descartar los cambios?", "Los cambios que no guardaste se perderán.", [
      { text: "Seguir editando", style: "cancel" },
      { text: "Descartar", style: "destructive", onPress: () => { setAllowLeave(true); repeat(); } },
    ]);
  });

  async function save() {
    if (pending.current || picking || !dirty || needsReload) return;
    pending.current = true;
    setBusy(true);
    setError("");
    const identity = sessionVersion();
    try {
      await SaveReportEdits({ report: baseline, photos, removedPhotoIds: removed, status: changedStatus ? status : undefined });
      if (!mounted.current || identity !== sessionVersion()) return;
      setAllowLeave(true);
      disablePrevention();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      returnToReport(String(baseline.id));
    } catch (failure) {
      if (!mounted.current || identity !== sessionVersion()) return;
      const reload = failure instanceof ReportEditFailure;
      setNeedsReload(reload);
      setError(`${failure instanceof Error ? failure.message : "No se pudieron guardar los cambios."}${reload ? " Revisa el reporte antes de guardar de nuevo; algunos cambios pueden haberse guardado." : ""}`);
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function reload() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    const identity = sessionVersion();
    try {
      const current = await GetReportById(baseline.id, true);
      if (!mounted.current || identity !== sessionVersion()) return;
      setBaseline(current);
      setStatus(normalizeReportStatus(current.status));
      setPhotos([]);
      setRemoved([]);
      setNeedsReload(false);
      setError("");
    } catch (failure) {
      if (mounted.current && identity === sessionVersion()) setError(failure instanceof Error ? failure.message : "No se pudo cargar el reporte.");
    } finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  const category = categoryDefFor(baseline.type);
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <EditorHeader id={String(baseline.id)} disabled={busy || picking} />
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.intro}>
        <Text style={[styles.title, { color: colors.text }]}>Actualiza tu reporte</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Cambia las fotos o el estado y guarda los cambios.</Text>
      </View>
      <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.summaryIcon, { backgroundColor: colors.accentSoft }]}><Ionicons name={category.ionicon} size={24} color={colors.accentText} /></View>
        <View style={{ flex: 1, gap: space.xs }}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>{category.label}</Text>
          <Text numberOfLines={2} style={[styles.caption, { color: colors.muted }]}>{baseline.ubication}</Text>
        </View>
        <StatusChip status={baseline.status} size="sm" />
      </View>
      {!!error && <ErrorBanner message={error} />}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Estado del reporte</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Indica si el problema sigue presente o ya se resolvió.</Text>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {([{ value: "reportado", label: "Reportado", icon: "document-text-outline" },
            { value: "resuelto", label: "Resuelto", icon: "checkmark-circle-outline" }] as const).map((option) => {
            const selected = status === option.value;
            const color = option.value === "resuelto" ? colors.success : colors.primaryText;
            return <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
              accessibilityState={{ checked: selected, disabled: inactive }} disabled={inactive} onPress={() => setStatus(option.value)}
              style={[styles.option, { borderColor: selected ? color : colors.border, backgroundColor: selected ? option.value === "resuelto" ? colors.successSoft : colors.primarySoft : colors.background, opacity: inactive ? 0.6 : 1 }]}>
              <Ionicons name={option.icon} size={20} color={selected ? color : colors.muted} />
              <Text style={[styles.optionText, { color: selected ? color : colors.text }]}>{option.label}</Text>
            </Pressable>;
          })}
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <PhotoPicker variant="evidence" photos={photos} onChange={setPhotos} existingPhotos={retained}
          onRemoveExisting={(id) => setRemoved((current) => [...current, id])}
          capacity={Math.max(0, 3 - retained.length)} disabled={inactive} onBusyChange={setPicking} />
        {!!removed.length && <View style={styles.removalNote}>
          <Text style={[styles.caption, { color: colors.muted, flex: 1 }]}>{removed.length === 1 ? "1 foto se eliminará al guardar." : `${removed.length} fotos se eliminarán al guardar.`}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Deshacer eliminación de fotos" disabled={inactive || baseline.photos.length + photos.length > 3}
            onPress={() => setRemoved([])} style={styles.undo}>
            <Text style={{ color: inactive || baseline.photos.length + photos.length > 3 ? colors.muted : colors.primaryText, fontWeight: "600" }}>Deshacer</Text>
          </Pressable>
        </View>}
      </View>
    </ScrollView>
    <ReportStepFooter title={busy ? needsReload ? "Cargando reporte…" : "Guardando cambios…" : needsReload ? "Revisar cambios guardados" : "Guardar cambios"}
      icon={needsReload ? "refresh-outline" : "checkmark-outline"} loading={busy} disabled={picking || (!dirty && !needsReload)}
      onPress={() => { if (needsReload) void reload(); else void save(); }} />
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.sm, paddingBottom: space.xs, borderBottomWidth: StyleSheet.hairlineWidth },
  navButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", textAlign: "center" },
  empty: { flex: 1, padding: space.lg, justifyContent: "center" },
  scroll: { flex: 1 },
  content: { padding: space.lg, gap: space.lg, width: "100%", maxWidth: 640, alignSelf: "center" },
  intro: { gap: space.sm },
  title: { fontSize: 25, lineHeight: 32, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 12, lineHeight: 18 },
  summary: { padding: space.md, borderRadius: radius.group, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: space.md },
  summaryIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  summaryTitle: { fontSize: 14, lineHeight: 20, fontWeight: "700" },
  card: { padding: space.lg, borderWidth: 1, borderRadius: radius.xl, gap: space.md },
  sectionTitle: { fontSize: 17, lineHeight: 23, fontWeight: "700" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  option: { flex: 1, minWidth: 112, minHeight: 56, padding: space.md, borderWidth: 1, borderRadius: radius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.sm },
  optionText: { fontSize: 14, fontWeight: "600", flexShrink: 1 },
  removalNote: { flexDirection: "row", alignItems: "center", gap: space.sm },
  undo: { minHeight: 48, justifyContent: "center", paddingHorizontal: space.sm },
});
