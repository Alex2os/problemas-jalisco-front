import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/Button";
import { CategoryCard } from "@/src/components/CategoryCard";
import { StepProgress } from "@/src/components/StepProgress";
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
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = () => {
    if (!selectedCategory) return;
    setStep(2);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/reportar/ubicacion");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top }}>
        <StepProgress
          currentStep={1}
          totalSteps={4}
          stepTitle="Categoría"
          onBack={() => router.back()}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 80 },
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

      {/* Sticky Bottom Next Button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <Button
          title={selectedCategory ? es.common.continue : "Selecciona una categoría"}
          disabled={!selectedCategory}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
        />
      </View>
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
    gap: space.md,
  },
  gridItem: {
    width: "47.5%",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
});
