import type { ComponentProps } from "react";
import type Feather from "@expo/vector-icons/Feather";
import type Ionicons from "@expo/vector-icons/Ionicons";

export interface CategoryDefinition {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  featherIcon: ComponentProps<typeof Feather>["name"];
  ionicon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  bgLight: string;
}

export const CATEGORIES_LIST: CategoryDefinition[] = [
  {
    id: "baches",
    label: "Baches y vialidad",
    shortLabel: "Baches",
    description: "Baches, pavimento dañado, zanjas",
    featherIcon: "alert-triangle",
    ionicon: "car-outline",
    color: "#EA580C",
    bgLight: "#FFF7ED",
  },
  {
    id: "alumbrado",
    label: "Alumbrado público",
    shortLabel: "Alumbrado",
    description: "Luminarias fundidas o calles oscuras",
    featherIcon: "zap",
    ionicon: "bulb-outline",
    color: "#EAB308",
    bgLight: "#FEFCE8",
  },
  {
    id: "agua",
    label: "Agua y drenaje",
    shortLabel: "Agua",
    description: "Fugas de agua potable o alcantarillado",
    featherIcon: "droplet",
    ionicon: "water-outline",
    color: "#0284C7",
    bgLight: "#F0F9FF",
  },
  {
    id: "basura",
    label: "Basura acumulada",
    shortLabel: "Basura",
    description: "Escombros o falta de recolección",
    featherIcon: "trash-2",
    ionicon: "trash-outline",
    color: "#16A34A",
    bgLight: "#F0FDF4",
  },
  {
    id: "seguridad",
    label: "Seguridad urbana",
    shortLabel: "Seguridad",
    description: "Zonas oscuras, vandalismo, riesgo",
    featherIcon: "shield",
    ionicon: "shield-checkmark-outline",
    color: "#DC2626",
    bgLight: "#FEF2F2",
  },
  {
    id: "arboles",
    label: "Árboles y parques",
    shortLabel: "Árboles",
    description: "Ramas caídas o árboles sobre cables",
    featherIcon: "feather",
    ionicon: "leaf-outline",
    color: "#0D9488",
    bgLight: "#F0FDFA",
  },
  {
    id: "otro",
    label: "Otro problema",
    shortLabel: "Otro",
    description: "Semáforos o señalización dañada",
    featherIcon: "help-circle",
    ionicon: "grid-outline",
    color: "#64748B",
    bgLight: "#F8FAFC",
  },
];

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

const legacyCategoryIds: Record<string, string> = {
  accidente: "baches",
  bloqueo: "otro",
  "corte-de-servicios": "alumbrado",
  "transporte-publico": "otro",
  "robo-asalto": "seguridad",
  otros: "otro",
};

export const categoryDefFor = (type: string): CategoryDefinition => {
  const normalized = type.trim().toLowerCase();
  const id = legacyCategoryIds[normalized] || normalized;
  return CATEGORIES_LIST.find((category) => category.id === id) || CATEGORIES_LIST[CATEGORIES_LIST.length - 1];
};
