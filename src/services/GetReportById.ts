import { apiRequest } from "./api";
import { apiCache } from "./cache";
import { recordReportReads } from "./reportState";
import { MOCK_REPORTS } from "./mockReports";
import type { Report } from "./types";

export function GetReportById(
  report_id: number | string,
  refresh = false,
): Promise<Report> {
  return apiCache.get(
    `report:${report_id}`,
    async () => {
      const revision = apiCache.revision();
      try {
        const data = await apiRequest<{ report: Report }>(
          `/reports/${report_id}`,
          {},
          "optional",
        );
        if (data?.report) {
          recordReportReads([data.report], revision);
          return data.report;
        }
      } catch {
        // Fallback to mock data if backend server is not running
      }
      const match = MOCK_REPORTS.find(
        (r) => String(r.id) === String(report_id) || r.folio === String(report_id)
      ) || MOCK_REPORTS[0];
      recordReportReads([match], revision);
      return match;
    },
    refresh,
  );
}
