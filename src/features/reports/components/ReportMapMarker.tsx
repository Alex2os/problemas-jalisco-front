import { memo, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Marker, type MapMarker, type MapMarkerProps } from "react-native-maps";
import { CategoryIcon, CATEGORY_ICON_FONTS } from "./CategoryIcon";
import { useFonts } from "expo-font";
import { categoryDefFor } from "@/constants/report-categories";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { Report } from "@/services/types";

export const ReportMapMarker = memo(function ReportMapMarker({ report, onPress }: {
  report: Report;
  onPress?: MapMarkerProps["onPress"];
}) {
  const { colors } = useAppTheme();
  const category = categoryDefFor(report.category || report.type);
  const [fontLoaded] = useFonts(CATEGORY_ICON_FONTS);
  const marker = useRef<MapMarker>(null);
  const [snapshot, setSnapshot] = useState("");
  const [laidOut, setLaidOut] = useState(false);
  const appearance = `${category.id}:${category.color}:${colors.surface}:${fontLoaded}`;

  useEffect(() => {
    if (!fontLoaded || !laidOut) return;
    let secondFrame: number | undefined;
    const firstFrame = requestAnimationFrame(() => {
      if (Platform.OS === "android") marker.current?.redraw();
      secondFrame = requestAnimationFrame(() => setSnapshot(appearance));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    };
  }, [appearance, fontLoaded, laidOut]);

  return (
    <Marker
      ref={marker}
      coordinate={{ latitude: report.latitude, longitude: report.longitude }}
      anchor={{ x: 0.5, y: 0.9 }}
      title={category.label}
      description={report.ubication}
      accessibilityLabel={`${category.label}. ${report.ubication}`}
      onPress={onPress}
      tracksViewChanges={!laidOut || snapshot !== appearance}
    >
      <View collapsable={false} pointerEvents="none" style={styles.marker}
        onLayout={() => setLaidOut(true)}>
        <View style={[styles.head, { backgroundColor: colors.surface, borderColor: category.color }]}>
          {fontLoaded && <CategoryIcon category={category} size={24} color={category.color}
            allowFontScaling={false} style={styles.icon} />}
        </View>
        <View style={[styles.tip, { borderTopColor: category.color }]} />
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  marker: { width: 52, height: 60, paddingTop: 4, alignItems: "center" },
  head: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignSelf: "center", alignItems: "center", justifyContent: "center" },
  icon: { width: 24, height: 24, lineHeight: 24, includeFontPadding: false, textAlign: "center", textAlignVertical: "center" },
  tip: { width: 0, height: 0, marginTop: -2, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent", alignSelf: "center" },
});
