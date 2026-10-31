import type { ComponentProps } from "react";
import type Feather from "@expo/vector-icons/Feather";
import type Ionicons from "@expo/vector-icons/Ionicons";
import type { BackendCategory } from "@/services/get-categories";

export interface CategoryVisual {
  shortLabel: string;
  featherIcon: ComponentProps<typeof Feather>["name"];
  ionicon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  bgLight: string;
  bgDark?: string;
}

export interface CategoryDefinition extends CategoryVisual {
  id: string;
  label: string;
  description: string;
}

/**
 * Presentación visual centralizada por categoría (iconos y colores).
 * Mantiene la armonía visual de los temas Light y Dark.
 */
export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  baches: {
    shortLabel: "Baches",
    featherIcon: "alert-triangle",
    ionicon: "car-outline",
    color: "#EA580C",
    bgLight: "#FFF7ED",
    bgDark: "#351C0A",
  },
  alumbrado: {
    shortLabel: "Alumbrado",
    featherIcon: "zap",
    ionicon: "bulb-outline",
    color: "#EAB308",
    bgLight: "#FEFCE8",
    bgDark: "#332A08",
  },
  agua: {
    shortLabel: "Agua",
    featherIcon: "droplet",
    ionicon: "water-outline",
    color: "#0284C7",
    bgLight: "#F0F9FF",
    bgDark: "#0A2538",
  },
  basura: {
    shortLabel: "Basura",
    featherIcon: "trash-2",
    ionicon: "trash-outline",
    color: "#16A34A",
    bgLight: "#F0FDF4",
    bgDark: "#0D2C15",
  },
  seguridad: {
    shortLabel: "Seguridad",
    featherIcon: "shield",
    ionicon: "shield-checkmark-outline",
    color: "#DC2626",
    bgLight: "#FEF2F2",
    bgDark: "#371313",
  },
  arboles: {
    shortLabel: "Árboles",
    featherIcon: "feather",
    ionicon: "leaf-outline",
    color: "#0D9488",
    bgLight: "#F0FDFA",
    bgDark: "#0A2825",
  },
  otro: {
    shortLabel: "Otro",
    featherIcon: "help-circle",
    ionicon: "grid-outline",
    color: "#64748B",
    bgLight: "#F8FAFC",
    bgDark: "#1E2733",
  },
};

/**
 * Catálogo local oficial de respaldo (exactamente los 7 identificadores del backend).
 * Permite que la app funcione offline o si la consulta al backend falla.
 */
export const LOCAL_FALLBACK_CATEGORIES: CategoryDefinition[] = [
  {
    id: "baches",
    label: "Baches y vialidad",
    description: "Pavimento dañado",
    ...CATEGORY_VISUALS.baches,
  },
  {
    id: "alumbrado",
    label: "Alumbrado público",
    description: "Luces que no funcionan",
    ...CATEGORY_VISUALS.alumbrado,
  },
  {
    id: "agua",
    label: "Agua y drenaje",
    description: "Fugas o drenaje tapado",
    ...CATEGORY_VISUALS.agua,
  },
  {
    id: "basura",
    label: "Basura acumulada",
    description: "Desechos y escombros",
    ...CATEGORY_VISUALS.basura,
  },
  {
    id: "seguridad",
    label: "Seguridad urbana",
    description: "Vandalismo y riesgos",
    ...CATEGORY_VISUALS.seguridad,
  },
  {
    id: "arboles",
    label: "Árboles y parques",
    description: "Ramas o árboles caídos",
    ...CATEGORY_VISUALS.arboles,
  },
  {
    id: "otro",
    label: "Otro problema",
    description: "Señales o semáforos",
    ...CATEGORY_VISUALS.otro,
  },
];

export const CATEGORIES_LIST: CategoryDefinition[] = LOCAL_FALLBACK_CATEGORIES;

/**
 * Combina las categorías devueltas por el backend con los activos visuales del frontend.
 */
export function mergeBackendCategories(backendList: BackendCategory[]): CategoryDefinition[] {
  if (!Array.isArray(backendList) || backendList.length === 0) {
    return LOCAL_FALLBACK_CATEGORIES;
  }
  return backendList.map((cat) => {
    const visual = CATEGORY_VISUALS[cat.id] || CATEGORY_VISUALS.otro;
    return {
      id: cat.id,
      label: cat.name || cat.id,
      description: cat.description || "",
      ...visual,
    };
  });
}

/**
 * Mapeo de identificadores legacy hacia el identificador canónico activo.
 */
export const legacyCategoryIds: Record<string, string> = {
  accidente: "baches",
  bloqueo: "otro",
  "corte-de-servicios": "alumbrado",
  "transporte-publico": "otro",
  "robo-asalto": "seguridad",
  otros: "otro",
};

/**
 * Mapeo histórico para lectura y visualización compatible.
 */
export const categories: Record<
  string,
  { label: string; icon: ComponentProps<typeof Feather>["name"]; color: string }
> = {
  baches: { label: "Baches y vialidad", icon: "alert-triangle", color: "#EA580C" },
  alumbrado: { label: "Alumbrado público", icon: "zap", color: "#EAB308" },
  agua: { label: "Agua y drenaje", icon: "droplet", color: "#0284C7" },
  basura: { label: "Basura acumulada", icon: "trash-2", color: "#16A34A" },
  seguridad: { label: "Seguridad urbana", icon: "shield", color: "#DC2626" },
  arboles: { label: "Árboles y parques", icon: "feather", color: "#0D9488" },
  otro: { label: "Otro problema", icon: "help-circle", color: "#64748B" },
  accidente: { label: "Baches y vialidad", icon: "alert-triangle", color: "#EA580C" },
  bloqueo: { label: "Otro problema", icon: "slash", color: "#648392" },
  "corte-de-servicios": { label: "Alumbrado público", icon: "zap-off", color: "#B49A4C" },
  "transporte-publico": { label: "Otro problema", icon: "truck", color: "#B97A62" },
  "robo-asalto": { label: "Seguridad urbana", icon: "shield", color: "#DC2626" },
  otros: { label: "Otro problema", icon: "help-circle", color: "#64748B" },
};

export const categoryFor = (type: string) =>
  categories[type] || categories.otro || categories.otros;

export const categoryDefFor = (type: string): CategoryDefinition => {
  const normalized = (type || "").trim().toLowerCase();
  const id = legacyCategoryIds[normalized] || normalized;
  return LOCAL_FALLBACK_CATEGORIES.find((category) => category.id === id) || LOCAL_FALLBACK_CATEGORIES[LOCAL_FALLBACK_CATEGORIES.length - 1];
};
