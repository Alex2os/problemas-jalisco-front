import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { radius, shadows, space } from "@/src/constants/design";
import type { CategoryDefinition } from "@/src/constants/report-categories";

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

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(category.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${category.label}. ${category.description}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected
            ? dark
              ? "#1E2C3D"
              : category.bgLight
            : colors.surface,
          borderColor: selected ? category.color : colors.border,
          borderWidth: selected ? 2.5 : 1,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        shadows.sm as any,
        style,
      ]}
    >
      {selected && (
        <View style={[styles.badge, { backgroundColor: category.color }]}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      )}

      {/* Category Icon */}
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: selected ? category.color : dark ? "#2A3649" : category.bgLight },
        ]}
      >
        <Ionicons
          name={category.ionicon as any}
          size={32}
          color={selected ? "#FFFFFF" : category.color}
        />
      </View>

      {/* Label and 1-line description */}
      <Text
        style={[
          styles.label,
          { color: colors.text },
        ]}
        numberOfLines={1}
      >
        {category.label}
      </Text>

      {category.description ? (
        <Text
          style={[styles.description, { color: colors.muted }]}
          numberOfLines={1}
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
    padding: space.md,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 124,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.xs,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
});
