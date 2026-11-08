import { apiCache } from "./cache";
import type { Report, ReportInteractions } from "./types";

export const reportKey = (id: number) => `entity:report:${id}`;

function samePhotos(a: Report["photos"], b: Report["photos"]) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].id !== b[i].id ||
      a[i].url !== b[i].url ||
      a[i].display_order !== b[i].display_order ||
      a[i].created_at !== b[i].created_at
    ) {
      return false;
    }
  }
  return true;
}

export function isSameReportSnapshot(a: Report | undefined, b: Report | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.folio === b.folio &&
    a.category === b.category &&
    a.type === b.type &&
    (a.title ?? null) === (b.title ?? null) &&
    a.description === b.description &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude &&
    a.ubication === b.ubication &&
    a.address === b.address &&
    a.colonia === b.colonia &&
    a.municipality === b.municipality &&
    a.reference === b.reference &&
    a.status === b.status &&
    a.status_updated_at === b.status_updated_at &&
    a.status_version === b.status_version &&
    a.can_manage === b.can_manage &&
    a.created_at === b.created_at &&
    a.user_id === b.user_id &&
    a.username === b.username &&
    a.like_count === b.like_count &&
    a.comment_count === b.comment_count &&
    a.liked_by_me === b.liked_by_me &&
    samePhotos(a.photos, b.photos)
  );
}

let bulkReading = 0;

export function isBulkReadingReports() {
  return bulkReading > 0;
}

export function runWithBulkReportReads<T>(operation: () => T): T {
  bulkReading++;
  try {
    return operation();
  } finally {
    bulkReading--;
  }
}

export function recordReportReads(reports: Report[], revision: number) {
  // A read started before a mutation/session change cannot replace its newer result.
  if (revision !== apiCache.revision()) return;
  for (const report of reports) {
    const key = reportKey(report.id);
    if (!isSameReportSnapshot(apiCache.peek<Report>(key), report)) {
      apiCache.set(key, report);
    }
  }
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
