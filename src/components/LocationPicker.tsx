import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import MapView, { type Region } from "react-native-maps";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { radius, space, shadows } from "@/src/constants/design";

export interface LocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  address: string;
  colonia?: string;
  municipality?: string;
  onLocationChange: (loc: {
    latitude: number;
    longitude: number;
    address?: string;
    colonia?: string;
    municipality?: string;
  }) => void;
  style?: StyleProp<ViewStyle>;
}

export function LocationPicker({
  initialLatitude = 20.6767,
  initialLongitude = -103.3472,
  address,
  colonia = "",
  municipality = "Guadalajara",
  onLocationChange,
  style,
}: LocationPickerProps) {
  const { colors } = useAppTheme();

  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });

  const [locating, setLocating] = useState(false);
  const geocodeRequest = useRef(0);

  const handleAutoLocate = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocating(false);
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const newCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(newCoords);
      void reverseGeocode(newCoords.latitude, newCoords.longitude);
    } catch {
      // Keep default Guadalajara coordinates
    } finally {
      setLocating(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    const request = ++geocodeRequest.current;
    onLocationChange({ latitude: lat, longitude: lng });
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (request !== geocodeRequest.current) return;
      if (results && results.length > 0) {
        const item = results[0];
        const street = item.street ? `${item.street} ${item.streetNumber || ""}`.trim() : "";
        const district = item.district || item.subregion || colonia || "";
        const city = item.city || municipality || "Guadalajara";
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: street || address || "Vía pública",
          colonia: district,
          municipality: city,
        });
      } else {
        onLocationChange({ latitude: lat, longitude: lng });
      }
    } catch {
      // Coordinates were already selected; the API resolves the address on submission.
    }
  };

  const handleRegionChangeComplete = (region: Region) => {
    setCoords({ latitude: region.latitude, longitude: region.longitude });
    void reverseGeocode(region.latitude, region.longitude);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Map with Center Pin */}
      <View style={[styles.mapWrap, { borderColor: colors.border }]}>
        <MapView
          style={StyleSheet.absoluteFill}
          region={{
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
        />

        {/* Center Target Pin */}
        <View pointerEvents="none" style={styles.centerPinWrap}>
          <Ionicons name="location" size={42} color={colors.accent} />
          <View style={styles.pinShadow} />
        </View>

        {/* GPS Locate Button */}
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            void handleAutoLocate();
          }}
          accessibilityRole="button"
          accessibilityLabel="Centrar en mi ubicación GPS"
          style={[styles.gpsBtn, { backgroundColor: colors.surface }, shadows.md as any]}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Ionicons name="locate" size={22} color={colors.accent} />
          )}
        </Pressable>
      </View>

      {/* Visible Address Information Card (Restored Context) */}
      <View
        style={[
          styles.addressCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadows.sm as any,
        ]}
      >
        <View style={styles.addressHeader}>
          <Ionicons name="location-sharp" size={20} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {address || "Localizando calle..."}
            </Text>
            <Text style={[styles.addressSub, { color: colors.muted }]}>
              {colonia ? `Col. ${colonia}, ` : ""}{municipality}
            </Text>
          </View>
        </View>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.sm,
  },
  mapWrap: {
    height: 280,
    borderRadius: radius.group,
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  centerPinWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -21,
    marginTop: -38,
    alignItems: "center",
  },
  pinShadow: {
    width: 6,
    height: 3,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginTop: -3,
  },
  gpsBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addressCard: {
    borderRadius: radius.group,
    borderWidth: 1,
    padding: space.md,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  addressText: {
    fontSize: 15,
    fontWeight: "800",
  },
  addressSub: {
    fontSize: 13,
    marginTop: 1,
  },
});
