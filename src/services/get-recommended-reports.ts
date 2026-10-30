import { apiRequest } from "./api";
import { apiCache } from "./cache";
import { normalizeReport } from "./normalize-report";
import { recordReportReads } from "./report-state";
import type { RecommendedReportsPage } from "./types";

export interface RecommendationLocation { latitude: number; longitude: number }

export function GetRecommendedReports(offset = 0, location?: RecommendationLocation, refresh = false): Promise<RecommendedReportsPage> {
  const query = `limit=20&offset=${offset}${location ? `&latitude=${location.latitude}&longitude=${location.longitude}` : ""}`;
  return apiCache.get(`reports:recommended:${query}`, async () => {
    const revision = apiCache.revision();
    const data = await apiRequest<RecommendedReportsPage>(`/reports/recommended?${query}`, {}, "optional");
    if (!Array.isArray(data?.reports) || !Array.isArray(data?.recommendations)
      || typeof data.has_more !== "boolean"
      || (data.has_more ? !Number.isSafeInteger(data.next_offset) || data.next_offset! <= offset : data.next_offset !== null)
      || data.recommendations.length !== data.reports.length
      || data.recommendations.some((item, index) => item?.report_id !== data.reports[index]?.id
        || typeof item.reason !== "string"
        || (item.distance_km !== null && (!Number.isFinite(item.distance_km) || item.distance_km < 0))))
      throw new Error("Respuesta inválida de recomendaciones.");
    const reports = data.reports.map(normalizeReport);
    recordReportReads(reports, revision);
    return { ...data, reports };
  }, refresh);
}
