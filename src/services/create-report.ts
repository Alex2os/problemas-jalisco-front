import { apiRequest } from "./api";
import { apiCache } from "./cache";
import { appendPhotos, type SelectedPhoto } from "./report-media";
import type { Report } from "./types";

export const REPORT_TITLE_LIMIT = 80;

export function getReportTitleError(title: string): string {
  if (typeof title !== "string" || !title.trim())
    return "Escribe un título para el reporte.";
  if (title.trim().length > REPORT_TITLE_LIMIT)
    return `El título debe tener hasta ${REPORT_TITLE_LIMIT} caracteres.`;
  if (/[\r\n]/.test(title))
    return "El título debe ocupar una sola línea.";
  return "";
}

export async function CreateReport(
  type: string,
  title: string,
  description: string,
  latitude: number,
  longitude: number,
  photos: SelectedPhoto[] = [],
) {
  const titleError = getReportTitleError(title);
  if (titleError) throw new Error(titleError);
  const values = { type, title: title.trim(), description: description.trim(), latitude, longitude };
  let body: string | FormData = JSON.stringify(values);
  if (photos.length) {
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) =>
      form.append(key, String(value)),
    );
    await appendPhotos(form, photos);
    body = form;
  }
  try {
    return await apiRequest<{ report_id: number; report?: Report }>(
      photos.length ? "/reports/create-with-photos" : "/reports/create",
      { method: "POST", body },
      true,
    );
  } finally {
    // A lost response can follow a committed create; refresh before trying to publish again.
    apiCache.invalidate("reports:");
  }
}
