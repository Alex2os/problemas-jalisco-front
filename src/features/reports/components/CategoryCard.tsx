import { CategoryIcon } from "@/features/reports/components/CategoryIcon";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { border, radius, size, space } from "@/constants/design";
import type { CategoryDefinition } from "@/constants/report-categories";

export interface CategoryCardProps {
  category: CategoryDefinition;
  selected?: boolean;
  onSelect: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function CategoryCard({
  category,
  selected = false,
  onSelect,
  style,
}: CategoryCardProps) {
  const { colors, dark } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(category.id);
  };

  const backgroundColor = selected
    ? dark
      ? category.bgDark || colors.raised
      : category.bgLight
    : pressed
      ? colors.raised
      : colors.surface;

  const borderColor = selected ? category.color : colors.border;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`${category.label}. ${category.description || ""}`}
      accessibilityHint="Toca para seleccionar esta categoría y continuar a la ubicación"
      accessibilityState={{ selected }}
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {/* Category Icon */}
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: dark
              ? category.bgDark || colors.raised
              : category.bgLight,
          },
        ]}
      >
        <CategoryIcon
          category={category}
          size={28}
          allowFontScaling={false}
          style={styles.icon}
          color={category.color}
        />
      </View>

      {/* Label and description */}
      <Text
        style={[
          styles.label,
          { color: colors.text },
        ]}
        numberOfLines={2}
      >
        {category.label}
      </Text>

      {category.description ? (
        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {category.description}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.group,
    borderWidth: border.normal,
    paddingHorizontal: space.sm,
    paddingVertical: space.md,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: size.minTouch * 2.2, // ~106px para asegurar área táctil amplia y estabilidad
    width: "100%",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  icon: {
    width: 28,
    height: 28,
    lineHeight: 28,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    marginTop: space.xs,
  },
});
