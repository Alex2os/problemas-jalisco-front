import React, { useRef, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";

import { OptionalBadge } from "@/components/OptionalBadge";
import { CharacterCount } from "@/components/CharacterCount";
import { ReportStepFooter } from "@/features/reports/components/ReportStepFooter";
import { PhotoPicker } from "@/features/reports/components/PhotoPicker";
import { radius, size, space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDraftStore } from "@/store/useDraftStore";
import { getReportTitleError, REPORT_TITLE_LIMIT } from "@/services/create-report";

const DESCRIPTION_LIMIT = 255;

export default function EvidenciaScreen() {
  const { colors } = useAppTheme();
  const photos = useDraftStore((state) => state.photos);
  const title = useDraftStore((state) => state.title);
  const setTitle = useDraftStore((state) => state.setTitle);
  const description = useDraftStore((state) => state.description);
  const setPhotos = useDraftStore((state) => state.setPhotos);
  const setDescription = useDraftStore((state) => state.setDescription);
  const setStep = useDraftStore((state) => state.setStep);
  const [picking, setPicking] = useState(false);
  const [focused, setFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const titleInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const titleError = titleTouched ? getReportTitleError(title) : "";

  const handleNext = () => {
    if (picking) return;
    setTitleTouched(true);
    if (getReportTitleError(title)) {
      scroll.current?.scrollTo({ y: 0, animated: true });
      titleInput.current?.focus();
      return;
    }
    Keyboard.dismiss();
    setStep(4);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/reportar/revisar");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scroll}
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
          <View style={styles.titleLabelRow}>
            <View style={styles.headingGroup}>
              <Text nativeID="report-title-label" style={[styles.sectionTitle, { color: colors.text }]}>
                Título del reporte <Text style={{ color: colors.danger }}>*</Text>
              </Text>
            </View>
            <CharacterCount count={title.length} limit={REPORT_TITLE_LIMIT} />
          </View>
          <TextInput
            ref={titleInput}
            accessibilityLabel="Título del reporte, obligatorio"
            accessibilityLabelledBy="report-title-label"
            accessibilityHint="Escribe un título de hasta 80 caracteres para continuar."
            value={title}
            onChangeText={setTitle}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => { setTitleFocused(false); setTitleTouched(true); }}
            placeholder="Ej. Bache profundo frente a la escuela"
            placeholderTextColor={colors.muted}
            maxLength={REPORT_TITLE_LIMIT}
            autoCapitalize="sentences"
            returnKeyType="done"
            onSubmitEditing={handleNext}
            style={[styles.titleInput, {
              backgroundColor: colors.background,
              borderColor: titleError ? colors.danger : titleFocused ? colors.primary : colors.border,
              color: colors.text,
            }]}
          />
          {!!titleError && (
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.validationMessage, { color: colors.danger }]}>
              {titleError}
            </Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PhotoPicker variant="evidence" photos={photos} onChange={setPhotos} onBusyChange={setPicking} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="create-outline" size={20} color={colors.accentText} />
            </View>
            <View style={styles.headingGroup}>
              <View style={styles.titleRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción</Text>
                <OptionalBadge />
              </View>
            </View>
            <CharacterCount count={description.length} limit={DESCRIPTION_LIMIT} />
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
              borderColor: focused ? colors.primary : colors.border,
              color: colors.text,
            }]}
          />
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
  textarea: { borderRadius: radius.md, borderWidth: 1, padding: 14, fontSize: 16, lineHeight: 24, minHeight: 152, textAlignVertical: "top" },
  titleLabelRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  titleInput: { minHeight: size.control, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: space.md, paddingVertical: space.sm, fontSize: 16, lineHeight: 24 },
  validationMessage: { fontSize: 14, lineHeight: 20 },
});
