import { Share } from "react-native";
import * as Haptics from "expo-haptics";
import type { Report } from "@/services/types";

export async function shareReport(
  report: Pick<Report, "id" | "folio" | "ubication">,
  categoryLabel: string,
) {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  try {
    await Share.share({
      title: `Reporte #${report.folio}`,
      message: `${categoryLabel} en ${report.ubication}. Reporte #${report.id} en ProblemasJalisco.`,
    });
  } catch {
    // Ignored
  }
}
