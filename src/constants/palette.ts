// Paleta central de marca aprobada — ProblemasJalisco
export const brandColors = {
  forest: "#19350C",
  olive: "#687D31",
  neutral: "#D5D3CC",
  petroleum: "#406768",
  water: "#6FA9BB",
  warmOrange: "#E9A23B",
} as const;

export const palette = {
  light: {
    // Brand Colors (Light — Agave Cream)
    primary: "#19350C", // Forest
    primaryDark: "#0F2107",
    primarySoft: "#E8EEDC", // Surface accent
    onPrimary: "#FFFFFF",

    // Secondary & Accent
    secondary: "#687D31", // Olive
    accent: "#E9A23B", // Warm Orange
    accentDark: "#C98523",
    accentSoft: "#FDF5E8",
    onAccent: "#FFFFFF",

    // Agave & Water
    agave: "#406768", // Petroleum
    agaveSoft: "#E4ECEC",
    onAgave: "#FFFFFF",
    water: "#6FA9BB",

    // Neutral Surfaces & Text
    background: "#F5F1E8", // Agave Cream
    surface: "#FFFCF6", // Surface
    surfaceAccent: "#E8EEDC", // Surface accent
    raised: "#EDE7DA",
    text: "#19350C", // Text principal
    textSecondary: "#405525", // Text secundario
    muted: "#76866E",
    border: "#E2DDD2",
    borderStrong: "#C8C2B4",

    // Functional & Feedback (accesibilidad WCAG AA contrastada)
    danger: "#C53030",
    dangerSoft: "#FDE8E8",
    warning: "#D97706",
    warningSoft: "#FEF3C7",
    success: "#2F7C20",
    successSoft: "#EAF5E7",
    info: "#2A6E82",
    infoSoft: "#E5F4F8",

    // Status Colors (Never convey status by color alone)
    status: {
      reportado: { text: "#B45309", bg: "#FEF3C7", border: "#FCD34D" },
      resuelto: { text: "#1E5F12", bg: "#EAF5E7", border: "#A7D79C" },
    },
  },

  dark: {
    // Brand Colors (Dark — Obsidiana Botánica)
    primary: "#9DBA78", // Primary action
    primaryDark: "#85A35F",
    primarySoft: "#344333", // Surface accent
    onPrimary: "#172015", // Primary action text

    // Secondary & Accent
    secondary: "#687D31",
    accent: "#E9A23B", // Warm Orange
    accentDark: "#C98523",
    accentSoft: "#382914",
    onAccent: "#172015",

    // Agave & Water
    agave: "#6FA9BB",
    agaveSoft: "#1B3037",
    onAgave: "#141A16",
    water: "#6FA9BB",

    // Neutral Surfaces & Text
    background: "#141A16", // Obsidiana Botánica
    surface: "#232B25", // Surface
    surfaceAccent: "#344333", // Surface accent
    raised: "#252F27", // Surface elevada
    text: "#F3F1E9", // Text principal
    textSecondary: "#AEB7AD", // Text secundario
    muted: "#7E887D",
    border: "#333E36",
    borderStrong: "#455348",

    // Functional & Feedback
    danger: "#E57373",
    dangerSoft: "#371A1A",
    warning: "#FBBF24",
    warningSoft: "#35280E",
    success: "#81C784",
    successSoft: "#182C19",
    info: "#6FA9BB",
    infoSoft: "#182B30",

    // Status Colors
    status: {
      reportado: { text: "#FBBF24", bg: "#35280E", border: "#785210" },
      resuelto: { text: "#9DBA78", bg: "#1E2C1B", border: "#3E5C36" },
    },
  },
};

export type AppColors = typeof palette.light;
