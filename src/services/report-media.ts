import { File } from "expo-file-system";
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
export async function appendPhotos(form: FormData, photos: SelectedPhoto[]) {
  if (photos.length > 3) throw new Error("Puedes adjuntar hasta 3 fotos.");
  for (const [index, photo] of photos.entries()) {
    const filename = photo.name || `report-photo-${index + 1}.jpg`;
    if (photo.size <= 0) {
      throw new Error(`La foto "${filename}" está vacía (0 bytes).`);
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      throw new Error(`La foto "${filename}" supera el límite de 5 MB (${photo.size} bytes).`);
    }

    // In Node test environments where standard Fetch FormData is used:
    if (typeof (form as any).getParts !== "function") {
      const file = new File(photo.uri);
      const actualSize = typeof file.size === "number" ? file.size : photo.size;
      if (actualSize > MAX_PHOTO_BYTES) {
        throw new Error(`La foto "${filename}" supera el límite de 5 MB (${actualSize} bytes).`);
      }
      form.append("photos", file, filename);
    } else {
      // Native platforms (Android & iOS with React Native fetch) expect { uri, name, type }
      form.append("photos", {
        uri: photo.uri,
        name: filename,
        type: photo.type || "image/jpeg",
      } as unknown as Blob);
    }
  }
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
export async function AddReportPhotos(id: number, photos: SelectedPhoto[]) {
  const form = new FormData();
  await appendPhotos(form, photos);
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
