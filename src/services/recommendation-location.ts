import * as Location from "expo-location";
import type { RecommendationLocation } from "@/services/get-recommended-reports";

export type LocationResult =
  | { status: "ok"; location: RecommendationLocation }
  | { status: "denied"; canAskAgain: boolean }
  | { status: "error" };

// In-memory only: survives tab/filter changes, cleared when the app closes.
let cachedLocation: RecommendationLocation | undefined;
let pending: Promise<LocationResult> | null = null;

export function getCachedRecommendationLocation() {
  return cachedLocation;
}

async function resolve(): Promise<LocationResult> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    let permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== "granted" && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (permission.status !== "granted") {
      return { status: "denied", canAskAgain: permission.canAskAgain };
    }
    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("location-timeout")), 15000);
      }),
    ]);
    cachedLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    return { status: "ok", location: cachedLocation };
  } catch {
    return { status: "error" };
  } finally {
    clearTimeout(timeout);
  }
}

export function resolveRecommendationLocation(): Promise<LocationResult> {
  if (cachedLocation) return Promise.resolve({ status: "ok", location: cachedLocation });
  if (!pending) {
    pending = resolve().finally(() => {
      pending = null;
    });
  }
  return pending;
}
