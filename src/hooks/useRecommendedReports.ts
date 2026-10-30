import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useCacheValue } from "./useReportState";
import { GetRecommendedReports, type RecommendationLocation } from "@/services/get-recommended-reports";
import { loadSession, sessionVersion } from "@/services/session";
import type { Report, ReportRecommendation } from "@/services/types";

export function useRecommendedReports(enabled: boolean, searching: boolean, location?: RecommendationLocation) {
  const identity = useCacheValue<number>("session:version") || 0;
  const generation = useRef(0);
  const active = useRef(false);
  const pending = useRef<symbol | null>(null);
  const [state, setState] = useState({
    identity, reports: [] as Report[], recommendations: [] as ReportRecommendation[],
    nextOffset: null as number | null, loading: true, loadingMore: false, error: "",
  });
  const latitude = location?.latitude;
  const longitude = location?.longitude;

  const load = useCallback(async (offset = 0) => {
    if (!active.current || pending.current) return;
    const operation = Symbol();
    pending.current = operation;
    const request = generation.current;
    setState((current) => ({ ...current, loading: offset === 0, loadingMore: offset > 0 }));
    try {
      await loadSession();
      if (request !== generation.current || identity !== sessionVersion()) return;
      const page = await GetRecommendedReports(offset,
        latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined, true);
      if (request !== generation.current || identity !== sessionVersion()) return;
      setState((current) => ({
        ...current, identity,
        reports: offset === 0 ? page.reports : [...new Map([...current.reports, ...page.reports].map((report) => [report.id, report])).values()],
        recommendations: offset === 0 ? page.recommendations : [...new Map([...current.recommendations, ...page.recommendations].map((item) => [item.report_id, item])).values()],
        nextOffset: page.next_offset, error: "",
      }));
    } catch (failure) {
      if (request === generation.current && identity === sessionVersion())
        setState((current) => ({ ...current, error: failure instanceof Error ? failure.message : "No se pudieron cargar las recomendaciones." }));
    } finally {
      if (pending.current === operation) pending.current = null;
      if (request === generation.current)
        setState((current) => ({ ...current, loading: false, loadingMore: false }));
    }
  }, [identity, latitude, longitude]);

  useFocusEffect(useCallback(() => {
    if (!enabled) return;
    active.current = true;
    setState({ identity, reports: [], recommendations: [], nextOffset: null, loading: true, loadingMore: false, error: "" });
    void load();
    return () => { active.current = false; generation.current++; pending.current = null; };
  }, [enabled, identity, load]));

  const loadMore = useCallback(() => {
    if (state.nextOffset !== null) void load(state.nextOffset);
  }, [load, state.nextOffset]);

  // Search must include the full recommendation list, not just the first page.
  useEffect(() => {
    if (enabled && searching && !state.loading && !state.loadingMore && !state.error && state.nextOffset !== null)
      loadMore();
  }, [enabled, searching, state.loading, state.loadingMore, state.error, state.nextOffset, loadMore]);

  return {
    ...state,
    reports: state.identity === identity ? state.reports : [],
    recommendations: state.identity === identity ? state.recommendations : [],
    refresh: () => { void load(); }, loadMore,
  };
}
