import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryCard } from "@/src/components/CategoryCard";
import { CATEGORIES_LIST } from "@/src/constants/report-categories";
import { space } from "@/src/constants/design";
import { es } from "@/src/constants/es";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useDraftStore } from "@/src/store/useDraftStore";

export default function CategoriaScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

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
          {CATEGORIES_LIST.map((cat) => (
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
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  hint: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: space.lg,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: space.md,
    marginHorizontal: -space.sm,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: space.sm,
  },
});
