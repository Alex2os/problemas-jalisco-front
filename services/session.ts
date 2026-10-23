import * as SecureStore from "expo-secure-store";
import { apiCache } from "./cache";
import type { Report } from "./types";

export const sessionKey = "session:authenticated";
export const sessionVersion = () =>
  apiCache.peek<number>("session:version") || 0;
export const loadSession = () =>
  apiCache.get(
    sessionKey,
    async () => !!(await SecureStore.getItemAsync("auth_token")),
  );

// Called only after the actual token is saved/deleted. No token or identity is invented here.
export function setAuthSession(authenticated: boolean) {
  apiCache.set("session:version", sessionVersion() + 1);
  apiCache.invalidate("reports:");
  apiCache.invalidate("report:");
  apiCache.invalidate("comments:");
  apiCache.invalidate("status-history:");
  apiCache.patch<Report>("entity:report:", (report) => ({
    ...report,
    liked_by_me: false,
    can_manage: false,
  }));
  apiCache.set("session:error", "");
  apiCache.set(sessionKey, authenticated);
}
