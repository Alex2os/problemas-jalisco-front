import { OptionalBadge } from "@/components/OptionalBadge";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { radius, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ReportPhoto } from "@/services/types";
import type { SelectedPhoto } from "@/services/report-media";

export function EvidencePhotos({ photos, capacity, busy, disabled, onChoose, onRemove, existingPhotos = [], onRemoveExisting }: {
  photos: SelectedPhoto[];
  existingPhotos?: ReportPhoto[];
  onRemoveExisting?: (id: number) => void;
  capacity: number;
  busy: boolean;
  disabled: boolean;
  onChoose: (camera: boolean) => void;
  onRemove: (index: number) => void;
}) {
  const { colors } = useAppTheme();
  const inactive = disabled || busy;
  const totalCapacity = capacity + existingPhotos.length;
  const previews = [
    ...existingPhotos.map((photo) => ({ key: `saved:${photo.id}`, uri: photo.url, remove: onRemoveExisting ? () => onRemoveExisting(photo.id) : undefined })),
    ...photos.map((photo, index) => ({ key: `new:${photo.uri}:${index}`, uri: photo.uri, remove: () => onRemove(index) })),
  ];
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="images-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.headingGroup}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>Fotos</Text>
            <OptionalBadge />
          </View>
          <Text style={[styles.caption, { color: colors.muted }]}>Hasta {totalCapacity} fotos</Text>
        </View>
        <View style={[styles.counter, { backgroundColor: colors.raised }]}>
          <Text style={[styles.counterText, { color: colors.text }]}>{previews.length}/{totalCapacity}</Text>
        </View>
      </View>

      {previews.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
          {previews.map((photo, index) => (
            <View key={photo.key} style={[styles.photo, { backgroundColor: colors.raised }]}>
              <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover"
                accessibilityLabel={`Foto ${index + 1} del reporte`} />
              {photo.remove && <Pressable accessibilityRole="button" accessibilityLabel={`Quitar foto ${index + 1}`}
                accessibilityState={{ disabled: inactive }} disabled={inactive}
                onPress={photo.remove} style={styles.removeButton}>
                <View style={styles.removeCircle}><Ionicons name="close" size={16} color="#FFFFFF" /></View>
              </Pressable>}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel="Agregar fotos desde la galería"
          disabled={inactive} accessibilityState={{ disabled: inactive, busy }} onPress={() => onChoose(false)}
          style={[styles.emptyArea, { borderColor: colors.borderStrong, backgroundColor: colors.background }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}>
            {busy ? <ActivityIndicator color={colors.accent} /> : <Ionicons name="camera-outline" size={28} color={colors.accent} />}
          </View>
          <Text style={[styles.emptyTitle, { color: colors.muted }]}>{busy ? "Preparando fotos…" : "Toca para agregar imágenes"}</Text>
        </Pressable>
      )}

      {photos.length < capacity && (
        <View style={styles.actions}>
          {([{ camera: true, label: "Tomar foto", icon: "camera-outline" },
            { camera: false, label: "Galería", icon: "images-outline" }] as const).map((action) => (
            <Pressable key={action.label} accessibilityRole="button" accessibilityLabel={action.label}
              accessibilityState={{ disabled: inactive, busy }} disabled={inactive}
              onPress={() => onChoose(action.camera)}
              style={[styles.action, { backgroundColor: colors.surface, borderColor: colors.border, opacity: inactive ? 0.5 : 1 }]}>
              <Ionicons name={action.icon} size={20} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <Text style={[styles.caption, { color: colors.muted }]}>
        {busy && photos.length ? "Preparando fotos…" : "Hasta 5 MB por foto."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.lg },
  header: { flexDirection: "row", alignItems: "center", gap: space.md },
  sectionIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: space.sm },
  headingGroup: { flex: 1, gap: 3 },
  title: { fontSize: 17, lineHeight: 23, fontWeight: "700" },
  caption: { fontSize: 12, lineHeight: 18 },
  counter: { borderRadius: radius.full, paddingHorizontal: space.md, paddingVertical: 5 },
  counterText: { fontSize: 12, fontWeight: "700", lineHeight: 18 },
  emptyArea: { minHeight: 168, padding: space.lg, borderWidth: 1, borderStyle: "dashed", borderRadius: radius.group, alignItems: "center", justifyContent: "center", gap: space.sm },
  emptyIcon: { width: 52, height: 52, borderRadius: radius.full, alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: space.xs },
  emptyTitle: { fontSize: 15, lineHeight: 21, fontWeight: "600", textAlign: "center", alignSelf: "center" },
  photos: { gap: space.md },
  photo: { width: 120, height: 120, borderRadius: radius.md, overflow: "hidden" },
  removeButton: { position: "absolute", top: 0, right: 0, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  removeCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(15,23,42,0.8)", alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  action: { flex: 1, minWidth: 112, minHeight: 50, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.sm },
  actionText: { fontSize: 14, lineHeight: 20, fontWeight: "600", flexShrink: 1, textAlign: "center" },
});
