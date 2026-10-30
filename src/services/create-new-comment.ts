import { apiRequest } from "./api";
import {
  applyInteractionMutation,
  invalidateInteractionQueries,
  runReportMutation,
} from "./report-state";
import { sessionVersion } from "./session";
import type { CommentCreated } from "./types";

export function CreateComment(
  userComment: string,
  reportId: number,
): Promise<CommentCreated> {
  const version = sessionVersion();
  return runReportMutation(reportId, async () => {
    if (version !== sessionVersion())
      throw new Error("La sesión cambió. Intenta de nuevo.");
    try {
      const data = await apiRequest<CommentCreated>(
        `/reports/${reportId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ user_comment: userComment.trim() }),
        },
        true,
      );
      if (!data.comment || !data.interactions)
        throw new Error(
          "No se pudo confirmar el comentario. Actualiza el reporte.",
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
