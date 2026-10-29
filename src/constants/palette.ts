export const palette = {
  light: {
    // Brand Colors
    primary: "#0F2942", // Deep Blue Primary
    primaryDark: "#091B2C",
    primarySoft: "#E8EEF5",
    onPrimary: "#FFFFFF",

    accent: "#FF6B00", // Warm Orange Accent for Main CTA
    accentDark: "#E05A00",
    accentSoft: "#FFF0E5",
    onAccent: "#FFFFFF",

    agave: "#0D9488", // Agave Blue-Green
    agaveSoft: "#E6F4F1",
    onAgave: "#FFFFFF",

    // Neutral Surfaces & Text
    background: "#F8FAFC",
    surface: "#FFFFFF",
    raised: "#F1F5F9",
    text: "#0F172A",
    textSecondary: "#475569",
    muted: "#64748B",
    border: "#E2E8F0",
    borderStrong: "#CBD5E1",

    // Functional & Feedback
    danger: "#DC2626",
    dangerSoft: "#FEE2E2",
    warning: "#D97706",
    warningSoft: "#FEF3C7",
    success: "#16A34A",
    successSoft: "#DCFCE7",
    info: "#0284C7",
    infoSoft: "#E0F2FE",

    // Status Colors (Never convey status by color alone)
    status: {
      reportado: { text: "#EA580C", bg: "#FFF7ED", border: "#FDBA74" },
      resuelto: { text: "#16A34A", bg: "#DCFCE7", border: "#BBF7D0" },
    },
  },

  dark: {
    // Brand Colors
    primary: "#38BDF8", // Lighter Blue for Dark Mode
    primaryDark: "#0F2942",
    primarySoft: "#132D48",
    onPrimary: "#0F172A",

    accent: "#FF8A3D", // Warm Orange for Dark Mode
    accentDark: "#FF6B00",
    accentSoft: "#3B1B0A",
    onAccent: "#FFFFFF",

    agave: "#2DD4BF",
    agaveSoft: "#12302D",
    onAgave: "#042F2E",

    // Neutral Surfaces & Text
    background: "#0B1120",
    surface: "#1E293B",
    raised: "#293548",
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    muted: "#94A3B8",
    border: "#334155",
    borderStrong: "#475569",

    // Functional & Feedback
    danger: "#F87171",
    dangerSoft: "#3B1517",
    warning: "#FBBF24",
    warningSoft: "#3A2B0D",
    success: "#4ADE80",
    successSoft: "#10321B",
    info: "#38BDF8",
    infoSoft: "#0C2E49",

    // Status Colors
    status: {
      reportado: { text: "#FB923C", bg: "#2E1A0C", border: "#7C2D12" },
      resuelto: { text: "#4ADE80", bg: "#10321B", border: "#175A2E" },
    },
  },
};

export type AppColors = typeof palette.light;
