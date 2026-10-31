import { create } from "zustand";
import { apiCache } from "@/services/cache";
import { CreateReport } from "@/services/create-report";
import { GetAllReports } from "@/services/get-all-reports";
import { GetReportById } from "@/services/get-report-by-id";
import { normalizeReport } from "@/services/normalize-report";
import { SetReportLike } from "@/services/report-interactions";
import { reportKey } from "@/services/report-state";
import { loadSession, sessionVersion } from "@/services/session";
import type { Report, ReportDraft } from "@/services/types";

interface ReportsState {
  reports: Report[];
  isLoading: boolean;
  error: string;
  initialize: () => Promise<void>;
  submitReport: (draft: ReportDraft) => Promise<Pick<Report, "id" | "folio">>;
  toggleUpvote: (id: number) => Promise<void>;
  refreshReports: (background?: boolean) => Promise<void>;
}
let initialized = false;
let readEpoch = 0;
let pendingRead: { version: number; promise: Promise<void> } | undefined;
const subscriptions = new Map<number, () => void>();

function watchReports(reports: Report[]) {
  const ids = new Set(reports.map((report) => report.id));
  for (const [id, unsubscribe] of subscriptions) {
    if (!ids.has(id)) { unsubscribe(); subscriptions.delete(id); }
  }
  for (const id of ids) {
    if (subscriptions.has(id)) continue;
    subscriptions.set(id, apiCache.subscribe(reportKey(id), () => {
      const updated = apiCache.peek<Report>(reportKey(id));
      if (!updated) return;
      useReportsStore.setState((state) => {
        const reports = state.reports.map((report) => report.id === id ? updated : report);
        return { reports };
      });
    }));
  }
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: [], isLoading: true, error: "",
  initialize: async () => {
    if (initialized) return;
    initialized = true;
    apiCache.subscribe("session:version", () => {
      readEpoch++;
      watchReports([]);
      set({ reports: [], error: "" });
      void get().refreshReports();
    });
    try { await loadSession(); }
    catch { set({ error: "No se pudo leer la sesión. Inicia sesión de nuevo." }); }
    await get().refreshReports();
  },
  refreshReports: (background = false) => {
    const version = sessionVersion();
    if (pendingRead?.version === version) return pendingRead.promise;
    const request = ++readEpoch;
    if (!background) set({ isLoading: true });
    let promise: Promise<void>;
    promise = (async () => {
      try {
        const fetched = await GetAllReports(true);
        if (version !== sessionVersion() || request !== readEpoch) return;
        const reports = fetched.map((report) => apiCache.peek<Report>(reportKey(report.id)) || report);
        watchReports(reports);
        set({ reports, error: "" });
      } catch (error) {
        if (version === sessionVersion() && request === readEpoch)
          set({ error: error instanceof Error ? error.message : "No se pudieron cargar los reportes." });
      } finally {
        if (request === readEpoch) set({ isLoading: false });
        if (pendingRead?.version === version && request === readEpoch) pendingRead = undefined;
      }
    })();
    pendingRead = { version, promise };
    return promise;
  },
  submitReport: async (draft) => {
    if (!draft.category) throw new Error("Selecciona una categoría.");
    if (draft.latitude === null || draft.longitude === null) throw new Error("Selecciona la ubicación del problema.");
    if (draft.description.trim().length > 255) throw new Error("La descripción debe tener hasta 255 caracteres.");
    const version = sessionVersion();
    const response = await CreateReport(draft.category, draft.description, draft.latitude, draft.longitude, draft.photos);
    if (!Number.isSafeInteger(response?.report_id) || response.report_id <= 0)
      throw new Error("No se pudo confirmar el reporte. Consulta Mis reportes antes de volver a enviarlo.");
    let report: Report;
    try {
      report = response.report ? normalizeReport(response.report) : await GetReportById(response.report_id, true);
    } catch {
      if (version !== sessionVersion()) throw new Error("La sesión cambió. Consulta tus reportes al iniciar sesión.");
      // Creation is already confirmed. A failed detail read must not invite a duplicate submission.
      void get().refreshReports(true);
      return { id: response.report_id, folio: String(response.report_id) };
    }
    if (version !== sessionVersion()) throw new Error("La sesión cambió. Consulta tus reportes al iniciar sesión.");
    readEpoch++;
    pendingRead = undefined;
    apiCache.set(reportKey(report.id), report);
    set({ isLoading: false });
    set((state) => {
      const reports = [report, ...state.reports.filter((item) => item.id !== report.id)];
      watchReports(reports);
      return { reports };
    });
    return report;
  },
  toggleUpvote: async (id) => {
    const report = apiCache.peek<Report>(reportKey(id)) || get().reports.find((item) => item.id === id);
    if (report) await SetReportLike(id, !report.liked_by_me);
  },
}));
