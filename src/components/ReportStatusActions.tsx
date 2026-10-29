import { useRef, useState } from "react";
import { Alert } from "react-native";
import { Button } from "./Button";
import { ErrorBanner } from "./ErrorBanner";
import { useAuthSession } from "@/src/hooks/use-report-state";
import { UpdateReportStatus } from "@/src/services/ReportMedia";
import { GetReportById } from "@/src/services/GetReportById";
import { normalizeReportStatus } from "@/src/services/report-status";
import type { Report } from "@/src/services/types";

export function ReportStatusActions({ report }: { report: Report }) {
  const authenticated = useAuthSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  if (!authenticated || !report.can_manage) return null;
  const resolved = normalizeReportStatus(report.status) === "resuelto";
  async function update() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try { await UpdateReportStatus(report.id, resolved ? "reported" : "resolved", report.status_version); }
    catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo guardar el estado.");
      void GetReportById(report.id, true).catch(() => undefined);
    } finally { pending.current = false; setBusy(false); }
  }
  return <>
    {!!error && <ErrorBanner message={error} />}
    <Button title={resolved ? "Marcar como reportado" : "Marcar como resuelto"} variant="outline" loading={busy}
      onPress={() => Alert.alert("Cambiar estado", resolved ? "¿El problema sigue presente?" : "¿El problema ya está resuelto?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => { void update(); } },
      ])} />
  </>;
}
