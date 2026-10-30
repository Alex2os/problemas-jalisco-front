import { apiRequest } from "./api";
import { apiCache } from "./cache";
import { normalizeReport } from "./normalize-report";
import { recordReportReads } from "./report-state";
import type { Report } from "./types";

export function GetReportById(report_id: number | string, refresh = false): Promise<Report> {
  return apiCache.get(`report:${report_id}`, async () => {
    const revision = apiCache.revision();
    const data = await apiRequest<{ report: Report }>(`/reports/${report_id}`, {}, "optional");
    const report = normalizeReport(data?.report);
    recordReportReads([report], revision);
    return report;
  }, refresh);
}
