import React from "react";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import { radius, space } from "@/constants/design";
import { darkMapStyle } from "@/constants/map-theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { Report } from "@/services/types";
import { GoogleMapsButton } from "./GoogleMapsButton";
import { ReportMapMarker } from "./ReportMapMarker";

export function ReportLocationSection({ report }: { report: Report }) {
  const { dark } = useAppTheme();

  return (
    <View style={styles.section}>
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
  section: {
    paddingTop: space.xs,
    gap: space.sm,
  },
  miniMapWrapper: {
    height: 160,
    borderRadius: radius.md,
    overflow: "hidden",
  },
});

