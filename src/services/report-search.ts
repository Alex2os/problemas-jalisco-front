import { categoryDefFor } from "../constants/report-categories";
import type { Report } from "./types";

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function matchesReportSearch(report: Report, query: string): boolean {
  const words = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  const searchable = normalizeSearch([
    report.type,
    report.category,
    categoryDefFor(report.type).label,
    report.ubication,
    report.address,
    report.colonia,
    report.municipality,
  ].filter(Boolean).join(" "));
  return words.every((word) => searchable.includes(word));
}
