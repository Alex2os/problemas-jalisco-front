import { palette, brandColors } from "./palette";
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: palette.light.text,
    background: palette.light.background,
    tint: palette.light.primary,
    icon: palette.light.muted,
    tabIconDefault: palette.light.muted,
    tabIconSelected: palette.light.primary,
  },
  dark: {
    text: palette.dark.text,
    background: palette.dark.background,
    tint: palette.dark.primary,
    icon: palette.dark.muted,
    tabIconDefault: palette.dark.muted,
    tabIconSelected: palette.dark.primary,
  },
};

export const FontFamily = {
  nunito: {
    semiBold: "Nunito_600SemiBold",
    bold: "Nunito_700Bold",
    extraBold: "Nunito_800ExtraBold",
  },
  inter: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "Inter_400Regular, system-ui",
    serif: "ui-serif",
    rounded: "Nunito_700Bold, ui-rounded",
    mono: "ui-monospace",
    heading: "Nunito_700Bold",
    body: "Inter_400Regular",
  },
  default: {
    sans: "Inter_400Regular, normal",
    serif: "serif",
    rounded: "Nunito_700Bold, normal",
    mono: "monospace",
    heading: "Nunito_700Bold",
    body: "Inter_400Regular",
  },
  web: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Nunito', 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    heading: "'Nunito', sans-serif",
    body: "'Inter', sans-serif",
  },
});

export { brandColors };
