import { categoryDefFor, legacyCategoryIds } from "@/constants/report-categories";
import type { Report } from "./types";

export type ReportDisplaySource = Partial<
  Pick<
    Report,
    "title" | "category" | "type" | "colonia" | "municipality" | "ubication"
  >
> & {
  title?: string | null;
  category?: string | null;
  type?: string | null;
  colonia?: string | null;
  municipality?: string | null;
  ubication?: string | null;
};

const CATEGORY_TITLE_NOUNS: Record<string, string> = {
  baches: "baches y vialidad",
  alumbrado: "alumbrado público",
  agua: "agua",
  basura: "basura",
  seguridad: "seguridad urbana",
  arboles: "árboles y parques",
  semaforos: "semáforos",
};

function resolveCanonicalCategoryId(raw?: string | null): string | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return null;
  const mapped = legacyCategoryIds[normalized] || normalized;
  if (mapped in CATEGORY_TITLE_NOUNS) {
    return mapped;
  }
  return null;
}

export function getReportLocationSummary(
  report?: ReportDisplaySource | null,
): string | null {
  if (!report || typeof report !== "object") return null;
  const colonia =
    typeof report.colonia === "string" ? report.colonia.trim() : "";
  if (colonia) return colonia;
  const municipality =
    typeof report.municipality === "string" ? report.municipality.trim() : "";
  if (municipality) return municipality;
  return null;
}

export function getReportDisplayTitle(
  report?: ReportDisplaySource | null,
): string {
  if (!report || typeof report !== "object") {
    return "Problema reportado";
  }

  if (typeof report.title === "string") {
    const cleanTitle = report.title.trim();
    if (cleanTitle.length > 0) {
      return cleanTitle;
    }
  }

  const rawCategory = report.category || report.type;
  const canonicalId = resolveCanonicalCategoryId(rawCategory);
  const location = getReportLocationSummary(report);

  if (canonicalId) {
    const noun = CATEGORY_TITLE_NOUNS[canonicalId];
    return location ? `Problema de ${noun} en ${location}` : `Problema de ${noun}`;
  }

  if (typeof rawCategory === "string") {
    const cleanRaw = rawCategory.trim().toLowerCase();
    if (cleanRaw && cleanRaw !== "otro" && cleanRaw !== "otros") {
      const def = categoryDefFor(cleanRaw);
      if (def.id !== "otro") {
        const labelNoun = def.label.toLowerCase();
        return location
          ? `Problema de ${labelNoun} en ${location}`
          : `Problema de ${labelNoun}`;
      }
    }
  }

  return "Problema reportado";
}

export function reportDate(value: string | null) {
  if (!value) return "Fecha no disponible";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : date.toLocaleString("es-MX", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function reportShortDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

export function googleMapsUrl(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
    throw new Error("La ubicación de este reporte no es válida.");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}
