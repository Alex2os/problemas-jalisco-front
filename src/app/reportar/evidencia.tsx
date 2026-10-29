import React, { useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";

import { OptionalBadge } from "@/src/components/OptionalBadge";
import { ReportStepFooter } from "@/src/components/ReportStepFooter";
import { PhotoPicker } from "@/src/components/app/photo-picker";
import { radius, space } from "@/src/constants/design";
import { es } from "@/src/constants/es";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useDraftStore } from "@/src/store/useDraftStore";

const DESCRIPTION_LIMIT = 255;

export default function EvidenciaScreen() {
  const { colors } = useAppTheme();
  const photos = useDraftStore((state) => state.photos);
  const description = useDraftStore((state) => state.description);
  const setPhotos = useDraftStore((state) => state.setPhotos);
  const setDescription = useDraftStore((state) => state.setDescription);
  const setStep = useDraftStore((state) => state.setStep);
  const [picking, setPicking] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleNext = () => {
    if (picking) return;
    Keyboard.dismiss();
    setStep(4);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/reportar/revisar");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>{es.evidence.title}</Text>
          <Text style={[styles.hint, { color: colors.muted }]}>{es.evidence.hint}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PhotoPicker variant="evidence" photos={photos} onChange={setPhotos} onBusyChange={setPicking} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="create-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.headingGroup}>
              <View style={styles.titleRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción</Text>
                <OptionalBadge />
              </View>
              <Text style={[styles.caption, { color: colors.muted }]}>¿Qué pasa y desde cuándo?</Text>
            </View>
          </View>

          <TextInput
            accessibilityLabel={es.evidence.descriptionLabel}
            value={description}
            onChangeText={(text) => setDescription(text.slice(0, DESCRIPTION_LIMIT))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Escribe aquí los detalles del problema…"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={DESCRIPTION_LIMIT}
            scrollEnabled={false}
            style={[styles.textarea, {
              backgroundColor: colors.background,
              borderColor: focused ? colors.accent : colors.border,
              color: colors.text,
            }]}
          />
          <View style={styles.descriptionFooter}>
            <Text style={[styles.charCount, { color: description.length === DESCRIPTION_LIMIT ? colors.accent : colors.muted }]}>
              {description.length}/{DESCRIPTION_LIMIT}
            </Text>
          </View>
        </View>
      </ScrollView>

      <ReportStepFooter
        title={picking ? "Preparando fotos…" : es.evidence.next}
        disabled={picking}
        onPress={handleNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { width: "100%", maxWidth: 640, alignSelf: "center", padding: space.lg, paddingBottom: space.xxl, gap: space.lg },
  intro: { gap: space.xs, paddingBottom: space.xs },
  heading: { fontSize: 26, lineHeight: 33, fontWeight: "800", letterSpacing: -0.6 },
  hint: { fontSize: 15, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: space.lg, gap: space.lg },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: space.md },
  sectionIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: space.sm },
  headingGroup: { flex: 1, gap: 3 },
  sectionTitle: { fontSize: 17, lineHeight: 23, fontWeight: "700" },
  caption: { fontSize: 12, lineHeight: 18 },
  textarea: { borderRadius: radius.md, borderWidth: 1, padding: 14, fontSize: 16, lineHeight: 24, minHeight: 152, textAlignVertical: "top" },
  descriptionFooter: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", gap: space.sm },
  charCount: { fontSize: 12, lineHeight: 18, fontWeight: "600", textAlign: "right" },
});
