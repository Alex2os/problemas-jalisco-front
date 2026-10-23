import { apiCache } from "./cache";
import type { Report, ReportInteractions } from "./types";

export const reportKey = (id: number) => `entity:report:${id}`;

export function recordReportReads(reports: Report[], revision: number) {
  // A read started before a mutation/session change cannot replace its newer result.
  if (revision !== apiCache.revision()) return;
  for (const report of reports) apiCache.set(reportKey(report.id), report);
}

export function recordInteractionRead(
  interactions: ReportInteractions,
  revision: number,
) {
  if (revision !== apiCache.revision()) return;
  apiCache.patch<Report>(reportKey(interactions.report_id), (report, key) =>
    key === reportKey(interactions.report_id)
      ? { ...report, ...interactions }
      : report,
  );
}

export function invalidateInteractionQueries(id: number) {
  apiCache.invalidate("reports:");
  apiCache.invalidate(`report:${id}`, true);
  apiCache.invalidate(`comments:${id}:`);
}

export function applyInteractionMutation(interactions: ReportInteractions) {
  invalidateInteractionQueries(interactions.report_id);
  const key = reportKey(interactions.report_id);
  const report = apiCache.peek<Report>(key);
  if (report) apiCache.set(key, { ...report, ...interactions });
}

const mutations = new Map<number, Promise<unknown>>();
// Serialize this client's writes per report so a delayed comment response cannot undo a newer like state.
export function runReportMutation<T>(
  id: number,
  operation: () => Promise<T>,
): Promise<T> {
  const previous = mutations.get(id) || Promise.resolve();
  const result = previous.catch(() => undefined).then(operation);
  mutations.set(id, result);
  const cleanup = () => {
    if (mutations.get(id) === result) mutations.delete(id);
  };
  void result.then(cleanup, cleanup);
  return result;
}
