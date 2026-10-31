import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { ReportStepFooter } from "@/features/reports/components/ReportStepFooter";
import { LocationPicker } from "@/features/reports/components/LocationPicker";
import { space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDraftStore } from "@/store/useDraftStore";
import { DEFAULT_JALISCO_COORDINATES, isInJaliscoBounds } from "@/services/get-location-address";

export default function UbicacionScreen() {
  const { colors } = useAppTheme();

  const draftLatitude = useDraftStore((s) => s.latitude);
  const draftLongitude = useDraftStore((s) => s.longitude);
  const latitude = draftLatitude ?? DEFAULT_JALISCO_COORDINATES.latitude;
  const longitude = draftLongitude ?? DEFAULT_JALISCO_COORDINATES.longitude;
  const address = useDraftStore((s) => s.address);
  const colonia = useDraftStore((s) => s.colonia);
  const municipality = useDraftStore((s) => s.municipality);

  const setLocation = useDraftStore((s) => s.setLocation);
  const setStep = useDraftStore((s) => s.setStep);

  const isLocationValid = draftLatitude !== null && draftLongitude !== null && isInJaliscoBounds(draftLatitude, draftLongitude);

  const handleConfirm = () => {
    if (!isLocationValid) {
      return;
    }
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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

      <ReportStepFooter
        title={es.location.confirm}
        disabled={!isLocationValid}
        onPress={handleConfirm}
      />
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
