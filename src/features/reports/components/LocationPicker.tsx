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
import { createAddressLookup, type AddressLookupState } from "@/services/address-lookup";
import { GetLocationAddress, DEFAULT_JALISCO_COORDINATES } from "@/services/get-location-address";
import { ErrorBanner } from "@/components/ErrorBanner";
import MapView, { type Region } from "react-native-maps";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radius, size, space } from "@/constants/design";

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
  initialLatitude = DEFAULT_JALISCO_COORDINATES.latitude,
  initialLongitude = DEFAULT_JALISCO_COORDINATES.longitude,
  address,
  colonia = "",
  municipality = "",
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
      lookup: GetLocationAddress,
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
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error("Permite el acceso a tu ubicación para usar el GPS.");
      const current = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("La ubicación está tardando demasiado. Intenta de nuevo.")), 15000); }),
      ]);
      if (!active.current || startingMovement !== movement.current) return;
      const next = { ...position.current, latitude: current.coords.latitude, longitude: current.coords.longitude };
      position.current = next;
      lookup.current?.move(next);
      if (map.current) map.current.animateToRegion(next);
      else lookup.current?.select(next);
    } catch (failure) {
      if (active.current) setGpsError(failure instanceof Error ? failure.message : "No se pudo obtener tu ubicación.");
    } finally {
      clearTimeout(timeout);
      gpsPending.current = false;
      if (active.current) setLocating(false);
    }
  };

  const handleRegionChange = (region: Region) => {
    if (region.latitude !== position.current.latitude || region.longitude !== position.current.longitude) movement.current++;
    position.current = region;
    lookup.current?.move(region);
  };
  const findingAddress = addressState.status === "loading" && !addressState.error;
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
          onRegionChangeComplete={(region) => { handleRegionChange(region); lookup.current?.select(region); }}
        />

        {/* Center Target Pin */}
        <View pointerEvents="none" style={styles.centerPinWrap}>
          <Ionicons name="location" size={42} color={colors.accent} />
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
          style={[styles.gpsBtn, { backgroundColor: colors.surface }]}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Ionicons name="locate" size={22} color={colors.accent} />
          )}
        </Pressable>
      </View>

      {/* Address for the selected pin, independent of device location permission. */}
      <View
        style={[
          styles.addressCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.addressHeader}>
          {findingAddress && !locating ? <ActivityIndicator color={colors.accent} accessibilityLabel="Buscando calle" /> : <Ionicons name="location-sharp" size={20} color={colors.accent} />}
          <View style={{ flex: 1 }}>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {addressTitle}
            </Text>
            <Text style={[styles.addressSub, { color: colors.muted }]}>
              {addressSubtitle}
            </Text>
          </View>
        </View>
        {!!addressState.error && <ErrorBanner message={addressState.error}
          variant={addressState.status === "unavailable" ? "warning" : "danger"}
          retrying={addressState.status === "loading"}
          onRetry={() => lookup.current?.select(position.current, true)} />}
        {!!gpsError && <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: space.sm }}>{gpsError}</Text>}
        <Text style={[styles.attribution, { color: colors.muted }]}>Direcciones © OpenStreetMap contributors</Text>
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
  gpsBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: size.touch,
    height: size.touch,
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
  attribution: { fontSize: 11, marginTop: space.sm },
});
