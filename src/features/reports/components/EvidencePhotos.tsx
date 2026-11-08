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
        <View style={styles.actions}>
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
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
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
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
            disabled={inactive}
            onPress={() => onChoose(false)}
          />
        </View>
      )}

      {busy && (
        <View style={styles.preparing}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text
            style={[styles.caption, { color: colors.textSecondary }]}
          >
            Preparando fotos…
          </Text>
        </View>
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
  removeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: { flexDirection: "row", gap: space.sm },
  actionButton: {
    flex: 1,
    minWidth: 0,
    height: "auto",
    minHeight: size.touch,
    paddingVertical: space.md,
  },
  actionButtonText: { fontSize: 14, flexShrink: 1 },
});
