import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";
import { IconButton } from "@/components/ui/AppUi";
import { radius, size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { RecommendationLocation } from "@/services/get-recommended-reports";

export interface RecommendationLocationBannerProps {
  location?: RecommendationLocation;
  onLocationChange: (location?: RecommendationLocation) => void;
}

export function RecommendationLocationBanner({
  location,
  onLocationChange,
}: RecommendationLocationBannerProps) {
  const { colors } = useAppTheme();
  const [locating, setLocating] = useState(false);
  const locationPending = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function enableLocation() {
    if (locationPending.current) return;
    locationPending.current = true;
    setLocating(true);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        return;
      }
      const position = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error("location-timeout")), 15000);
        }),
      ]);
      if (mounted.current) {
        onLocationChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }
    } catch {
      // Keep recommendations available without location; the action can be retried.
    } finally {
      clearTimeout(timeout);
      locationPending.current = false;
      if (mounted.current) setLocating(false);
    }
  }

  return (
    <>
      <Text style={[styles.recommendationIntro, { color: colors.textSecondary }]}>
        {location
          ? "Tu ubicación nos ayuda a recomendarte reportes cercanos y más relevantes para ti."
          : "Activa tu ubicación para recibir mejores recomendaciones de reportes cerca de ti."}
      </Text>
      <View style={styles.locationActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            location
              ? "Actualizar mi ubicación"
              : "Activar ubicación para recibir recomendaciones cercanas"
          }
          accessibilityState={{ disabled: locating, busy: locating }}
          disabled={locating}
          onPress={() => {
            void enableLocation();
          }}
          style={[styles.locationAction, { backgroundColor: colors.primary }]}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Ionicons name="location" size={20} color={colors.onPrimary} />
          )}
          <Text style={[styles.locationActionText, { color: colors.onPrimary }]}>
            {locating
              ? "Buscando ubicación…"
              : location
                ? "Actualizar ubicación"
                : "Activar ubicación"}
          </Text>
        </Pressable>
        {location && (
          <IconButton
            icon="x"
            label="Dejar de usar mi ubicación"
            disabled={locating}
            onPress={() => onLocationChange(undefined)}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  recommendationIntro: { fontSize: 13, lineHeight: 20, textAlign: "center" },
  locationActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: space.xs,
  },
  locationAction: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    minHeight: size.touch,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.control,
  },
  locationActionText: { fontSize: 15, fontWeight: "700", flexShrink: 1 },
});

