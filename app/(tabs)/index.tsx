import { useCallback, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import MapView, { Marker, type MapPressEvent } from "react-native-maps";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";
import Feather from "@expo/vector-icons/Feather";
import type { Report } from "@/services/types";
import { PhotoPicker } from "@/components/app/photo-picker";
import type { SelectedPhoto } from "@/services/ReportMedia";
import { CreateReport } from "@/services/CreateReport";
import { GetAllReports } from "@/services/GetAllReports";
import {
  Screen,
  TopBar,
  AppText,
  Button,
  Field,
  IconButton,
  Notice,
} from "@/components/app/ui";
import { useAppTheme } from "@/hooks/use-app-theme";
import { categories, categoryFor } from "@/constants/report-categories";
import { darkMapStyle } from "@/constants/map-theme";
import { border, radius, size, space } from "@/constants/design";

export default function Index() {
  const { colors, dark } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  const twoColumns = width >= 400 && fontScale <= 1.1;
  const reducedMotion = useReducedMotion();
  const [choosing, setChoosing] = useState(false);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [photoPicking, setPhotoPicking] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [markers, setMarkers] = useState<Report[]>([]);
  const [newMarker, setNewMarker] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const [problemSelected, setProblemSelected] = useState("accidente");
  const [reportDescription, setReportDescription] = useState("");

  const [reportProblemModal, setReportProblemModal] = useState(false);

  // jalisco bounds used to check if the user marker has a valid position
  const JaliscoLimits = {
    north: 22.75,
    south: 18.92,
    east: -101.5,
    west: -105.68,
  };

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submission = useRef(false);
  const [error, setError] = useState("");
  const loadId = useRef(0);
  const LoadAllReports = useCallback(async (refresh = false) => {
    const id = ++loadId.current;
    setLoading(true);
    setError("");
    try {
      const data = await GetAllReports(refresh);
      if (id === loadId.current) setMarkers(data);
    } catch (error) {
      if (id === loadId.current)
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los reportes.",
        );
    } finally {
      if (id === loadId.current) setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void LoadAllReports();
      return () => {
        loadId.current++;
      };
    }, [LoadAllReports]),
  );

  function OnMapPressed(event: MapPressEvent) {
    setChoosing(false);
    setFormError("");
    setSuccess("");
    setNewMarker([event.nativeEvent.coordinate]);
    setReportProblemModal(true);
  }
  async function AddMarkerToMap() {
    if (submission.current || photoPicking) return;
    const point = newMarker[0];
    if (
      !point ||
      point.latitude < JaliscoLimits.south ||
      point.latitude > JaliscoLimits.north ||
      point.longitude < JaliscoLimits.west ||
      point.longitude > JaliscoLimits.east
    ) {
      setFormError("Selecciona un punto dentro de los límites de Jalisco.");
      return;
    }
    if (!reportDescription.trim()) {
      setFormError("Describe el problema antes de enviarlo.");
      return;
    }
    submission.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      await CreateReport(
        problemSelected,
        reportDescription,
        point.latitude,
        point.longitude,
        photos,
      );
      setReportProblemModal(false);
      setReportDescription("");
      setPhotos([]);
      setSuccess("Reporte publicado.");
      await LoadAllReports();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo publicar. Intenta de nuevo.",
      );
    } finally {
      submission.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Screen
      scroll={false}
      header={
        <TopBar
          title="Problemas Jalisco"
          trailing={
            <IconButton
              icon="refresh-cw"
              label="Actualizar mapa"
              loading={loading}
              onPress={() => LoadAllReports(true)}
            />
          }
        />
      }
    >
      <View style={{ flex: 1 }}>
        <MapView
          style={StyleSheet.absoluteFill}
          userInterfaceStyle={dark ? "dark" : "light"}
          customMapStyle={dark ? darkMapStyle : []}
          initialRegion={{
            latitude: 20.6597,
            longitude: -103.3496,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={OnMapPressed}
        >
          {markers.map((marker) => {
            const category = categoryFor(marker.type);
            return (
              <Marker
                key={marker.id}
                onPress={(event) => event.stopPropagation()}
                onCalloutPress={() => router.push(`/reports/${marker.id}`)}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={category.label}
                description={marker.ubication || "Toca para ver detalles"}
              >
                <View
                  style={{
                    backgroundColor: colors.surface,
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    borderWidth: 2,
                    borderColor: category.color,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather
                    name={category.icon}
                    size={16}
                    color={dark ? colors.text : "#343E35"}
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopWidth: border.hairline,
          borderTopColor: colors.border,
          paddingHorizontal: space.lg,
          paddingVertical: space.md,
          gap: space.md,
        }}
      >
        <Notice message={error} />
        <Notice message={success} success />
        <View style={{ gap: space.xs }}>
          <AppText variant="label">
            {choosing ? "Toca el lugar del incidente" : "Mapa ciudadano"}
          </AppText>
          <AppText variant="caption" tone="muted">
            {choosing
              ? "Selecciona un punto en el mapa para continuar."
              : loading
                ? "Cargando reportes…"
                : `${markers.length} reportes cargados · Toca un marcador para abrirlo.`}
          </AppText>
        </View>
        {choosing ? (
          <Button
            secondary
            label="Cancelar selección"
            onPress={() => setChoosing(false)}
          />
        ) : (
          <Button
            label="Reportar un problema"
            onPress={() => {
              setChoosing(true);
              setSuccess("");
            }}
          />
        )}
      </View>
      <Modal
        visible={reportProblemModal}
        animationType={reducedMotion ? "none" : "slide"}
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (!submission.current && !photoPicking)
            setReportProblemModal(false);
        }}
      >
        <SafeAreaProvider>
          <Screen
            bottom
            header={
              <TopBar
                title="Nuevo reporte"
                trailing={
                  <IconButton
                    icon="x"
                    label="Cerrar formulario"
                    disabled={submitting || photoPicking}
                    onPress={() => setReportProblemModal(false)}
                  />
                }
              />
            }
          >
            <View style={{ gap: space.xs }}>
              <AppText variant="label">Ubicación seleccionada</AppText>
              <AppText variant="caption" tone="muted">
                El reporte se publicará en el punto que elegiste. Para
                cambiarlo, cierra este formulario y selecciona otro lugar.
              </AppText>
            </View>
            <View style={{ gap: space.md }}>
              <AppText variant="label">Tipo de problema</AppText>
              <View
                accessibilityRole="radiogroup"
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: space.sm,
                }}
              >
                {Object.entries(categories).map(([value, category]) => {
                  const selected = problemSelected === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityLabel={category.label}
                      accessibilityState={{
                        checked: selected,
                        disabled: submitting,
                      }}
                      disabled={submitting || photoPicking}
                      onPress={() => setProblemSelected(value)}
                      style={({ pressed }) => ({
                        width: twoColumns ? "48%" : "100%",
                        minHeight: size.touch,
                        paddingHorizontal: space.md,
                        paddingVertical: space.md,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: space.md,
                        borderRadius: radius.control,
                        borderWidth: 1,
                        borderColor: selected ? colors.accent : colors.border,
                        backgroundColor: selected
                          ? colors.accentSoft
                          : pressed
                            ? colors.raised
                            : colors.surface,
                        opacity: submitting ? 0.6 : 1,
                      })}
                    >
                      <AppText
                        variant="label"
                        tone={selected ? "accent" : "text"}
                        style={{ flex: 1 }}
                      >
                        {category.label}
                      </AppText>
                      <View style={{ width: size.smallIcon }}>
                        {selected && (
                          <Feather
                            name="check"
                            size={size.smallIcon}
                            color={colors.accent}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Field
              label="¿Qué ocurre?"
              maxLength={255}
              placeholder="Describe el problema y cualquier detalle útil para ubicarlo."
              multiline
              style={{ minHeight: 112, textAlignVertical: "top" }}
              value={reportDescription}
              onChangeText={setReportDescription}
              editable={!submitting}
            />
            <PhotoPicker
              photos={photos}
              onChange={setPhotos}
              disabled={submitting}
              onBusyChange={setPhotoPicking}
            />
            <Notice message={formError} />
            <Button
              label="Publicar reporte"
              disabled={photoPicking}
              loading={submitting}
              loadingLabel={
                photos.length ? "Publicando reporte y fotos…" : "Publicando…"
              }
              onPress={AddMarkerToMap}
            />
            <AppText variant="caption" tone="muted">
              Necesitas una sesión activa para publicar.
            </AppText>
            <Button
              variant="text"
              label="Cancelar"
              disabled={submitting || photoPicking}
              onPress={() => setReportProblemModal(false)}
            />
          </Screen>
        </SafeAreaProvider>
      </Modal>
    </Screen>
  );
}
