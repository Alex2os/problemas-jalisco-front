import React from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { radius, space, shadows } from "@/src/constants/design";
import { es } from "@/src/constants/es";

export interface PhotoPickerProps {
  photos: string[];
  maxPhotos?: number;
  onAddPhoto: (uri: string) => void;
  onRemovePhoto: (index: number) => void;
  style?: StyleProp<ViewStyle>;
}

export function PhotoPicker({
  photos,
  maxPhotos = 3,
  onAddPhoto,
  onRemovePhoto,
  style,
}: PhotoPickerProps) {
  const { colors, dark } = useAppTheme();
  const canAddMore = photos.length < maxPhotos;

  const handleTakePhoto = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permiso de cámara", "Se requiere cámara para tomar fotos de la falla.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        onAddPhoto(result.assets[0].uri);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Ignored
    }
  };

  const handlePickGallery = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        onAddPhoto(result.assets[0].uri);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Photo Buttons */}
      {canAddMore && (
        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleTakePhoto}
            accessibilityRole="button"
            accessibilityLabel="Tomar foto con la cámara"
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: dark ? "#1E2A38" : "#FFF7ED",
                borderColor: colors.accent,
                borderWidth: 1.5,
                opacity: pressed ? 0.85 : 1,
              },
              shadows.sm as any,
            ]}
          >
            <Ionicons name="camera" size={32} color={colors.accent} />
            <Text style={[styles.actionBtnText, { color: colors.accent }]}>
              {es.evidence.photoHero}
            </Text>
          </Pressable>

          <Pressable
            onPress={handlePickGallery}
            accessibilityRole="button"
            accessibilityLabel="Elegir foto de la galería"
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1.5,
                opacity: pressed ? 0.85 : 1,
              },
              shadows.sm as any,
            ]}
          >
            <Ionicons name="images-outline" size={30} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>
              {es.evidence.gallery}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Thumbnails Row */}
      {photos.length > 0 && (
        <View style={styles.thumbnailsWrap}>
          <Text style={[styles.countText, { color: colors.muted }]}>
            {photos.length} de {maxPhotos} fotos agregadas
          </Text>
          <View style={styles.thumbnailsRow}>
            {photos.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.thumbWrapper}>
                <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                <Pressable
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onRemovePhoto(index);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Eliminar foto"
                  hitSlop={6}
                  style={styles.removeBtn}
                >
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: space.xs,
  },
  actionsRow: {
    flexDirection: "row",
    gap: space.md,
  },
  actionBtn: {
    flex: 1,
    height: 110,
    borderRadius: radius.group,
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  thumbnailsWrap: {
    marginTop: space.md,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: space.xs,
  },
  thumbnailsRow: {
    flexDirection: "row",
    gap: space.sm,
  },
  thumbWrapper: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    overflow: "hidden",
    position: "relative",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
});
