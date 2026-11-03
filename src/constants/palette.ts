// Paleta central de marca aprobada — ProblemasJalisco
// Identidad cromática: Jalisco Claro & Jalisco Carbón
export const brandColors = {
  // Colores primitivos de marca aprobados
  orange: "#FE8B01",
  pink: "#E00B50",
  sky: "#58C3E3",
  gray: "#7C848A",

  // Alias de compatibilidad heredada
  forest: "#202938",
  olive: "#E00B50",
  neutral: "#7C848A",
  petroleum: "#58C3E3",
  water: "#58C3E3",
  warmOrange: "#FE8B01",
} as const;

export const palette = {
  light: {
    // Brand Colors (Light — Jalisco Claro)
    primary: "#E00B50", // Rosa principal
    primaryDark: "#B8083F", // Rosa oscuro para estados pressed
    primarySoft: "#FDE8EF", // Surface accent rosa suave
    primaryText: "#E00B50", // Rosa con contraste AA (4.8:1 sobre blanco, 4.56:1 sobre background)
    onPrimary: "#FFFFFF", // Texto e iconos claros legibles sobre botón rosa (4.85:1)

    // Secondary & Accent
    secondary: "#FE8B01", // Naranja secundario
    secondaryDark: "#D97500",
    secondarySoft: "#FFF4E5", // Surface accent naranja suave
    secondaryText: "#AA5800", // Naranja con contraste AA sobre superficies claras
    onSecondary: "#202938", // Texto oscuro legible sobre naranja
    accent: "#58C3E3", // Azul cielo de acento
    accentDark: "#39A6C8",
    accentSoft: "#EAF8FC",
    accentText: "#0F6E8C", // Azul contextual con contraste AA sobre superficies claras
    onAccent: "#202938", // Texto oscuro legible sobre acento azul cielo

    // Agave & Water (compatibilidad semántica)
    agave: "#58C3E3",
    agaveSoft: "#EAF8FC",
    onAgave: "#202938",
    water: "#58C3E3",

    // Neutral Surfaces & Text
    background: "#F7F8FA",
    surface: "#FFFFFF",
    surfaceAccent: "#FDE8EF",
    raised: "#F0F2F5",
    text: "#202938", // Text primary
    textSecondary: "#657083", // Text secondary
    muted: "#7C848A", // Gris institucional de referencia
    border: "#E1E5EA",
    borderStrong: "#C5CDD6",

    // Functional & Feedback (accesibilidad WCAG AA contrastada)
    danger: "#C53030",
    dangerSoft: "#FDE8E8",
    warning: "#D97706",
    warningSoft: "#FEF3C7",
    success: "#2F7C20",
    successSoft: "#EAF5E7",
    info: "#1E7898",
    infoSoft: "#EAF8FC",

    // Status Colors (Never convey status by color alone)
    status: {
      reportado: { text: "#B45309", bg: "#FEF3C7", border: "#FCD34D" },
      resuelto: { text: "#1E5F12", bg: "#EAF5E7", border: "#A7D79C" },
    },
  },

  dark: {
    // Brand Colors (Dark — Jalisco Carbón)
    primary: "#FF4D83", // Rosa principal (variante visual dark)
    primaryDark: "#E00B50", // Rosa para estados pressed
    primarySoft: "#2D1520", // Surface accent rosa oscuro
    primaryText: "#FF4D83", // Rosa legible sobre fondos oscuros (6.1:1 sobre background)
    onPrimary: "#0D0E10", // Texto oscuro de alto contraste sobre rosa dark (6.1:1)

    // Secondary & Accent (variantes visuales dark)
    secondary: "#FE8B01", // Naranja secundario
    secondaryDark: "#D97500",
    secondarySoft: "#2E2010", // Surface accent naranja oscuro
    secondaryText: "#FE8B01",
    onSecondary: "#0D0E10", // Texto oscuro legible sobre naranja
    accent: "#7DDAF2", // Azul cielo de acento (uso visual dark)
    accentDark: "#58C3E3",
    accentSoft: "#162930",
    accentText: "#7DDAF2",
    onAccent: "#0D0E10", // Texto oscuro legible sobre acento azul cielo dark

    // Agave & Water (compatibilidad semántica)
    agave: "#7DDAF2",
    agaveSoft: "#162930",
    onAgave: "#0D0E10",
    water: "#7DDAF2",

    // Neutral Surfaces & Text
    background: "#0D0E10",
    surface: "#1A1B1F",
    surfaceAccent: "#2D1520",
    raised: "#292A2E",
    text: "#F6F5F3", // Text primary
    textSecondary: "#B0B0B4", // Text secondary
    muted: "#8E9399",
    border: "#35363B",
    borderStrong: "#4C4E55",

    // Functional & Feedback
    danger: "#E57373",
    dangerSoft: "#2E1E1E",
    warning: "#FBBF24",
    warningSoft: "#35280E",
    success: "#81C784",
    successSoft: "#182C19",
    info: "#7DDAF2",
    infoSoft: "#162930",

    // Status Colors
    status: {
      reportado: { text: "#E9B66A", bg: "#30271A", border: "#67502C" },
      resuelto: { text: "#9DBA78", bg: "#1E2C1B", border: "#3E5C36" },
    },
  },
};

export type AppColors = typeof palette.light;
