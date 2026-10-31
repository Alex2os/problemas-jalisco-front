import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import { radius, space } from "@/constants/design";
import { es } from "@/constants/es";
import { darkMapStyle } from "@/constants/map-theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { Report } from "@/services/types";
import { GoogleMapsButton } from "./GoogleMapsButton";
import { ReportMapMarker } from "./ReportMapMarker";

export function ReportLocationSection({ report }: { report: Report }) {
  const { colors, dark } = useAppTheme();

  return (
    <View
      style={[
        styles.sectionCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {es.detail.locationTitle}
      </Text>

      <View style={styles.locationTextRow}>
        <Ionicons name="location-sharp" size={16} color={colors.accentText} />
        <Text style={[styles.locationText, { color: colors.text }]}>
          {report.ubication}
        </Text>
      </View>

      <View style={styles.miniMapWrapper}>
        <MapView
          style={StyleSheet.absoluteFill}
          userInterfaceStyle={dark ? "dark" : "light"}
          customMapStyle={dark ? darkMapStyle : []}
          initialRegion={{
            latitude: report.latitude,
            longitude: report.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <ReportMapMarker report={report} />
        </MapView>
      </View>
      <GoogleMapsButton report={report} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: radius.group,
    borderWidth: 1,
    padding: space.md,
    gap: space.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  locationTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  miniMapWrapper: {
    height: 160,
    borderRadius: radius.md,
    overflow: "hidden",
    marginTop: space.xs,
  },
});

