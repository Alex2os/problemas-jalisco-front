import React, { useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView from "react-native-maps";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/ErrorBanner";
import { useBackendReports } from "@/hooks/useBackendReports";
import { ReportMapMarker } from "@/features/reports/components/ReportMapMarker";
import { radius, size, space } from "@/constants/design";
import { darkMapStyle } from "@/constants/map-theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useReportsStore } from "@/store/useReportsStore";
import type { Report } from "@/services/types";

export default function MapaScreen() {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useAppTheme();
  const mapRef = useRef<MapView>(null);

  useBackendReports();
  const reports = useReportsStore((s) => s.reports);
  const loading = useReportsStore((s) => s.isLoading);
  const error = useReportsStore((s) => s.error);
  const refreshReports = useReportsStore((s) => s.refreshReports);

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

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <View style={styles.mapArea}>
        {/* Full Screen Waze-style Map */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          userInterfaceStyle={dark ? "dark" : "light"}
          customMapStyle={dark ? darkMapStyle : []}
          initialRegion={{
            latitude: 20.6767,
            longitude: -103.3472,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
        >
          {reports.map((report) => (
            <ReportMapMarker key={report.id} report={report} onPress={() => handleSelectReport(report)} />
          ))}
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
            ]}
          >
            <Ionicons name="location" size={16} color={colors.accentText} />
            <Text style={[styles.locationPillText, { color: colors.text }]}>
              Jalisco
            </Text>
            <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.activeCount, { color: colors.muted }]}>
              {loading ? "Cargando…" : `${reports.length} reportes`}
            </Text>
          </View>
          {loading && !error && <ActivityIndicator color={colors.primary} style={{ marginTop: space.sm }} />}
          {!!error && <ErrorBanner message={error} retrying={loading} onRetry={() => { void refreshReports(); }} />}
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
              borderColor: colors.border,
              bottom: Math.max(insets.bottom, space.sm) + size.tabBarHeight + space.md,
            },
          ]}
        >
          <Ionicons name="locate" size={22} color={colors.accentText} />
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
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
