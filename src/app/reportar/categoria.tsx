import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryCard } from "@/features/reports/components/CategoryCard";
import { space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useReportCategories } from "@/hooks/useReportCategories";
import { useDraftStore } from "@/store/useDraftStore";

export default function CategoriaScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { categories } = useReportCategories();

  const selectedCategory = useDraftStore((s) => s.category);
  const setCategory = useDraftStore((s) => s.setCategory);
  const setStep = useDraftStore((s) => s.setStep);

  const handleSelect = (id: string) => {
    setCategory(id);
    setStep(2);
    router.navigate("/reportar/ubicacion");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, space.lg) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>
          {es.categories.title}
        </Text>
        <Text style={[styles.hint, { color: colors.muted }]}>
          {es.categories.hint}
        </Text>

        {/* Waze style big tiles */}
        <View style={styles.grid}>
          {categories.map((cat) => (
            <View key={cat.id} style={styles.gridItem}>
              <CategoryCard
                category={cat}
                selected={selectedCategory === cat.id}
                onSelect={handleSelect}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: space.lg,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: space.xs,
    marginBottom: space.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: space.md,
    columnGap: space.md,
  },
  gridItem: {
    flexBasis: "47%",
    flexGrow: 1,
  },
});
