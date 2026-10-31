import { apiRequest } from "./api";
import { isInJaliscoBounds } from "./get-location-address";

export interface LocationSearchResult {
  name: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
  address: string;
  street: string | null;
  street_number: string | null;
  colonia: string | null;
  municipality: string | null;
}

export function getLocationSearchError(query: string): string {
  if (query.length > 200) return "La búsqueda debe tener hasta 200 caracteres.";
  if (query.replace(/\s+/g, " ").trim().length < 3)
    return "Escribe al menos 3 caracteres para buscar una ubicación.";
  return "";
}

export async function SearchLocations(query: string): Promise<LocationSearchResult[]> {
  const error = getLocationSearchError(query);
  if (error) throw new Error(error);
  const normalized = query.replace(/\s+/g, " ").trim();
  const data = await apiRequest<{ locations: LocationSearchResult[] }>(
    `/locations/search?query=${encodeURIComponent(normalized)}`, {}, true,
  );
  if (!Array.isArray(data?.locations) || data.locations.length > 5
    || data.locations.some((location) => !location
      || !isInJaliscoBounds(location.latitude, location.longitude)
      || [location.name, location.formatted_address, location.address].some((value) => typeof value !== "string" || !value.trim())
      || [location.street, location.street_number, location.colonia, location.municipality]
        .some((value) => value !== null && typeof value !== "string")))
    throw new Error("No se pudieron leer las ubicaciones del servidor. Intenta de nuevo.");
  return data.locations;
}
