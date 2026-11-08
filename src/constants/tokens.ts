import { border, motion, radius, size, space, type } from "./design";
import { brandColors, palette, type AppColors } from "./palette";
import { Colors, FontFamily, Fonts } from "./theme";

export const tokens = {
  space,
  radius,
  size,
  border,
  motion,
  type,
  brand: brandColors,
  palette,
  colors: Colors,
  fonts: Fonts,
  fontFamily: FontFamily,
} as const;

export type DesignTokens = typeof tokens;
export type { AppColors };

export { border, motion, radius, size, space, type } from "./design";
export { palette, brandColors } from "./palette";
export { Colors, Fonts, FontFamily } from "./theme";
export { es } from "./es";
export { darkMapStyle } from "./map-theme";
export {
  CATEGORIES_LIST,
  categories,
  categoryFor,
  categoryDefFor,
  type CategoryDefinition,
} from "./report-categories";
