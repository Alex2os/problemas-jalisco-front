import React, { useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBanner } from "@/src/components/ErrorBanner";
import { useBackendReports } from "@/src/hooks/use-backend-reports";
import { useAuthSession } from "@/src/hooks/use-report-state";
import { categoryDefFor } from "@/src/constants/report-categories";
import { radius, shadows, space } from "@/src/constants/design";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useReportsStore } from "@/src/store/useReportsStore";
import type { Report } from "@/src/services/types";

export default function MapaScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const mapRef = useRef<MapView>(null);

  useBackendReports();
  const authenticated = useAuthSession();
  const reports = useReportsStore((s) => s.reports);
  const loading = useReportsStore((s) => s.isLoading);
  const error = useReportsStore((s) => s.error);

  const handleRecenterGPS = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapRef.current?.animateToRegion({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch {
      // Ignored
    }
  };

  const handleSelectReport = (r: Report) => {
    mapRef.current?.animateToRegion({
      latitude: r.latitude,
      longitude: r.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    router.push(`/reporte/${r.id}`);
  };

  const handleStartReport = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (authenticated) router.push("/reportar/categoria");
    else router.push({ pathname: "/auth/login", params: { returnTo: "/reportar/categoria" } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <View style={styles.mapArea}>
        {/* Full Screen Waze-style Map */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: 20.6767,
            longitude: -103.3472,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
        >
          {reports.map((r) => {
            const cat = categoryDefFor(r.category || r.type);
            return (
              <Marker
                key={r.id}
                coordinate={{ latitude: r.latitude, longitude: r.longitude }}
                pinColor={cat.color}
                onPress={() => handleSelectReport(r)}
              />
            );
          })}
        </MapView>

        {/* Top Floating Status Pill */}
        <View
          pointerEvents="box-none"
          style={[
            styles.topFloatingBar,
            { paddingTop: Math.max(insets.top, 14) },
          ]}
        >
          <View
            style={[
              styles.locationPill,
              { backgroundColor: colors.surface, borderColor: colors.border },
              shadows.md as any,
            ]}
          >
            <Ionicons name="location" size={16} color={colors.accent} />
            <Text style={[styles.locationPillText, { color: colors.text }]}>
              Guadalajara y Área Metro
            </Text>
            <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.activeCount, { color: colors.muted }]}>
              {loading ? "Cargando…" : `${reports.length} reportes`}
            </Text>
          </View>
          {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: space.sm }} />}
          {!!error && <ErrorBanner message={error} />}
        </View>

        {/* Floating GPS Button */}
        <Pressable
          onPress={handleRecenterGPS}
          accessibilityRole="button"
          accessibilityLabel="Mi ubicación"
          style={[
            styles.gpsBtn,
            {
              backgroundColor: colors.surface,
            },
            shadows.md as any,
          ]}
        >
          <Ionicons name="locate" size={22} color={colors.accent} />
        </Pressable>

      </View>
      <View style={[styles.reportBar, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={handleStartReport}
          accessibilityRole="button"
          accessibilityLabel="Reportar un problema"
          accessibilityHint="Abre el formulario para crear un reporte"
          style={({ pressed }) => [
            styles.reportButton,
            { backgroundColor: pressed ? colors.accentDark : colors.accent },
          ]}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.onAccent} />
          <Text style={[styles.reportButtonText, { color: colors.onAccent }]}>
            Reportar un problema
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  mapArea: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },
  reportBar: {
    flexShrink: 0,
    borderTopWidth: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    alignItems: "center",
  },
  topFloatingBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: space.lg,
    zIndex: 20,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 6,
  },
  locationPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  gpsBtn: {
    position: "absolute",
    bottom: space.lg,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  reportButton: {
    width: "100%",
    maxWidth: 480,
    minHeight: 56,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.control,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    flexShrink: 1,
    textAlign: "center",
  },
});
