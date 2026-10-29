import * as SecureStore from "expo-secure-store";
import { apiCache } from "./cache";
import type { Report } from "./types";

export interface SessionUser { id: number; username: string; email: string }
export const sessionKey = "session:authenticated";
export const sessionUserKey = "session:user";
export const sessionVersion = () => apiCache.peek<number>("session:version") || 0;

// Claims are used for display only; the API authorizes every authenticated operation.
export function userFromToken(token: string): SessionUser | undefined {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = atob(part.padEnd(Math.ceil(part.length / 4) * 4, "="));
    const claims = JSON.parse(decodeURIComponent(Array.from(bytes, (char) =>
      `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")));
    const id = Number(claims.user_id);
    if (!Number.isSafeInteger(id) || id <= 0 || !claims.exp || claims.exp * 1000 <= Date.now()) return;
    return { id, username: claims.username || "", email: claims.user_email || "" };
  } catch { return; }
}

export const loadSession = () => apiCache.get(sessionKey, async () => {
  const version = sessionVersion();
  const token = await SecureStore.getItemAsync("auth_token");
  if (version !== sessionVersion()) return apiCache.peek<boolean>(sessionKey) === true;
  const user = token ? userFromToken(token) : undefined;
  apiCache.set(sessionUserKey, user);
  if (token && !user) await SecureStore.deleteItemAsync("auth_token");
  return !!user;
});

export function setAuthSession(authenticated: boolean, user?: SessionUser) {
  const version = sessionVersion() + 1;
  apiCache.invalidate("reports:");
  apiCache.invalidate("report:");
  apiCache.invalidate("comments:");
  apiCache.invalidate("status-history:");
  apiCache.patch<Report>("entity:report:", (report) => ({ ...report, liked_by_me: false, can_manage: false }));
  apiCache.set(sessionUserKey, authenticated ? user : undefined);
  apiCache.set("session:error", "");
  apiCache.set(sessionKey, authenticated);
  // Publish the identity change after clearing old pending queries and permissions.
  apiCache.set("session:version", version);
}
