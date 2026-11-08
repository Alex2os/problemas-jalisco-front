import { radius, size, space } from "@/constants/design";
import { palette } from "@/constants/palette";
import { FontFamily } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { photoUrl } from "@/services/report-media";
import type { Report } from "@/services/types";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";
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
        height: thumbnail ? 80 : hero ? undefined : 210,
        aspectRatio: !thumbnail && hero ? 16 / 9 : undefined,
        borderRadius: radius.md,
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
              style={{ minHeight: size.touch, justifyContent: "center" }}
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
          color={colors.primary}
          style={{ position: "absolute", alignSelf: "center" }}
        />
      )}
    </View>
  );
}
export function ReportPhotos({
  report,
  hero = false,
}: {
  report: Report;
  hero?: boolean;
}) {
  return <ReportPhotosContent key={report.id} report={report} hero={hero} />;
}
function ReportPhotosContent({
  report,
  hero,
}: {
  report: Report;
  hero: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const photos = report.photos || [];
  const [viewing, setViewing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [width, setWidth] = useState(0);
  const [currentId, setCurrentId] = useState(photos[0]?.id);
  const currentIndex = Math.max(
    0,
    photos.findIndex((photo) => photo.id === currentId),
  );
  const index = photos.findIndex((photo) => photo.id === viewing);
  if (!photos.length) return null;
  return (
    <View style={{ gap: space.md }}>
      {!hero && <AppText variant="heading">Fotos del reporte</AppText>}
      <View
        style={hero ? styles.heroGallery : undefined}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        {width > 0 && (
          <FlatList
            key={`${width}:${photos.map((photo) => photo.id).join(",")}`}
            data={photos}
            keyExtractor={(photo) => String(photo.id)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentIndex}
            getItemLayout={(_, itemIndex) => ({
              length: width,
              offset: width * itemIndex,
              index: itemIndex,
            })}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              if (photos[nextIndex]) setCurrentId(photos[nextIndex].id);
            }}
            renderItem={({ item, index: photoIndex }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir foto ${photoIndex + 1} de ${photos.length} en pantalla completa`}
                style={{ width }}
                onPress={() => {
                  setError("");
                  setViewing(item.id);
                }}
              >
                <ReportImage key={item.url} url={item.url} hero={hero} />
              </Pressable>
            )}
          />
        )}
        {photos.length > 1 && (
          <View pointerEvents="none" style={styles.galleryInfo}>
            <Text accessibilityLiveRegion="polite" style={styles.swipeHint}>
              {currentIndex + 1}/{photos.length}
            </Text>
          </View>
        )}
      </View>
      <Notice message={error} />
      <Modal
        visible={viewing !== null && index >= 0}
        animationType={reducedMotion ? "none" : "fade"}
        onRequestClose={() => setViewing(null)}
      >
        <SafeAreaProvider>
          {viewing !== null && index >= 0 && (
            <PhotoViewer
              photos={photos}
              initialIndex={index}
              onClose={() => setViewing(null)}
              onError={() => {
                setViewing(null);
                setError("No se pudo abrir la foto. Intenta de nuevo.");
              }}
            />
          )}
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

// The fullscreen photo canvas stays dark in either app theme.
const VIEWER_COLORS = palette.dark;

function PhotoViewer({
  photos,
  initialIndex,
  onClose,
  onError,
}: {
  photos: NonNullable<Report["photos"]>;
  initialIndex: number;
  onClose: () => void;
  onError: () => void;
}) {
  const [currentId, setCurrentId] = useState(photos[initialIndex].id);
  const [width, setWidth] = useState(0);
  const [closePressed, setClosePressed] = useState(false);
  const [failedIds, setFailedIds] = useState<number[]>([]);
  const index = Math.max(
    0,
    photos.findIndex((photo) => photo.id === currentId),
  );
  const visibleId = photos[index]?.id;
  useEffect(() => {
    // A failed prefetched page must not dismiss the photo currently being viewed.
    if (failedIds.includes(visibleId)) onError();
  }, [failedIds, visibleId, onError]);

  return (
    <SafeAreaView style={styles.viewer}>
      <View
        style={styles.photoArea}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        {width > 0 && (
          <FlatList
            key={`${width}:${photos.map((photo) => photo.id).join(",")}`}
            data={photos}
            keyExtractor={(photo) => String(photo.id)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={index}
            getItemLayout={(_, itemIndex) => ({
              length: width,
              offset: width * itemIndex,
              index: itemIndex,
            })}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              if (photos[nextIndex]) setCurrentId(photos[nextIndex].id);
            }}
            renderItem={({ item, index: photoIndex }) => (
              <Image
                source={{ uri: photoUrl(item.url) }}
                contentFit="contain"
                style={{ width, height: "100%" }}
                accessibilityLabel={`Foto ${photoIndex + 1} de ${photos.length}`}
                onError={() =>
                  setFailedIds((ids) =>
                    ids.includes(item.id) ? ids : [...ids, item.id],
                  )
                }
              />
            )}
          />
        )}
      </View>
      <View style={styles.viewerFooter}>
        <View style={styles.photoInfo}>
          <Text accessibilityLiveRegion="polite" style={styles.photoCounter}>
            Foto {index + 1} de {photos.length}
          </Text>
          {photos.length > 1 && (
            <Text style={styles.swipeHint}>Desliza para ver más</Text>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar fotos"
          onPress={onClose}
          onPressIn={() => setClosePressed(true)}
          onPressOut={() => setClosePressed(false)}
          style={[
            styles.closeButton,
            {
              backgroundColor: closePressed
                ? VIEWER_COLORS.surfaceAccent
                : VIEWER_COLORS.raised,
            },
          ]}
        >
          <Ionicons name="close" size={20} color={VIEWER_COLORS.text} />
          <Text style={styles.closeLabel}>Cerrar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroGallery: {
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  galleryInfo: {
    position: "absolute",
    bottom: space.sm,
    right: space.sm,
    backgroundColor: VIEWER_COLORS.background,
    borderRadius: radius.control,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  viewer: { flex: 1, backgroundColor: VIEWER_COLORS.background },
  photoArea: { flex: 1 },
  viewerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    padding: space.lg,
  },
  photoInfo: { flex: 1, gap: space.xs },
  photoCounter: {
    fontFamily: FontFamily.inter.semiBold,
    color: VIEWER_COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  swipeHint: {
    fontFamily: FontFamily.inter.regular,
    color: VIEWER_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    minHeight: size.touch,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: VIEWER_COLORS.borderStrong,
  },
  closeLabel: {
    fontFamily: FontFamily.inter.semiBold,
    color: VIEWER_COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
