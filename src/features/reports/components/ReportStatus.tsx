import type { Report } from "@/services/types";
import { normalizeReportStatus, reportStatusLabels } from "@/services/report-status";
import { AppText } from "@/components/ui/AppUi";

export function StatusIndicator({ report }: { report: Report }) {
  const status = normalizeReportStatus(report.status);
  return (
    <AppText variant="caption" tone={status === "resuelto" ? "accent" : "muted"}>
      {reportStatusLabels[status]}
    </AppText>
  );
}

export function ReportStatusPanel({ report }: { report: Report }) {
  return <StatusIndicator report={report} />;
}
