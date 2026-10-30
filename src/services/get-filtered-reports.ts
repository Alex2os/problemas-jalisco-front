import { apiRequest } from "./api";
import { normalizeReport } from "./normalize-report";
import { apiCache } from "./cache";
import { recordReportReads } from "./report-state";
import type { Report } from "./types";

export function GetFilteredReports(
  query: string,
  refresh = false,
): Promise<Report[]> {
  return apiCache.get(
    `reports:search:${query.trim()}`,
    async () => {
      const revision = apiCache.revision();
      const data = await apiRequest<{ reports: Report[] }>(
        `/reports/search?query=${encodeURIComponent(query.trim())}`,
        {},
        "optional",
      );
      if (!Array.isArray(data?.reports))
        throw new Error("Respuesta inválida del servidor.");
      const reports = data.reports.map(normalizeReport);
      recordReportReads(reports, revision);
      return reports;
    },
    refresh,
  );
}
