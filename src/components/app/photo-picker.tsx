import { EvidencePhotos } from "@/src/components/EvidencePhotos";
import { ErrorBanner } from "@/src/components/ErrorBanner";
import type { ReportPhoto } from "@/src/services/types";
import { space } from "@/src/constants/design";
import { MAX_PHOTO_BYTES, type SelectedPhoto } from "@/src/services/ReportMedia";
import { Image } from "expo-image";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { AppText, Button, Notice } from "./ui";

export function PhotoPicker({
  photos,
  onChange,
  disabled = false,
  capacity = 3,
  onBusyChange,
  variant = "default",
  existingPhotos,
  onRemoveExisting,
}: {
  photos: SelectedPhoto[];
  existingPhotos?: ReportPhoto[];
  onRemoveExisting?: (id: number) => void;
  onChange: (photos: SelectedPhoto[]) => void;
  disabled?: boolean;
  capacity?: number;
  onBusyChange?: (busy: boolean) => void;
  variant?: "default" | "evidence";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [denied, setDenied] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function choose(camera: boolean) {
    if (disabled || pending.current || photos.length >= capacity) return;
    pending.current = true;
    setBusy(true);
    onBusyChange?.(true);
    setError("");
    setDenied(false);
    try {
      const permission = camera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (mounted.current) {
          setDenied(true);
          setError(
            camera
              ? "Permite el acceso a la cámara para tomar una foto."
              : "Permite el acceso a tus fotos para seleccionarlas.",
          );
        }
        return;
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.85,
            exif: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            selectionLimit: Math.max(1, capacity - photos.length),
            quality: 0.85,
            exif: false,
            orderedSelection: true,
          });
      if (result.canceled || !mounted.current) return;
      if (result.assets.length + photos.length > capacity)
        throw new Error(
          `Puedes adjuntar hasta ${capacity} fotos más en este reporte.`,
        );
      const selected: SelectedPhoto[] = [];
      for (const asset of result.assets) {
        if (asset.fileSize && asset.fileSize > 25 * 1024 * 1024)
          throw new Error(
            "La foto original supera 25 MB. Elige una más pequeña.",
          );
        // Normalize HEIC/device formats and orientation to a bounded JPEG before uploading.
        const actions =
          Math.max(asset.width, asset.height) > 1800
            ? [
                {
                  resize:
                    asset.width >= asset.height
                      ? { width: 1800 }
                      : { height: 1800 },
                },
              ]
            : [];
        const image = await manipulateAsync(asset.uri, actions, {
          compress: 0.8,
          format: SaveFormat.JPEG,
          base64: true,
        });
        const size = Math.floor(((image.base64?.length || 0) * 3) / 4);
        if (!size || size > MAX_PHOTO_BYTES)
          throw new Error(
            "La foto procesada supera 5 MB. Elige una más pequeña.",
          );
        selected.push({
          uri: image.uri,
          name: "report-photo.jpg",
          type: "image/jpeg",
          size,
        });
      }
      if (mounted.current) onChange([...photos, ...selected]);
    } catch (failure) {
      if (mounted.current)
        setError(
          failure instanceof Error
            ? failure.message
            : "No se pudo preparar la foto.",
        );
    } finally {
      pending.current = false;
      if (mounted.current) {
        setBusy(false);
        onBusyChange?.(false);
      }
    }
  }
  if (variant === "evidence") return (
    <View style={{ gap: space.md }}>
      <EvidencePhotos photos={photos} capacity={capacity} busy={busy} disabled={disabled}
        existingPhotos={existingPhotos} onRemoveExisting={onRemoveExisting}
        onChoose={(camera) => { void choose(camera); }}
        onRemove={(index) => onChange(photos.filter((_, i) => i !== index))} />
      {!!error && <ErrorBanner message={error} />}
      {denied && <Button variant="text" label="Abrir ajustes" onPress={() => {
        void Linking.openSettings().catch(() => setError("Abre los ajustes del teléfono y permite el acceso."));
      }} />}
    </View>
  );
  return (
    <View style={{ gap: space.md }}>
      <AppText variant="label">
        Fotos · {photos.length}/{capacity}
      </AppText>
      <AppText variant="caption" tone="muted">
        Hasta 3 por reporte. Evita rostros, placas y datos personales. Cada foto
        se prepara como JPEG de hasta 5 MB.
      </AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {photos.map((photo, index) => (
          <View key={photo.uri} style={{ width: 96, gap: space.xs }}>
            <Image
              source={{ uri: photo.uri }}
              style={{ width: 96, height: 96, borderRadius: 6 }}
              contentFit="cover"
              accessibilityLabel={`Foto seleccionada ${index + 1}`}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Quitar foto ${index + 1}`}
              disabled={disabled || busy}
              onPress={() => onChange(photos.filter((_, i) => i !== index))}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <AppText variant="caption" tone="accent">
                Quitar
              </AppText>
            </Pressable>
          </View>
        ))}
      </View>
      {photos.length < capacity && (
        <View style={{ gap: space.sm }}>
          <Button
            secondary
            label="Elegir de galería"
            loading={busy}
            loadingLabel="Preparando fotos…"
            disabled={disabled}
            onPress={() => choose(false)}
          />
          <Button
            variant="text"
            label="Tomar foto"
            disabled={disabled || busy}
            onPress={() => choose(true)}
          />
        </View>
      )}
      <Notice message={error} />
      {denied && (
        <Button
          variant="text"
          label="Abrir ajustes"
          onPress={() => {
            void Linking.openSettings().catch(() =>
              setError("Abre los ajustes del teléfono y permite el acceso."),
            );
          }}
        />
      )}
    </View>
  );
}
