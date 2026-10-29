import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/Button";
import { StepProgress } from "@/src/components/StepProgress";
import { categoryDefFor } from "@/src/constants/report-categories";
import { radius, shadows, space } from "@/src/constants/design";
import { es } from "@/src/constants/es";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useDraftStore } from "@/src/store/useDraftStore";
import { useReportsStore } from "@/src/store/useReportsStore";

export default function RevisarScreen() {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useAppTheme();

  const draft = useDraftStore();
  const resetDraft = useDraftStore((s) => s.resetDraft);
  const setStep = useDraftStore((s) => s.setStep);
  const submitReport = useReportsStore((s) => s.submitReport);

  const [submitting, setSubmitting] = useState(false);
  const categoryDef = categoryDefFor(draft.category || "otro");

  const handleSubmit = async () => {
    setSubmitting(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const created = await submitReport(draft);
      await resetDraft();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/reportar/exito",
        params: { id: String(created.id), folio: created.folio },
      });
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top }}>
        <StepProgress
          currentStep={4}
          totalSteps={4}
          stepTitle="Revisar"
          onBack={() => {
            setStep(3);
            router.back();
          }}
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
          {es.review.title}
        </Text>
        <Text style={[styles.hint, { color: colors.muted }]}>
          {es.review.hint}
        </Text>

        {/* Airbnb / SeeClickFix style Review Summary Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
            shadows.sm as any,
          ]}
        >
          {/* Photo */}
          {draft.photos?.[0] ? (
            <Image
              source={{ uri: draft.photos[0] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.noImageHero, { backgroundColor: categoryDef.bgLight }]}>
              <Ionicons
                name={categoryDef.ionicon as any}
                size={48}
                color={categoryDef.color}
              />
            </View>
          )}

          <View style={styles.cardDetails}>
            {/* Category */}
            <View style={styles.catRow}>
              <View
                style={[styles.colorDot, { backgroundColor: categoryDef.color }]}
              />
              <Text style={[styles.catName, { color: colors.text }]}>
                {categoryDef.label}
              </Text>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={16} color={colors.accent} />
              <Text style={[styles.locationText, { color: colors.text }]}>
                {draft.address || "Ubicación en Jalisco"}
                {draft.colonia ? `, Col. ${draft.colonia}` : ""}
              </Text>
            </View>

            {/* Restored Short Description */}
            {draft.description.trim() ? (
              <Text style={[styles.descText, { color: colors.textSecondary }]}>
                "{draft.description.trim()}"
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom "Enviar reporte" Button */}
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
          title={submitting ? "Enviando..." : es.review.send}
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          onPress={handleSubmit}
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
  card: {
    borderRadius: radius.group,
    borderWidth: 1,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: 180,
  },
  noImageHero: {
    width: "100%",
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDetails: {
    padding: space.md,
    gap: space.sm,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 17,
    fontWeight: "800",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  descText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
    marginTop: 2,
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
