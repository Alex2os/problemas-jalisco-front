import React, { useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { ErrorBanner } from "@/components/ErrorBanner";
import { useAuthSession } from "@/hooks/useReportState";
import { ReportStepFooter } from "@/features/reports/components/ReportStepFooter";
import { ReportFeedItem } from "@/features/reports/components/ReportFeedItem";
import { space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDraftStore } from "@/store/useDraftStore";
import { useReportsStore } from "@/store/useReportsStore";
import type { Report } from "@/services/types";

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

  const previewReport = useMemo<Report>(() => {
    const canonicalCategory = draft.category || "otro";
    const formattedAddress =
      draft.address ||
      (draft.colonia ? `Col. ${draft.colonia}` : "Ubicación en Jalisco");

    return {
      id: 0,
      folio: "PREVIEW",
      category: canonicalCategory,
      type: canonicalCategory,
      title: draft.title.trim(),
      description: draft.description.trim(),
      latitude: draft.latitude ?? 20.6766,
      longitude: draft.longitude ?? -103.347,
      ubication: formattedAddress,
      address: draft.address,
      colonia: draft.colonia,
      municipality: draft.municipality,
      reference: draft.reference,
      photos: (draft.photos || []).map((photo, index) => ({
        id: index + 1,
        url: photo.uri,
      })),
      status: "reportado",
      status_version: 1,
      can_manage: true,
      created_at: new Date().toISOString(),
      user_id: 0,
      username: "Tú",
      like_count: 0,
      comment_count: 0,
      liked_by_me: false,
    };
  }, [
    draft.category,
    draft.title,
    draft.description,
    draft.latitude,
    draft.longitude,
    draft.address,
    draft.colonia,
    draft.municipality,
    draft.reference,
    draft.photos,
  ]);

  const handleSubmit = async () => {
    if (!authenticated) {
      router.push({
        pathname: "/auth/login",
        params: { returnTo: "/reportar/revisar" },
      });
      return;
    }
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
      setError(
        failure instanceof Error
          ? failure.message
          : "No se pudo enviar el reporte.",
      );
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

        {/* Vista previa fiel con el componente de publicación real de Reportes */}
        <ReportFeedItem report={previewReport} readOnly />

        {!!error && <ErrorBanner message={error} />}
      </ScrollView>

      <ReportStepFooter
        title={
          submitting
            ? "Enviando reporte…"
            : authenticated
              ? es.review.send
              : "Inicia sesión para enviar"
        }
        icon={authenticated ? "paper-plane-outline" : "log-in-outline"}
        loading={submitting}
        onPress={() => {
          void handleSubmit();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    padding: space.lg,
    paddingBottom: space.xxl,
    gap: space.sm,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  hint: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: space.md,
    lineHeight: 20,
  },
});
