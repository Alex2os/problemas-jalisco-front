import { apiCache } from "@/src/services/cache";
import { reportKey } from "@/src/services/reportState";
import { loadSession, sessionKey } from "@/src/services/session";
import type { Report } from "@/src/services/types";
import { useCallback, useEffect, useSyncExternalStore } from "react";

export function useCacheValue<T>(key: string) {
  const subscribe = useCallback(
    (listener: () => void) => apiCache.subscribe(key, listener),
    [key],
  );
  const snapshot = useCallback(() => apiCache.peek<T>(key), [key]);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
export function useLiveReport(report: Report | undefined) {
  return useCacheValue<Report>(reportKey(report?.id || 0)) || report;
}
export function useAuthSession() {
  const authenticated = useCacheValue<boolean>(sessionKey);
  useEffect(() => {
    void loadSession().catch(() => {
      apiCache.set(
        "session:error",
        "No se pudo leer la sesión. Intenta iniciar sesión de nuevo.",
      );
    });
  }, []);
  return authenticated === true;
}
