import { apiUrl } from "./api";
import type { Report } from "./types";

// The API uses `type` and its database ID; these aliases keep the current UI consistent.
export function normalizeReport(report: Report): Report {
  if (!Number.isSafeInteger(report?.id) || report.id <= 0)
    throw new Error("El servidor devolvió un reporte inválido.");
  return {
    ...report,
    folio: String(report.id),
    category: report.type,
    photos: (report.photos || []).map((photo) => ({
      ...photo,
      url: /^https?:\/\//i.test(photo.url) ? photo.url : apiUrl(photo.url),
    })),
  };
}
