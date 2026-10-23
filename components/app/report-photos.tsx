import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppText, Button, Notice } from "./ui";
import { PhotoPicker } from "./photo-picker";
import { useAuthSession, useCacheValue } from "@/hooks/use-report-state";
import {
  AddReportPhotos,
  RemoveReportPhoto,
  photoUrl,
  type SelectedPhoto,
} from "@/services/ReportMedia";
import { sessionVersion } from "@/services/session";
import { useAppTheme } from "@/hooks/use-app-theme";
import { space } from "@/constants/design";
import type { Report } from "@/services/types";

export function ReportImage({
  url,
  thumbnail = false,
}: {
  url: string;
  thumbnail?: boolean;
}) {
  const { colors } = useAppTheme();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  return (
    <View
      style={{
        width: thumbnail ? 80 : "100%",
        height: thumbnail ? 80 : 210,
        borderRadius: 6,
        overflow: "hidden",
        justifyContent: "center",
        backgroundColor: colors.raised,
      }}
    >
      {failed ? (
        <View style={{ padding: space.sm }}>
          <AppText variant="caption" tone="muted">
            Foto no disponible
          </AppText>
          {!thumbnail && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reintentar imagen"
              onPress={(event) => {
                event.stopPropagation();
                setLoading(true);
                setFailed(false);
              }}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <AppText variant="caption" tone="accent">
                Reintentar imagen
              </AppText>
            </Pressable>
          )}
        </View>
      ) : (
        <Image
          source={{ uri: photoUrl(url) }}
          onError={() => {
            setFailed(true);
            setLoading(false);
          }}
          onLoad={() => setLoading(false)}
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
          accessibilityLabel="Foto del problema"
        />
      )}
      {loading && !failed && (
        <ActivityIndicator
          color={colors.accent}
          style={{ position: "absolute", alignSelf: "center" }}
        />
      )}
    </View>
  );
}
export function ReportPhotos({ report }: { report: Report }) {
  const identity = useCacheValue<number>("session:version") || 0;
  return (
    <ReportPhotosContent key={`${report.id}:${identity}`} report={report} />
  );
}
function ReportPhotosContent({ report }: { report: Report }) {
  const authenticated = useAuthSession();
  const owner = authenticated && report.can_manage;
  const photos = report.photos || [];
  const [selected, setSelected] = useState<SelectedPhoto[]>([]);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewing, setViewing] = useState<number | null>(null);
  const operation = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function change(action: () => Promise<Report>, uploaded = false) {
    if (operation.current || picking || !owner) return;
    operation.current = true;
    setBusy(true);
    setError("");
    setSuccess("");
    const identity = sessionVersion();
    try {
      await action();
      if (mounted.current && identity === sessionVersion()) {
        if (uploaded) setSelected([]);
        setSuccess(uploaded ? "Fotos guardadas." : "Foto eliminada.");
      }
    } catch (failure) {
      if (mounted.current && identity === sessionVersion())
        setError(
          failure instanceof Error
            ? `${failure.message} Actualiza antes de volver a intentar la carga.`
            : "No se pudo guardar. Actualiza el reporte.",
        );
    } finally {
      operation.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <View style={{ gap: space.md }}>
      <AppText variant="heading">Fotos del reporte</AppText>
      {!photos.length && (
        <AppText variant="caption" tone="muted">
          Este reporte todavía no tiene fotos.
        </AppText>
      )}
      {photos.map((photo, index) => (
        <View key={photo.id} style={{ gap: space.xs }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir foto ${index + 1} en pantalla completa`}
            onPress={() => setViewing(index)}
          >
            <ReportImage key={photo.url} url={photo.url} />
          </Pressable>
          {owner && (
            <Button
              variant="text"
              label={`Eliminar foto ${index + 1}`}
              disabled={busy || picking}
              onPress={() =>
                Alert.alert("¿Eliminar esta foto?", "Se quitará del reporte.", [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => {
                      void change(() => RemoveReportPhoto(report.id, photo.id));
                    },
                  },
                ])
              }
            />
          )}
        </View>
      ))}
      {owner && photos.length < 3 && (
        <>
          <PhotoPicker
            photos={selected}
            onChange={setSelected}
            capacity={3 - photos.length}
            disabled={busy}
            onBusyChange={setPicking}
          />
          {!!selected.length && (
            <Button
              label="Guardar fotos"
              loadingLabel="Subiendo fotos…"
              loading={busy}
              disabled={picking || selected.length + photos.length > 3}
              onPress={() =>
                change(() => AddReportPhotos(report.id, selected), true)
              }
            />
          )}
        </>
      )}
      {busy && (
        <AppText variant="caption" tone="muted">
          Guardando cambios en las fotos…
        </AppText>
      )}
      <Notice message={error} />
      <Notice message={success} success />
      <Modal
        visible={viewing !== null}
        animationType="none"
        onRequestClose={() => setViewing(null)}
      >
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#101310" }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setViewing(null)}
              style={{ minHeight: 48, padding: space.lg }}
            >
              <AppText style={{ color: "white" }}>Cerrar</AppText>
            </Pressable>
            {viewing !== null && photos[viewing] && (
              <Image
                source={{ uri: photoUrl(photos[viewing].url) }}
                contentFit="contain"
                style={{ flex: 1 }}
                accessibilityLabel={`Foto ${viewing + 1} de ${photos.length}`}
                onError={() => {
                  setViewing(null);
                  setError(
                    "No se pudo abrir la foto. Actualiza el reporte e intenta de nuevo.",
                  );
                }}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: space.lg,
              }}
            >
              <Pressable
                accessibilityRole="button"
                disabled={viewing === null || viewing <= 0}
                onPress={() => setViewing((i) => Math.max(0, (i || 0) - 1))}
                style={{
                  minHeight: 44,
                  justifyContent: "center",
                  opacity: viewing === 0 ? 0.4 : 1,
                }}
              >
                <AppText style={{ color: "white" }}>Anterior</AppText>
              </Pressable>
              <AppText style={{ color: "white" }}>
                {(viewing ?? 0) + 1}/{photos.length}
              </AppText>
              <Pressable
                accessibilityRole="button"
                disabled={viewing === null || viewing >= photos.length - 1}
                onPress={() =>
                  setViewing((i) => Math.min(photos.length - 1, (i || 0) + 1))
                }
                style={{
                  minHeight: 44,
                  justifyContent: "center",
                  opacity: viewing === photos.length - 1 ? 0.4 : 1,
                }}
              >
                <AppText style={{ color: "white" }}>Siguiente</AppText>
              </Pressable>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}
