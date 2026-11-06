import { Button } from "@/components/Button";
import { palette } from "@/constants/palette";
import { OptionalBadge } from "@/components/OptionalBadge";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { radius, size, space, type } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ReportPhoto } from "@/services/types";
import type { SelectedPhoto } from "@/services/report-media";

export function EvidencePhotos({
  photos,
  capacity,
  busy,
  disabled,
  onChoose,
  onRemove,
  existingPhotos = [],
  onRemoveExisting,
  continuous = false,
}: {
  continuous?: boolean;
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
    ...existingPhotos.map((photo) => ({
      key: `saved:${photo.id}`,
      uri: photo.url,
      remove: onRemoveExisting ? () => onRemoveExisting(photo.id) : undefined,
    })),
    ...photos.map((photo, index) => ({
      key: `new:${photo.uri}:${index}`,
      uri: photo.uri,
      remove: () => onRemove(index),
    })),
  ];
  if (continuous)
    return (
      <View style={styles.continuousSection}>
        <View style={styles.continuousHeader}>
          <View style={styles.headingGroup}>
            <View style={styles.titleRow}>
              <Text
                accessibilityRole="header"
                style={[styles.continuousTitle, { color: colors.text }]}
              >
                Fotos
              </Text>
              <Text
                style={[
                  styles.continuousCaption,
                  { color: colors.textSecondary },
                ]}
              >
                Opcional
              </Text>
            </View>
            <Text
              style={[
                styles.continuousCaption,
                { color: colors.textSecondary },
              ]}
            >
              Hasta {totalCapacity} fotos
            </Text>
          </View>
          <Text
            accessibilityLabel={`${previews.length} de ${totalCapacity} fotos`}
            style={[styles.continuousCaption, { color: colors.textSecondary }]}
          >
            {previews.length}/{totalCapacity}
          </Text>
        </View>
        {!!previews.length && (
          <View style={styles.continuousPhotos}>
            {previews.map((photo, index) => (
              <View
                key={photo.key}
                style={[
                  styles.continuousPhoto,
                  { backgroundColor: colors.raised },
                ]}
              >
                <Image
                  source={{ uri: photo.uri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  accessibilityLabel={`Foto ${index + 1} del reporte`}
                />
                {photo.remove && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar foto ${index + 1}`}
                    accessibilityState={{ disabled: inactive }}
                    disabled={inactive}
                    onPress={photo.remove}
                    style={styles.continuousRemoveButton}
                  >
                    <View
                      style={[
                        styles.removeCircle,
                        { backgroundColor: palette.dark.background },
                      ]}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={palette.dark.text}
                      />
                    </View>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
        {photos.length < capacity && (
          <View style={styles.continuousActions}>
            <Button
              title="Tomar foto"
              variant="outline"
              size="sm"
              haptic={false}
              icon={
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={inactive ? colors.muted : colors.text}
                />
              }
              style={styles.continuousAction}
              textStyle={styles.continuousActionText}
              disabled={inactive}
              onPress={() => onChoose(true)}
            />
            <Button
              title="Galería"
              variant="outline"
              size="sm"
              haptic={false}
              icon={
                <Ionicons
                  name="images-outline"
                  size={20}
                  color={inactive ? colors.muted : colors.text}
                />
              }
              style={styles.continuousAction}
              textStyle={styles.continuousActionText}
              disabled={inactive}
              onPress={() => onChoose(false)}
            />
          </View>
        )}
        {busy && (
          <View style={styles.preparing}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text
              style={[
                styles.continuousCaption,
                { color: colors.textSecondary },
              ]}
            >
              Preparando fotos…
            </Text>
          </View>
        )}
      </View>
    );
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headingGroup}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>Fotos</Text>
            <OptionalBadge />
          </View>
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            Hasta {totalCapacity} fotos
          </Text>
        </View>
        <Text
          accessibilityLabel={`${previews.length} de ${totalCapacity} fotos`}
          style={[styles.counterText, { color: colors.textSecondary }]}
        >
          {previews.length}/{totalCapacity}
        </Text>
      </View>

      {previews.length ? (
        <View style={styles.continuousPhotos}>
          {previews.map((photo, index) => (
            <View
              key={photo.key}
              style={[
                styles.continuousPhoto,
                { backgroundColor: colors.raised },
              ]}
            >
              <Image
                source={{ uri: photo.uri }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                accessibilityLabel={`Foto ${index + 1} del reporte`}
              />
              {photo.remove && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar foto ${index + 1}`}
                  accessibilityState={{ disabled: inactive }}
                  disabled={inactive}
                  onPress={photo.remove}
                  style={styles.removeButton}
                >
                  <View style={styles.removeCircle}>
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </View>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar fotos desde la galería"
          disabled={inactive}
          accessibilityState={{ disabled: inactive, busy }}
          onPress={() => onChoose(false)}
          style={[
            styles.emptyArea,
            {
              borderColor: colors.borderStrong,
              backgroundColor: colors.background,
            },
          ]}
        >
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}
          >
            {busy ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <Ionicons
                name="camera-outline"
                size={28}
                color={colors.accentText}
              />
            )}
          </View>
          <Text style={[styles.emptyTitle, { color: colors.muted }]}>
            {busy ? "Preparando fotos…" : "Toca para agregar imágenes"}
          </Text>
        </Pressable>
      )}

      {photos.length < capacity && (
        <View style={styles.actions}>
          {(
            [
              { camera: true, label: "Tomar foto", icon: "camera-outline" },
              { camera: false, label: "Galería", icon: "images-outline" },
            ] as const
          ).map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityState={{ disabled: inactive, busy }}
              disabled={inactive}
              onPress={() => onChoose(action.camera)}
              style={[
                styles.action,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: inactive ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons name={action.icon} size={20} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {!!(busy && photos.length) && (
        <Text style={[styles.caption, { color: colors.textSecondary }]}>
          Preparando fotos…
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  continuousSection: { gap: space.md },
  continuousHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  continuousTitle: { ...type.subheading },
  continuousCaption: { ...type.caption },
  continuousPhotos: { flexDirection: "row", gap: space.sm },
  continuousPhoto: {
    flex: 1,
    maxWidth: 160,
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  continuousRemoveButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: size.touch,
    height: size.touch,
    alignItems: "center",
    justifyContent: "center",
  },
  continuousActions: { flexDirection: "row", gap: space.sm },
  continuousAction: {
    flex: 1,
    minWidth: 0,
    height: "auto",
    minHeight: size.touch,
    paddingVertical: space.md,
  },
  continuousActionText: { fontSize: 14, flexShrink: 1 },
  preparing: { flexDirection: "row", alignItems: "center", gap: space.sm },
  section: { gap: space.md },
  header: { flexDirection: "row", alignItems: "center", gap: space.md },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
  },
  headingGroup: { flex: 1, gap: 3 },
  title: { fontSize: 17, lineHeight: 23, fontWeight: "700" },
  caption: { fontSize: 12, lineHeight: 18 },
  counterText: { fontSize: 12, fontWeight: "700", lineHeight: 18 },
  emptyArea: {
    minHeight: 168,
    padding: space.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.group,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.xs,
  },
  emptyTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    textAlign: "center",
    alignSelf: "center",
  },
  removeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: size.touch,
    height: size.touch,
    alignItems: "center",
    justifyContent: "center",
  },
  removeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: { flexDirection: "row", gap: space.sm },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "center",
  },
});
