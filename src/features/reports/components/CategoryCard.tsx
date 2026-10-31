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
import { useAppTheme } from "@/hooks/useAppTheme";
import { radius, space } from "@/constants/design";
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
              ? category.bgDark || colors.raised
              : category.bgLight
            : colors.surface,
          borderColor: selected ? category.color : colors.border,
          borderWidth: 2,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {/* Category Icon */}
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: selected ? category.color : dark ? colors.raised : category.bgLight },
        ]}
      >
        <Ionicons
          name={category.ionicon}
          size={32}
          allowFontScaling={false}
          style={styles.icon}
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
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.xs,
  },
  icon: {
    width: 32,
    height: 32,
    lineHeight: 32,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
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
