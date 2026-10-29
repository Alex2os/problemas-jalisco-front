import { apiRequest } from "./api";
import { apiCache } from "./cache";
import { recordReportReads } from "./reportState";
import { MOCK_REPORTS } from "./mockReports";
import type { Report } from "./types";

export function GetAllReports(refresh = false): Promise<Report[]> {
  return apiCache.get(
    `reports:all`,
    async () => {
      const revision = apiCache.revision();
      try {
        const data = await apiRequest<{ reports: Report[] }>(
          `/reports`,
          {},
          "optional",
        );
        if (Array.isArray(data?.reports) && data.reports.length > 0) {
          recordReportReads(data.reports, revision);
          return data.reports;
        }
      } catch {
        // Fallback to rich mock data if backend server is not running
      }
      recordReportReads(MOCK_REPORTS, revision);
      return MOCK_REPORTS;
    },
    refresh,
  );
}
