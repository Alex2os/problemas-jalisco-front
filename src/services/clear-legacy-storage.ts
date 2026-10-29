import AsyncStorage from "@react-native-async-storage/async-storage";

// Discard data saved by the old demo implementation. It is never read or uploaded.
export async function clearLegacyStorage() {
  await AsyncStorage.multiRemove([
    "@problemas_jalisco_reports_v1",
    "@problemas_jalisco_user_reports",
    "@problemas_jalisco_offline_queue",
    "@problemas_jalisco_active_draft",
    "@problemas_jalisco_comments_v1",
  ]);
}
