import { space } from "@/src/constants/design";
import { useAuthSession } from "@/src/hooks/use-report-state";
import { GetReportById } from "@/src/services/GetReportById";
import { reportDate } from "@/src/services/report-format";
import { GetStatusHistory, UpdateReportStatus } from "@/src/services/ReportMedia";
import { sessionVersion } from "@/src/services/session";
import type {
    Report,
    ReportStatus,
    StatusHistoryEntry,
} from "@/src/services/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { AppText, Button, Notice } from "./ui";

export const statusLabel: Record<ReportStatus, string> = {
  reported: "Reportado",
  still_present: "Sigue presente",
  resolved: "Resuelto",
};
export function StatusIndicator({ report }: { report: Report }) {
  return (
    <AppText
      variant="caption"
      tone={report.status === "resolved" ? "accent" : "muted"}
    >
      {statusLabel[report.status] || "Reportado"}
    </AppText>
  );
}
export function ReportStatusPanel({ report }: { report: Report }) {
  const authenticated = useAuthSession();
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const pending = useRef(false);
  const epoch = useRef(0);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const load = useCallback(
    (before?: number) => {
      const request = ++epoch.current;
      return GetStatusHistory(report.id, true, before)
        .then((page) => {
          if (!active.current || request !== epoch.current) return;
          setHistory((current) =>
            before === undefined
              ? page.history
              : [
                  ...new Map(
                    [...current, ...page.history].map((item) => [
                      item.version,
                      item,
                    ]),
                  ).values(),
                ].sort((a, b) => b.version - a.version),
          );
          setCursor(page.next_before_version);
          setError("");
        })
        .catch((failure: unknown) => {
          if (active.current && request === epoch.current)
            setError(
              failure instanceof Error
                ? failure.message
                : "No se pudo cargar el historial.",
            );
        })
        .finally(() => {
          if (active.current && request === epoch.current) setLoading(false);
        });
    },
    [report.id],
  );
  useEffect(() => {
    void load();
  }, [load, report.status_version]);
  async function update(status: ReportStatus) {
    if (pending.current || !authenticated || !report.can_manage) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setSuccess("");
    const identity = sessionVersion();
    try {
      await UpdateReportStatus(report.id, status, report.status_version);
      if (active.current && identity === sessionVersion()) {
        setSuccess("Estado actualizado.");
        await load();
      }
    } catch (failure) {
      if (active.current && identity === sessionVersion()) {
        setError(
          failure instanceof Error
            ? failure.message
            : "No se pudo actualizar el estado.",
        );
        // Reconcile conflicts or a committed write whose response was lost.
        void GetReportById(report.id, true).catch(() => {
          if (active.current)
            setError(
              (message) =>
                `${message} No se pudo actualizar el reporte. Desliza para reintentar.`,
            );
        });
      }
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }
  function choose() {
    const choices: { text: string; onPress: () => void }[] = [];
    if (report.status !== "resolved")
      choices.push(
        {
          text:
            report.status === "still_present"
              ? "Confirmar que sigue presente"
              : "Sigue presente",
          onPress: () => {
            void update("still_present");
          },
        },
        {
          text: "Marcar como resuelto",
          onPress: () =>
            Alert.alert(
              "¿El problema ya está resuelto?",
              "El cambio quedará registrado en el historial.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Confirmar",
                  onPress: () => {
                    void update("resolved");
                  },
                },
              ],
            ),
        },
      );
    else
      choices.push({
        text: "Reabrir: sigue presente",
        onPress: () => {
          void update("still_present");
        },
      });
    Alert.alert(
      "Actualizar estado",
      "Indica la condición del problema que has comprobado.",
      [...choices, { text: "Cancelar", style: "cancel" }],
    );
  }
  return (
    <View style={{ gap: space.md }}>
      <AppText variant="heading">Estado del problema</AppText>
      <AppText variant="label">
        {statusLabel[report.status] || "Reportado"}
      </AppText>
      <AppText variant="caption" tone="muted">
        Actualizado {reportDate(report.status_updated_at)}
      </AppText>
      {authenticated && report.can_manage && (
        <Button
          secondary
          label="Actualizar estado"
          loading={busy}
          onPress={choose}
        />
      )}
      <Notice message={success} success />
      <Notice message={error} />
      <AppText variant="label">Historial</AppText>
      {(expanded ? history : history.slice(0, 3)).map((entry) => (
        <View key={entry.id} style={{ gap: space.xs }}>
          <AppText variant="caption">
            {entry.previous_status
              ? `${statusLabel[entry.previous_status]} → `
              : ""}
            {statusLabel[entry.status]}
          </AppText>
          <AppText variant="caption" tone="muted">
            {reportDate(entry.changed_at)} ·{" "}
            {entry.source === "backfill"
              ? "Inicio del seguimiento"
              : entry.username || "Autor"}
          </AppText>
        </View>
      ))}
      {loading && (
        <AppText variant="caption" tone="muted">
          Cargando historial…
        </AppText>
      )}
      {!loading && !history.length && !error && (
        <AppText variant="caption" tone="muted">
          Sin cambios registrados.
        </AppText>
      )}
      {(history.length > 3 || cursor !== null) && !expanded && (
        <Button
          variant="text"
          label="Ver historial completo"
          onPress={() => setExpanded(true)}
        />
      )}
      {expanded && cursor !== null && (
        <Button
          variant="text"
          label="Ver cambios anteriores"
          loading={loading}
          onPress={() => load(cursor)}
        />
      )}
      {!!error && (
        <Button
          variant="text"
          label="Actualizar historial"
          loading={loading}
          onPress={() => load()}
        />
      )}
    </View>
  );
}
