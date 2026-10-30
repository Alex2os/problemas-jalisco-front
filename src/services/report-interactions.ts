import { apiRequest } from "./api";
import { apiCache } from "./cache";
import {
  applyInteractionMutation,
  invalidateInteractionQueries,
  runReportMutation,
} from "./report-state";
import { sessionVersion } from "./session";
import type { ReportInteractions } from "./types";

const pendingLikes = new Map<number, Promise<ReportInteractions>>();
export const likePendingKey = (id: number) => `like-pending:${id}`;

export function SetReportLike(
  reportId: number,
  liked: boolean,
): Promise<ReportInteractions> {
  const pending = pendingLikes.get(reportId);
  if (pending) return pending;
  const version = sessionVersion();
  apiCache.set(likePendingKey(reportId), true);
  const request = runReportMutation(reportId, async () => {
    if (version !== sessionVersion())
      throw new Error("La sesión cambió. Intenta de nuevo.");
    const data = await apiRequest<{ interactions: ReportInteractions }>(
      `/reports/${reportId}/like`,
      { method: liked ? "PUT" : "DELETE" },
      true,
    );
    if (!data.interactions)
      throw new Error(
        "No se pudo confirmar el me gusta. Actualiza el reporte.",
      );
    if (version === sessionVersion())
      applyInteractionMutation(data.interactions);
    return data.interactions;
  })
    .catch((error) => {
      invalidateInteractionQueries(reportId);
      throw error;
    })
    .finally(() => {
      pendingLikes.delete(reportId);
      apiCache.set(likePendingKey(reportId), false);
    });
  pendingLikes.set(reportId, request);
  return request;
}

export function DeleteComment(reportId: number, commentId: number) {
  const version = sessionVersion();
  return runReportMutation(reportId, async () => {
    if (version !== sessionVersion())
      throw new Error("La sesión cambió. Intenta de nuevo.");
    try {
      const data = await apiRequest<{
        comment_id: number;
        interactions: ReportInteractions;
      }>(
        `/reports/${reportId}/comments/${commentId}`,
        { method: "DELETE" },
        true,
      );
      if (!data.interactions)
        throw new Error(
          "No se pudo confirmar la eliminación. Actualiza el reporte.",
        );
      if (version === sessionVersion())
        applyInteractionMutation(data.interactions);
      return data;
    } catch (error) {
      invalidateInteractionQueries(reportId);
      throw error;
    }
  });
}
