import React, { useCallback, useState, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { createAddressLookup, type AddressLookupState } from "@/src/services/address-lookup";
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

  const map = useRef<MapView>(null);
  const position = useRef<Region>({
    latitude: initialLatitude, longitude: initialLongitude,
    latitudeDelta: 0.005, longitudeDelta: 0.005,
  });
  const lookup = useRef<ReturnType<typeof createAddressLookup> | null>(null);
  const active = useRef(false);
  const gpsPending = useRef(false);
  const movement = useRef(0);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [addressState, setAddressState] = useState<AddressLookupState>({
    latitude: initialLatitude, longitude: initialLongitude,
    address, colonia, municipality, status: address ? "ready" : "loading",
  });

  useFocusEffect(useCallback(() => {
    active.current = true;
    setLocating(gpsPending.current);
    const controller = createAddressLookup({
      lookup: async (coordinates) => {
        // Android's native geocoder also requires foreground location permission.
        const permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted) {
          const requested = await Location.requestForegroundPermissionsAsync();
          if (!requested.granted) throw new Error("Location permission denied");
        }
        return Location.reverseGeocodeAsync(coordinates);
      },
      onChange: (state) => {
        setAddressState(state);
        onLocationChange({
          latitude: state.latitude, longitude: state.longitude,
          address: state.address, colonia: state.colonia, municipality: state.municipality,
        });
      },
    });
    lookup.current = controller;
    controller.select(position.current);
    return () => {
      active.current = false;
      controller.dispose();
      lookup.current = null;
    };
  }, [onLocationChange]));

  const handleAutoLocate = async () => {
    if (gpsPending.current) return;
    gpsPending.current = true;
    const startingMovement = movement.current;
    setLocating(true);
    setGpsError("");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error("Permite el acceso a tu ubicación para usar el GPS.");
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!active.current || startingMovement !== movement.current) return;
      const next = { ...position.current, latitude: current.coords.latitude, longitude: current.coords.longitude };
      position.current = next;
      lookup.current?.select(next);
      map.current?.animateToRegion(next);
    } catch (failure) {
      if (active.current) setGpsError(failure instanceof Error ? failure.message : "No se pudo obtener tu ubicación.");
    } finally {
      gpsPending.current = false;
      if (active.current) setLocating(false);
    }
  };

  const handleRegionChange = (region: Region) => {
    if (region.latitude !== position.current.latitude || region.longitude !== position.current.longitude) movement.current++;
    position.current = region;
    lookup.current?.select(region);
  };
  const findingAddress = addressState.status === "loading";
  const addressTitle = findingAddress ? "Localizando calle…" : addressState.status === "error"
    ? "No se pudo obtener la calle" : addressState.address || "Ubicación seleccionada";
  const addressSubtitle = findingAddress ? "Buscando la dirección del punto seleccionado."
    : addressState.status === "error" || addressState.status === "unavailable"
      ? "Puedes reintentar la búsqueda o confirmar este punto."
      : [addressState.colonia, addressState.municipality].filter(Boolean).join(", ");

  return (
    <View style={[styles.container, style]}>
      {/* Map with Center Pin */}
      <View style={[styles.mapWrap, { borderColor: colors.border }]}>
        <MapView
          style={StyleSheet.absoluteFill}
          ref={map}
          initialRegion={{ latitude: initialLatitude, longitude: initialLongitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChange}
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
          disabled={locating}
          accessibilityState={{ disabled: locating, busy: locating }}
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
          {findingAddress ? <ActivityIndicator color={colors.accent} accessibilityLabel="Buscando calle" /> : <Ionicons name="location-sharp" size={20} color={colors.accent} />}
          <View style={{ flex: 1 }}>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {addressTitle}
            </Text>
            <Text style={[styles.addressSub, { color: colors.muted }]}>
              {addressSubtitle}
            </Text>
          </View>
        </View>
        {(addressState.status === "error" || addressState.status === "unavailable") && (
          <Pressable accessibilityRole="button" accessibilityLabel="Reintentar búsqueda de calle"
            onPress={() => lookup.current?.select(position.current, true)}
            style={{ minHeight: 48, justifyContent: "center" }}>
            <Text style={{ color: colors.accent, fontWeight: "700" }}>Reintentar búsqueda</Text>
          </Pressable>
        )}
        {!!gpsError && <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: space.sm }}>{gpsError}</Text>}
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
