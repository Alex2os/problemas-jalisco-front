import { apiRequest } from "./api";
import type { Coordinates, StreetAddress } from "./address-lookup";

interface LocationAddress extends Coordinates {
  available: boolean;
  formatted_address: string | null;
  address: string | null;
  street: string | null;
  street_number: string | null;
  colonia: string | null;
  municipality: string | null;
}

export const DEFAULT_JALISCO_COORDINATES = {
  latitude: 20.6767,
  longitude: -103.3472,
};

export const JALISCO_BOUNDS = {
  minLatitude: 18.92,
  maxLatitude: 22.75,
  minLongitude: -105.7,
  maxLongitude: -101.47,
};

export function isInJaliscoBounds(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= JALISCO_BOUNDS.minLatitude &&
    latitude <= JALISCO_BOUNDS.maxLatitude &&
    longitude >= JALISCO_BOUNDS.minLongitude &&
    longitude <= JALISCO_BOUNDS.maxLongitude
  );
}

export async function GetLocationAddress(coordinates: Coordinates): Promise<StreetAddress[]> {
  const { latitude, longitude } = coordinates;
  if (!isInJaliscoBounds(latitude, longitude)) {
    return [];
  }
  const response = await apiRequest<{ location: LocationAddress }>(
    `/locations/reverse?latitude=${latitude}&longitude=${longitude}`, {}, true,
  );
  const location = response?.location;
  if (!location || location.latitude !== latitude || location.longitude !== longitude
    || typeof location.available !== "boolean"
    || [location.formatted_address, location.address, location.street, location.street_number, location.colonia, location.municipality]
      .some((value) => value !== null && typeof value !== "string")
    || (location.available && !location.formatted_address?.trim()))
    throw new Error("No se pudo leer la dirección del servidor. Intenta de nuevo.");
  if (!location.available) return [];
  return [{
    street: location.street, streetNumber: location.street_number,
    name: location.address || location.formatted_address,
    district: location.colonia, city: location.municipality,
  }];
}
