import { ApiError } from "./api";
import { GetReportById } from "./get-report-by-id";
import { AddReportPhotos, MAX_PHOTO_BYTES, RemoveReportPhoto, UpdateReportStatus, type SelectedPhoto } from "./report-media";
import { normalizeReportStatus, type SimpleReportStatus } from "./report-status";
import { sessionVersion } from "./session";
import type { Report } from "./types";

export class ReportEditFailure extends Error {
  constructor(message: string) { super(message); this.name = "ReportEditFailure"; }
}

export async function SaveReportEdits({ report, removedPhotoIds, photos, status }: {
  report: Report;
  removedPhotoIds: number[];
  photos: SelectedPhoto[];
  status?: SimpleReportStatus;
}): Promise<Report> {
  const identity = sessionVersion();
  const checkSession = () => {
    if (identity !== sessionVersion()) throw new Error("La sesión cambió. Inicia sesión de nuevo.");
  };
  if (photos.some((photo) => photo.size <= 0 || photo.size > MAX_PHOTO_BYTES))
    throw new Error("Cada foto debe ocupar como máximo 5 MB.");
  if (removedPhotoIds.some((id) => !report.photos.some((photo) => photo.id === id)))
    throw new Error("La foto no pertenece a este reporte.");

  // Recheck ownership and capacity before making any changes.
  let current = await GetReportById(report.id, true);
  checkSession();
  if (!current.can_manage) throw new ApiError(403, "Solo el autor puede editar este reporte.");
  const removals = [...new Set(removedPhotoIds)].filter((id) => current.photos.some((photo) => photo.id === id));
  if (current.photos.length - removals.length + photos.length > 3)
    throw new ReportEditFailure("Puedes guardar hasta 3 fotos. Revisa las fotos actuales del reporte.");

  // The API exposes separate operations. Recheck the report after any uncertain write.
  try {
    if (status && normalizeReportStatus(current.status) !== status) {
      checkSession();
      current = await UpdateReportStatus(report.id, status === "resuelto" ? "resolved" : "reported", report.status_version);
    }
    for (const photoId of removals) {
      checkSession();
      current = await RemoveReportPhoto(report.id, photoId);
    }
    if (photos.length) {
      checkSession();
      current = await AddReportPhotos(report.id, photos);
    }
    checkSession();
    return current;
  } catch (error) {
    throw new ReportEditFailure(error instanceof Error ? error.message : "No se pudieron guardar los cambios.");
  }
}
