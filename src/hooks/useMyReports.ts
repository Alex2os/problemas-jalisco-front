import { useAuthSession } from "@/hooks/useReportState";
import { useReportsStore } from "@/store/useReportsStore";
import type { Report } from "@/services/types";

function createdAtTime(report: Report) {
  const time = report.created_at ? new Date(report.created_at).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
}

// The /reports endpoint is not paginated, so the store holds every report the
// API returns; the user's own reports are those they can manage.
export function useMyReports() {
  const authenticated = useAuthSession();
  const reports = useReportsStore((state) => state.reports);
  const myReports = authenticated
    ? reports
        .filter((report) => report.can_manage)
        .sort((a, b) => createdAtTime(b) - createdAtTime(a) || b.id - a.id)
    : [];
  return { authenticated, reports, myReports };
}
