import { apiRequest } from "./api";
import { apiCache } from "./cache";
import { recordInteractionRead } from "./reportState";
import type { CommentsPage, ReportComment } from "./types";

export function GetCommentsPage(
  reportId: number,
  refresh = false,
  afterId?: number,
  limit = 50,
): Promise<CommentsPage> {
  const query = `?limit=${limit}${afterId ? `&afterId=${afterId}` : ""}`;
  return apiCache.get(
    `comments:${reportId}:${limit}:${afterId || "first"}`,
    async () => {
      const revision = apiCache.revision();
      const data = await apiRequest<CommentsPage>(
        `/reports/${reportId}/comments${query}`,
        {},
        "optional",
      );
      if (!Array.isArray(data?.comments) || !data.interactions)
        throw new Error("Respuesta inválida del servidor.");
      recordInteractionRead(data.interactions, revision);
      return data;
    },
    refresh,
  );
}

// Retained for existing callers that intentionally request the full conversation.
export function GetCommentsByReportId(
  reportId: number,
  refresh = false,
): Promise<ReportComment[]> {
  return apiCache.get(
    `comments:${reportId}:all`,
    async () => {
      const data = await apiRequest<CommentsPage>(
        `/reports/${reportId}/comments`,
        {},
        "optional",
      );
      if (!Array.isArray(data?.comments))
        throw new Error("Respuesta inválida del servidor.");
      return data.comments;
    },
    refresh,
  );
}
