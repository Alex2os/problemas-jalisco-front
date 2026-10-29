import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { MOCK_REPORTS } from "../services/mockReports";
import type { Report, ReportDraft } from "../services/types";

const REPORTS_STORAGE_KEY = "@problemas_jalisco_reports_v1";
const USER_REPORTS_KEY = "@problemas_jalisco_user_reports";
const OFFLINE_QUEUE_KEY = "@problemas_jalisco_offline_queue";

export interface ReportsState {
  reports: Report[];
  userReportIds: number[];
  offlineQueue: ReportDraft[];
  isLoading: boolean;
  isSyncing: boolean;
  filterCategory: string | "todos";
  filterStatus: string | "todos";
  searchQuery: string;

  // Actions
  initialize: () => Promise<void>;
  submitReport: (draft: ReportDraft) => Promise<Report>;
  toggleUpvote: (reportId: number) => void;
  getReportById: (id: number | string) => Report | undefined;
  setFilterCategory: (category: string) => void;
  setFilterStatus: (status: string) => void;
  setSearchQuery: (query: string) => void;
  refreshReports: () => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: MOCK_REPORTS,
  userReportIds: [],
  offlineQueue: [],
  isLoading: false,
  isSyncing: false,
  filterCategory: "todos",
  filterStatus: "todos",
  searchQuery: "",

  initialize: async () => {
    try {
      const [storedReports, storedUserReports, storedQueue] = await Promise.all([
        AsyncStorage.getItem(REPORTS_STORAGE_KEY),
        AsyncStorage.getItem(USER_REPORTS_KEY),
        AsyncStorage.getItem(OFFLINE_QUEUE_KEY),
      ]);

      let allReports = MOCK_REPORTS;
      if (storedReports) {
        const parsed = JSON.parse(storedReports) as Report[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const idMap = new Map<number, Report>();
          allReports.forEach((r) => idMap.set(r.id, r));
          parsed.forEach((r) => idMap.set(r.id, r));
          allReports = Array.from(idMap.values());
        }
      }

      let userIds: number[] = [];
      if (storedUserReports) {
        userIds = JSON.parse(storedUserReports) as number[];
      }

      let queue: ReportDraft[] = [];
      if (storedQueue) {
        queue = JSON.parse(storedQueue) as ReportDraft[];
      }

      set({
        reports: allReports,
        userReportIds: userIds,
        offlineQueue: queue,
      });
    } catch {
      // Storage read failed, rely on default state
    }
  },

  submitReport: async (draft: ReportDraft): Promise<Report> => {
    const nextId = Date.now();
    const folioNumber = Math.floor(100000 + Math.random() * 900000);
    const folio = `PJ-${folioNumber}`;
    const nowIso = new Date().toISOString();

    const categoryKey = draft.category || "otro";
    const newReport: Report = {
      id: nextId,
      folio,
      category: categoryKey,
      type: categoryKey,
      title: `${categoryKey.toUpperCase()}: ${draft.address || "Problema en " + draft.municipality}`,
      description: draft.description.trim() || "Reporte generado sin descripción adicional.",
      latitude: draft.latitude || 20.6767,
      longitude: draft.longitude || -103.3472,
      ubication: `${draft.address || "Vía pública"}, ${draft.colonia ? "Col. " + draft.colonia + ", " : ""}${draft.municipality}`,
      address: draft.address || "Vía pública",
      colonia: draft.colonia || "",
      municipality: draft.municipality || "Guadalajara",
      reference: draft.reference || "",
      photos: draft.photos.map((uri, index) => ({
        id: nextId + index,
        url: uri,
        display_order: index + 1,
        created_at: nowIso,
      })),
      status: "reportado",
      created_at: nowIso,
      status_updated_at: nowIso,
      status_version: 1,
      can_manage: true,
      user_id: 1,
      username: draft.isAnonymous ? "Ciudadano Invitado" : draft.contactName || "Vecino de Jalisco",
      like_count: 1,
      comment_count: 0,
      liked_by_me: true,
      is_anonymous: draft.isAnonymous,
      contact_phone: draft.contactPhone,
    };

    const currentReports = get().reports;
    const currentUserIds = get().userReportIds;
    const updatedReports = [newReport, ...currentReports];
    const updatedUserIds = [newReport.id, ...currentUserIds];

    set({
      reports: updatedReports,
      userReportIds: updatedUserIds,
    });

    try {
      await Promise.all([
        AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedReports)),
        AsyncStorage.setItem(USER_REPORTS_KEY, JSON.stringify(updatedUserIds)),
      ]);
    } catch {
      // Local storage failure
    }

    return newReport;
  },

  toggleUpvote: (reportId: number) => {
    const reports = get().reports.map((report) => {
      if (report.id === reportId) {
        const liked = !report.liked_by_me;
        return {
          ...report,
          liked_by_me: liked,
          like_count: liked ? report.like_count + 1 : Math.max(0, report.like_count - 1),
        };
      }
      return report;
    });

    set({ reports });
    void AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  },

  getReportById: (id: number | string) => {
    return get().reports.find(
      (r) => String(r.id) === String(id) || r.folio === String(id)
    );
  },

  setFilterCategory: (category: string) => {
    set({ filterCategory: category });
  },

  setFilterStatus: (status: string) => {
    set({ filterStatus: status });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  refreshReports: async () => {
    set({ isLoading: true });
    await new Promise((res) => setTimeout(res, 600));
    set({ isLoading: false });
  },

  syncOfflineQueue: async () => {
    const queue = get().offlineQueue;
    if (queue.length === 0) return;

    set({ isSyncing: true });
    for (const draft of queue) {
      await get().submitReport(draft);
    }
    set({ offlineQueue: [], isSyncing: false });
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  },
}));
