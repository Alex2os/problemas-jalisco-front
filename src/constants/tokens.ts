import { border, radius, shadows, size, space, type } from "./design";
import { palette, type AppColors } from "./palette";
import { Colors, Fonts } from "./theme";

export const tokens = {
  space,
  radius,
  size,
  border,
  shadows,
  type,
  palette,
  colors: Colors,
  fonts: Fonts,
} as const;

export type DesignTokens = typeof tokens;
export type { AppColors };

export { border, radius, shadows, size, space, type } from "./design";
export { palette } from "./palette";
export { Colors, Fonts } from "./theme";
export { es } from "./es";
export { darkMapStyle } from "./map-theme";
export {
  CATEGORIES_LIST,
  categories,
  categoryFor,
  categoryDefFor,
  type CategoryDefinition,
} from "./report-categories";
