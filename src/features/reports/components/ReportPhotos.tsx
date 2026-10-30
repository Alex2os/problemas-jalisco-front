import { space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { photoUrl } from "@/services/report-media";
import type { Report } from "@/services/types";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppText, Notice } from "@/components/ui/AppUi";

export function ReportImage({
  url,
  thumbnail = false,
  hero = false,
}: {
  url: string;
  thumbnail?: boolean;
  hero?: boolean;
}) {
  const { colors } = useAppTheme();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  return (
    <View
      style={{
        width: thumbnail ? 80 : "100%",
        height: thumbnail ? 80 : hero ? 240 : 210,
        borderRadius: hero ? 0 : 6,
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
export function ReportPhotos({ report, hero = false }: { report: Report; hero?: boolean }) {
  return <ReportPhotosContent key={report.id} report={report} hero={hero} />;
}
function ReportPhotosContent({ report, hero }: { report: Report; hero: boolean }) {
  const photos = report.photos || [];
  const [viewing, setViewing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const index = photos.findIndex((photo) => photo.id === viewing);
  if (!photos.length) return null;
  return (
    <View style={{ gap: space.md }}>
      {!hero && <AppText variant="heading">Fotos del reporte</AppText>}
      {photos.map((photo, index) => (
        <Pressable key={photo.id} accessibilityRole="button"
          accessibilityLabel={`Abrir foto ${index + 1} en pantalla completa`}
          onPress={() => setViewing(photo.id)}>
          <ReportImage key={photo.url} url={photo.url} hero={hero} />
        </Pressable>
      ))}
      <Notice message={error} />
      <Modal visible={viewing !== null && index >= 0} animationType="none" onRequestClose={() => setViewing(null)}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#101310" }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar foto" onPress={() => setViewing(null)}
              style={{ minHeight: 48, padding: space.lg }}>
              <AppText style={{ color: "white" }}>Cerrar</AppText>
            </Pressable>
            {photos[index] && (
              <Image source={{ uri: photoUrl(photos[index].url) }} contentFit="contain" style={{ flex: 1 }}
                accessibilityLabel={`Foto ${index + 1} de ${photos.length}`}
                onError={() => { setViewing(null); setError("No se pudo abrir la foto. Intenta de nuevo."); }} />
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: space.lg }}>
              <Pressable accessibilityRole="button" disabled={index <= 0}
                onPress={() => { if (photos[index - 1]) setViewing(photos[index - 1].id); }}
                style={{ minHeight: 44, justifyContent: "center", opacity: index <= 0 ? 0.4 : 1 }}>
                <AppText style={{ color: "white" }}>Anterior</AppText>
              </Pressable>
              <AppText style={{ color: "white" }}>{index + 1}/{photos.length}</AppText>
              <Pressable accessibilityRole="button" disabled={index >= photos.length - 1}
                onPress={() => { if (photos[index + 1]) setViewing(photos[index + 1].id); }}
                style={{ minHeight: 44, justifyContent: "center", opacity: index >= photos.length - 1 ? 0.4 : 1 }}>
                <AppText style={{ color: "white" }}>Siguiente</AppText>
              </Pressable>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}
