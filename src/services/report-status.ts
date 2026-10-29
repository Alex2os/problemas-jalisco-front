import type { ReportStatus } from "./types";

export type SimpleReportStatus = "reportado" | "resuelto";

// Keep older saved reports and API responses compatible with the two statuses.
export function normalizeReportStatus(status: ReportStatus): SimpleReportStatus {
  switch (status) {
    case "resolved":
    case "resuelto":
      return "resuelto";
    default:
      return "reportado";
  }
}

export const reportStatusLabels = {
  reportado: "Reportado",
  resuelto: "Resuelto",
};
