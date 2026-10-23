import { apiRequest } from "./api";
import { apiCache } from "./cache";
import { recordReportReads } from "./reportState";
import type { Report } from "./types";

export function GetAllReports(refresh = false): Promise<Report[]> {
  return apiCache.get(
    `reports:all`,
    async () => {
      const revision = apiCache.revision();
      const data = await apiRequest<{ reports: Report[] }>(
        `/reports`,
        {},
        "optional",
      );
      if (!Array.isArray(data?.reports))
        throw new Error("Respuesta inválida del servidor.");
      recordReportReads(data.reports, revision);
      return data.reports;
    },
    refresh,
  );
}
