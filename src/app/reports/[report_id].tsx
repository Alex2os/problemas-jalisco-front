import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Ruta de compatibilidad hacia la pantalla canónica de detalle de reporte (/reporte/[id]).
 * Redirige preservando el identificador del reporte y parámetros adicionales como comments=1.
 */
export default function LegacyReportRedirect() {
  const { report_id, ...rest } = useLocalSearchParams<{
    report_id: string;
    [key: string]: string | undefined;
  }>();

  return (
    <Redirect
      href={{
        pathname: "/reporte/[id]",
        params: { id: report_id || "", ...rest },
      }}
    />
  );
}
