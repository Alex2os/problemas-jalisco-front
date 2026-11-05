import { useCallback, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuthSession, useCacheValue, useLiveReport } from "./useReportState";
import { useReportsStore } from "@/store/useReportsStore";
import { GetReportById } from "@/services/get-report-by-id";
import { loadSession, sessionVersion } from "@/services/session";
import type { Report } from "@/services/types";

export function useBackendReports() {
  const refresh = useReportsStore((state) => state.refreshReports);
  const identity = useCacheValue<number>("session:version") || 0;
  useFocusEffect(useCallback(() => {
    let active = true;
    const reload = () => {
      if (active && AppState.currentState === "active" && identity === sessionVersion()) void refresh(true);
    };
    void loadSession().then(() => { if (active) void refresh(useReportsStore.getState().reports.length > 0); }).catch(() => {
      if (active) useReportsStore.setState({ error: "No se pudo leer la sesión.", isLoading: false });
    });
    const timer = setInterval(reload, 15000);
    const subscription = AppState.addEventListener("change", reload);
    return () => { active = false; clearInterval(timer); subscription.remove(); };
  }, [refresh, identity]));
}

export function useBackendReport(id: string) {
  useAuthSession();
  const identity = useCacheValue<number>("session:version") || 0;
  const [fetched, setFetched] = useState<Report>();
  const report = useLiveReport(fetched?.id === Number(id) ? fetched : undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useFocusEffect(useCallback(() => {
    let active = true;
    let pending = false;
    const load = async (background = false) => {
      if (pending) return;
      pending = true;
      if (!background) setLoading(true);
      try {
        if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) throw new Error("El reporte no es válido.");
        const result = await GetReportById(id, true);
        if (active && identity === sessionVersion()) { setFetched(result); setError(""); }
      } catch (failure) {
        if (active && identity === sessionVersion()) setError(failure instanceof Error ? failure.message : "No se pudo cargar el reporte.");
      } finally {
        pending = false;
        if (active) setLoading(false);
      }
    };
    void load();
    const refresh = () => { if (AppState.currentState === "active") void load(true); };
    const timer = setInterval(refresh, 15000);
    const subscription = AppState.addEventListener("change", refresh);
    return () => { active = false; clearInterval(timer); subscription.remove(); };
  }, [id, identity]));
  return { report, loading, error };
}
