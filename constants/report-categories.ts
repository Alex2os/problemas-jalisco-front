import type { ComponentProps } from "react";
import type Feather from "@expo/vector-icons/Feather";

export const categories: Record<
  string,
  { label: string; icon: ComponentProps<typeof Feather>["name"]; color: string }
> = {
  accidente: { label: "Accidente", icon: "alert-triangle", color: "#C28042" },
  basura: { label: "Basura", icon: "trash-2", color: "#728C65" },
  bloqueo: { label: "Bloqueo vial", icon: "slash", color: "#648392" },
  "corte-de-servicios": {
    label: "Corte de servicios",
    icon: "zap-off",
    color: "#B49A4C",
  },
  "transporte-publico": {
    label: "Transporte público",
    icon: "truck",
    color: "#B97A62",
  },
  "robo-asalto": { label: "Robo / asalto", icon: "shield", color: "#A1696D" },
  otros: { label: "Otro problema", icon: "map-pin", color: "#889487" },
};
export const categoryFor = (type: string) =>
  categories[type] || categories.otros;
