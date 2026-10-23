import { apiRequest } from "./api";
import { apiCache } from "./cache";
import { recordReportReads } from "./reportState";
import type { Report } from "./types";

export function GetReportById(
  report_id: number,
  refresh = false,
): Promise<Report> {
  return apiCache.get(
    `report:${report_id}`,
    async () => {
      const revision = apiCache.revision();
      const data = await apiRequest<{ report: Report }>(
        `/reports/${report_id}`,
        {},
        "optional",
      );
      if (!data?.report) throw new Error("Respuesta inválida del servidor.");
      recordReportReads([data.report], revision);
      return data.report;
    },
    refresh,
  );
}
