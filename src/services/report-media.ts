import { apiRequest, apiUrl } from "./api";
import { normalizeReport } from "./normalize-report";
import { apiCache } from "./cache";
import {
  invalidateInteractionQueries,
  reportKey,
  runReportMutation,
} from "./report-state";
import { sessionVersion } from "./session";
import type { Report, ReportStatus, StatusHistoryPage } from "./types";

export interface SelectedPhoto {
  uri: string;
  name: string;
  type: "image/jpeg";
  size: number;
}
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export function photoUrl(path: string) {
  return apiUrl(path);
}
export function appendPhotos(form: FormData, photos: SelectedPhoto[]) {
  if (photos.length > 3) throw new Error("Puedes adjuntar hasta 3 fotos.");
  photos.forEach((photo, index) => {
    if (photo.size <= 0 || photo.size > MAX_PHOTO_BYTES)
      throw new Error("Cada foto debe ocupar como máximo 5 MB.");
    const filename = photo.name || `report-photo-${index + 1}.jpg`;
    // React Native's FormData accepts a native file descriptor { uri, name, type }
    form.append("photos", {
      uri: photo.uri,
      name: filename,
      type: photo.type || "image/jpeg",
    } as unknown as Blob);
  });
}
function confirm(report: Report) {
  invalidateInteractionQueries(report.id);
  apiCache.invalidate(`status-history:${report.id}:`);
  apiCache.set(reportKey(report.id), report);
}
async function mutate(
  id: number,
  operation: () => Promise<{ report: Report }>,
) {
  const identity = sessionVersion();
  return runReportMutation(id, async () => {
    if (identity !== sessionVersion())
      throw new Error("La sesión cambió. Intenta de nuevo.");
    try {
      const response = await operation();
      if (!response.report)
        throw new Error(
          "No se pudo confirmar el cambio. Actualiza el reporte.",
        );
      const report = normalizeReport(response.report);
      if (identity === sessionVersion()) confirm(report);
      return report;
    } catch (error) {
      invalidateInteractionQueries(id);
      apiCache.invalidate(`status-history:${id}:`);
      throw error;
    }
  });
}
export function AddReportPhotos(id: number, photos: SelectedPhoto[]) {
  const form = new FormData();
  appendPhotos(form, photos);
  return mutate(id, () =>
    apiRequest(`/reports/${id}/photos`, { method: "POST", body: form }, true),
  );
}
export function RemoveReportPhoto(id: number, photoId: number) {
  return mutate(id, () =>
    apiRequest(`/reports/${id}/photos/${photoId}`, { method: "DELETE" }, true),
  );
}
export function UpdateReportStatus(
  id: number,
  status: ReportStatus,
  expectedVersion: number,
) {
  return mutate(id, () =>
    apiRequest(
      `/reports/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status, expected_version: expectedVersion }),
      },
      true,
    ),
  );
}
export function GetStatusHistory(
  id: number,
  refresh = false,
  beforeVersion?: number,
) {
  return apiCache.get<StatusHistoryPage>(
    `status-history:${id}:${beforeVersion ?? "first"}`,
    () =>
      apiRequest(
        `/reports/${id}/status/history?limit=30${beforeVersion === undefined ? "" : `&beforeVersion=${beforeVersion}`}`,
      ),
    refresh,
  );
}
