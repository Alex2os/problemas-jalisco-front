import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { StyleProp, TextStyle } from "react-native";
import type { CategoryVisual } from "@/constants/report-categories";

export const CATEGORY_ICON_FONTS = { ...Ionicons.font, ...MaterialCommunityIcons.font };

export function CategoryIcon({ category, ...props }: {
  category: Pick<CategoryVisual, "ionicon" | "materialCommunityIcon">;
  size: number;
  color: string;
  style?: StyleProp<TextStyle>;
  allowFontScaling?: boolean;
  accessibilityLabel?: string;
}) {
  return category.materialCommunityIcon
    ? <MaterialCommunityIcons name={category.materialCommunityIcon} {...props} />
    : <Ionicons name={category.ionicon} {...props} />;
}
