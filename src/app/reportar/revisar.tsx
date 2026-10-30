import React, { useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ErrorBanner } from "@/components/ErrorBanner";
import { useAuthSession } from "@/hooks/useReportState";
import { ReportStepFooter } from "@/features/reports/components/ReportStepFooter";
import { categoryDefFor } from "@/constants/report-categories";
import { radius, space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDraftStore } from "@/store/useDraftStore";
import { useReportsStore } from "@/store/useReportsStore";

export default function RevisarScreen() {
  const { colors } = useAppTheme();

  const draft = useDraftStore();
  const resetDraft = useDraftStore((s) => s.resetDraft);
  const submitReport = useReportsStore((s) => s.submitReport);

  const submitting = useDraftStore((s) => s.isSubmitting);
  const setSubmitting = useDraftStore((s) => s.setSubmitting);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const authenticated = useAuthSession();
  const categoryDef = categoryDefFor(draft.category || "otro");

  const handleSubmit = async () => {
    if (!authenticated) { router.push({ pathname: "/auth/login", params: { returnTo: "/reportar/revisar" } }); return; }
    if (pending.current) return;
    pending.current = true;
    setError("");
    setSubmitting(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const created = await submitReport(draft);
      await resetDraft();
      router.replace({
        pathname: "/reportar/exito",
        params: { id: String(created.id) },
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo enviar el reporte.");
      setSubmitting(false);
    } finally {
      pending.current = false;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
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
          ]}
        >
          {/* Photo */}
          {draft.photos?.[0] ? (
            <Image
              source={{ uri: draft.photos[0].uri }}
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
                {draft.description.trim()}
              </Text>
            ) : null}
          </View>
        </View>
        {!!error && <ErrorBanner message={error} />}
      </ScrollView>

      <ReportStepFooter
        title={submitting ? "Enviando reporte…" : authenticated ? es.review.send : "Inicia sesión para enviar"}
        icon={authenticated ? "paper-plane-outline" : "log-in-outline"}
        loading={submitting}
        onPress={() => { void handleSubmit(); }}
      />
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
});
