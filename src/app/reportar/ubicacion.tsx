import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { ReportStepFooter } from "@/src/components/ReportStepFooter";
import { LocationPicker } from "@/src/components/LocationPicker";
import { space } from "@/src/constants/design";
import { es } from "@/src/constants/es";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useDraftStore } from "@/src/store/useDraftStore";

export default function UbicacionScreen() {
  const { colors } = useAppTheme();

  const latitude = useDraftStore((s) => s.latitude) || 20.6767;
  const longitude = useDraftStore((s) => s.longitude) || -103.3472;
  const address = useDraftStore((s) => s.address);
  const colonia = useDraftStore((s) => s.colonia);
  const municipality = useDraftStore((s) => s.municipality);

  const setLocation = useDraftStore((s) => s.setLocation);
  const setStep = useDraftStore((s) => s.setStep);

  const handleConfirm = () => {
    setStep(3);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/reportar/evidencia");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>
          {es.location.title}
        </Text>
        <Text style={[styles.hint, { color: colors.muted }]}>
          {es.location.hint}
        </Text>

        <LocationPicker
          initialLatitude={latitude}
          initialLongitude={longitude}
          address={address}
          colonia={colonia}
          municipality={municipality}
          onLocationChange={setLocation}
        />
      </ScrollView>

      <ReportStepFooter title={es.location.confirm} onPress={handleConfirm} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: space.lg,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  hint: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: space.md,
    lineHeight: 20,
  },
});
