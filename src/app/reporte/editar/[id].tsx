import { CategoryIcon } from "@/features/reports/components/CategoryIcon";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams, usePreventRemove } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { PhotoPicker } from "@/features/reports/components/PhotoPicker";
import { ReportStepFooter } from "@/features/reports/components/ReportStepFooter";
import { StatusChip } from "@/features/reports/components/StatusChip";
import { radius, size, space, type } from "@/constants/design";
import { categoryDefFor } from "@/constants/report-categories";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useBackendReport } from "@/hooks/useBackendReports";
import { useAuthSession, useCacheValue } from "@/hooks/useReportState";
import { GetReportById } from "@/services/get-report-by-id";
import { ReportEditFailure, SaveReportEdits } from "@/services/report-editing";
import type { SelectedPhoto } from "@/services/report-media";
import {
  normalizeReportStatus,
  type SimpleReportStatus,
} from "@/services/report-status";
import { sessionVersion } from "@/services/session";
import type { Report } from "@/services/types";

function returnToReport(id: string) {
  if (router.canGoBack()) router.back();
  else router.replace({ pathname: "/reporte/[id]", params: { id } });
}
function EditorHeader({
  id,
  disabled = false,
}: {
  id: string;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [pressed, setPressed] = useState(false);
  return (
    <View
      style={{ paddingTop: insets.top, backgroundColor: colors.background }}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver al reporte"
          disabled={disabled}
          accessibilityState={{ disabled }}
          onPress={() => returnToReport(id)}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={[
            styles.navButton,
            {
              backgroundColor:
                pressed && !disabled ? colors.raised : colors.background,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={disabled ? colors.muted : colors.text}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Editar reporte
        </Text>
        <View style={styles.navButton} />
      </View>
    </View>
  );
}

export default function EditReportScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const authenticated = useAuthSession();
  const identity = useCacheValue<number>("session:version") || 0;
  const { report, loading, error } = useBackendReport(id);
  if (authenticated && report?.can_manage)
    return (
      <EditorContent key={`${report.id}:${identity}`} initialReport={report} />
    );
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <EditorHeader id={id} />
      <View style={styles.empty}>
        {loading && !report ? (
          <ActivityIndicator color={colors.primary} />
        ) : !authenticated ? (
          <EmptyState
            title="Inicia sesión para editar"
            description="Solo el autor puede modificar este reporte."
            actionTitle="Iniciar sesión"
            onAction={() =>
              router.push({
                pathname: "/auth/login",
                params: { returnTo: `/reporte/editar/${id}` },
              })
            }
          />
        ) : error && !report ? (
          <ErrorBanner message={error} />
        ) : (
          <EmptyState
            title="No puedes editar este reporte"
            description="Solo el autor puede cambiar sus fotos y su estado."
          />
        )}
      </View>
    </View>
  );
}

function EditorContent({ initialReport }: { initialReport: Report }) {
  const { colors } = useAppTheme();
  const [pressedStatus, setPressedStatus] = useState<SimpleReportStatus | null>(
    null,
  );
  const [baseline, setBaseline] = useState(initialReport);
  const [status, setStatus] = useState<SimpleReportStatus>(
    normalizeReportStatus(initialReport.status),
  );
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsReload, setNeedsReload] = useState(false);
  const [allowLeave, setAllowLeave] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const retained = baseline.photos.filter(
    (photo) => !removed.includes(photo.id),
  );
  const changedStatus = status !== normalizeReportStatus(baseline.status);
  const dirty = changedStatus || photos.length > 0 || removed.length > 0;
  const inactive = busy || picking || needsReload;
  const disablePrevention = usePreventRemove(
    (dirty || busy || picking) && !allowLeave,
    ({ repeat }) => {
      if (pending.current || picking) return;
      Alert.alert(
        "¿Descartar los cambios?",
        "Los cambios que no guardaste se perderán.",
        [
          { text: "Seguir editando", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => {
              setAllowLeave(true);
              repeat();
            },
          },
        ],
      );
    },
  );

  async function save() {
    if (pending.current || picking || !dirty || needsReload) return;
    pending.current = true;
    setBusy(true);
    setError("");
    const identity = sessionVersion();
    try {
      await SaveReportEdits({
        report: baseline,
        photos,
        removedPhotoIds: removed,
        status: changedStatus ? status : undefined,
      });
      if (!mounted.current || identity !== sessionVersion()) return;
      setAllowLeave(true);
      disablePrevention();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      returnToReport(String(baseline.id));
    } catch (failure) {
      if (!mounted.current || identity !== sessionVersion()) return;
      const reload = failure instanceof ReportEditFailure;
      setNeedsReload(reload);
      setError(
        `${failure instanceof Error ? failure.message : "No se pudieron guardar los cambios."}${reload ? " Revisa el reporte antes de guardar de nuevo; algunos cambios pueden haberse guardado." : ""}`,
      );
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
      if (mounted.current && identity === sessionVersion())
        setError(
          failure instanceof Error
            ? failure.message
            : "No se pudo cargar el reporte.",
        );
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const category = categoryDefFor(baseline.type);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <EditorHeader id={String(baseline.id)} disabled={busy || picking} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: colors.text }]}
          >
            Actualiza tu reporte
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Cambia las fotos o el estado y guarda los cambios.
          </Text>
        </View>
        <View style={styles.summary}>
          <CategoryIcon category={category} size={24} color={category.color} />
          <View style={styles.summaryCopy}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {category.label}
            </Text>
            {!!baseline.ubication?.trim() && (
              <Text style={[styles.caption, { color: colors.textSecondary }]}>
                {baseline.ubication}
              </Text>
            )}
            <View style={styles.currentStatus}>
              <Text style={[styles.caption, { color: colors.textSecondary }]}>
                Estado actual
              </Text>
              <StatusChip
                status={baseline.status}
                size="sm"
                style={{ alignSelf: "center" }}
              />
            </View>
          </View>
        </View>
        {!!error && <ErrorBanner message={error} />}
        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <Text
            accessibilityRole="header"
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            Estado del reporte
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Indica si el problema sigue presente o ya se resolvió.
          </Text>
          <View accessibilityRole="radiogroup" style={styles.options}>
            {(
              [
                {
                  value: "reportado",
                  label: "Reportado",
                  icon: "document-text-outline",
                },
                {
                  value: "resuelto",
                  label: "Resuelto",
                  icon: "checkmark-circle-outline",
                },
              ] as const
            ).map((option) => {
              const selected = status === option.value;
              const color =
                option.value === "resuelto"
                  ? colors.success
                  : colors.primaryText;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ checked: selected, disabled: inactive }}
                  disabled={inactive}
                  onPress={() => setStatus(option.value)}
                  onPressIn={() => setPressedStatus(option.value)}
                  onPressOut={() => setPressedStatus(null)}
                  style={[
                    styles.option,
                    {
                      borderColor: selected ? color : colors.border,
                      backgroundColor:
                        pressedStatus === option.value && !inactive
                          ? colors.raised
                          : selected
                            ? option.value === "resuelto"
                              ? colors.successSoft
                              : colors.primarySoft
                            : colors.background,
                      opacity: inactive ? 0.6 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={selected ? color : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: selected ? color : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <PhotoPicker
            variant="editor"
            photos={photos}
            onChange={setPhotos}
            existingPhotos={retained}
            onRemoveExisting={(id) => setRemoved((current) => [...current, id])}
            capacity={Math.max(0, 3 - retained.length)}
            disabled={inactive}
            onBusyChange={setPicking}
          />
          {!!removed.length && (
            <View style={styles.removalNote}>
              <Text
                style={[
                  styles.caption,
                  { color: colors.textSecondary, flex: 1 },
                ]}
              >
                {removed.length === 1
                  ? "1 foto se eliminará al guardar."
                  : `${removed.length} fotos se eliminarán al guardar.`}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Deshacer eliminación de fotos"
                disabled={
                  inactive || baseline.photos.length + photos.length > 3
                }
                onPress={() => setRemoved([])}
                style={styles.undo}
              >
                <Text
                  style={{
                    color:
                      inactive || baseline.photos.length + photos.length > 3
                        ? colors.textSecondary
                        : colors.primaryText,
                    fontWeight: "600",
                  }}
                >
                  Deshacer
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
      <ReportStepFooter
        continuous
        title={
          busy
            ? needsReload
              ? "Cargando reporte…"
              : "Guardando cambios…"
            : needsReload
              ? "Revisar cambios guardados"
              : "Guardar cambios"
        }
        icon={needsReload ? "refresh-outline" : "checkmark-outline"}
        loading={busy}
        disabled={picking || (!dirty && !needsReload)}
        onPress={() => {
          if (needsReload) void reload();
          else void save();
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.sm,
    paddingBottom: space.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navButton: {
    width: size.touch,
    minHeight: size.touch,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...type.label,
    flex: 1,
    textAlign: "center",
    paddingHorizontal: space.sm,
  },
  empty: { flex: 1, padding: space.lg, justifyContent: "center" },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.xxl,
    gap: space.xl,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  intro: { gap: space.xs },
  title: { ...type.title },
  subtitle: { ...type.caption, fontSize: 14, lineHeight: 21 },
  caption: { ...type.caption },
  summary: { flexDirection: "row", alignItems: "flex-start", gap: space.md },
  summaryCopy: { flex: 1, gap: space.xs },
  currentStatus: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.xs,
  },
  summaryTitle: { ...type.label },
  section: {
    paddingTop: space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: space.sm,
  },
  sectionTitle: { ...type.subheading },
  options: { flexDirection: "row", gap: space.sm, marginTop: space.sm },
  option: {
    flex: 1,
    minWidth: 0,
    minHeight: size.touch,
    padding: space.md,
    borderWidth: 1,
    borderRadius: radius.control,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  optionText: {
    ...type.caption,
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  removalNote: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
  },
  undo: {
    minHeight: size.touch,
    justifyContent: "center",
    paddingHorizontal: space.sm,
  },
});
