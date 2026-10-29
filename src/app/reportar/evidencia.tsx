import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/Button";
import { PhotoPicker } from "@/src/components/PhotoPicker";
import { StepProgress } from "@/src/components/StepProgress";
import { radius, space } from "@/src/constants/design";
import { es } from "@/src/constants/es";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useDraftStore } from "@/src/store/useDraftStore";

export default function EvidenciaScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const photos = useDraftStore((s) => s.photos);
  const description = useDraftStore((s) => s.description);
  const addPhoto = useDraftStore((s) => s.addPhoto);
  const removePhoto = useDraftStore((s) => s.removePhoto);
  const setDescription = useDraftStore((s) => s.setDescription);
  const setStep = useDraftStore((s) => s.setStep);

  const [isListening, setIsListening] = useState(false);
  const charLimit = 280;

  const handleToggleVoice = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const addition = description ? `${description}. Problema en la vía pública.` : "Problema en la vía pública.";
        setDescription(addition.slice(0, charLimit));
        setIsListening(false);
      }, 1800);
    }
  };

  const handleQuickTag = (tag: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newText = description.trim() === "" ? tag : `${description}. ${tag}`;
    if (newText.length <= charLimit) {
      setDescription(newText);
    }
  };

  const handleNext = () => {
    setStep(4);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/reportar/revisar");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={{ paddingTop: insets.top }}>
        <StepProgress
          currentStep={3}
          totalSteps={4}
          stepTitle="Evidencia"
          onBack={() => {
            setStep(2);
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
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.heading, { color: colors.text }]}>
          {es.evidence.title}
        </Text>
        <Text style={[styles.hint, { color: colors.muted }]}>
          {es.evidence.hint}
        </Text>

        {/* Photo Picker */}
        <PhotoPicker
          photos={photos}
          maxPhotos={3}
          onAddPhoto={addPhoto}
          onRemovePhoto={removePhoto}
        />

        {/* Description Section with Mic Button */}
        <View style={styles.descHeader}>
          <Text style={[styles.descLabel, { color: colors.text }]}>
            {es.evidence.descriptionLabel}
          </Text>

          <Pressable
            onPress={handleToggleVoice}
            accessibilityRole="button"
            accessibilityLabel="Dictar reporte por voz"
            style={[
              styles.micBtn,
              {
                backgroundColor: isListening ? colors.danger : colors.surface,
                borderColor: isListening ? colors.danger : colors.border,
              },
            ]}
          >
            <Ionicons
              name={isListening ? "mic" : "mic-outline"}
              size={16}
              color={isListening ? "#FFFFFF" : colors.accent}
            />
            <Text
              style={[
                styles.micBtnText,
                { color: isListening ? "#FFFFFF" : colors.accent },
              ]}
            >
              {isListening ? es.common.listening : es.common.mic}
            </Text>
          </Pressable>
        </View>

        <TextInput
          value={description}
          onChangeText={(t) => setDescription(t.slice(0, charLimit))}
          placeholder={es.evidence.descriptionPlaceholder}
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={3}
          maxLength={charLimit}
          style={[
            styles.textarea,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
        />

        <Text style={[styles.charCount, { color: colors.muted }]}>
          {description.length}/{charLimit}
        </Text>

        {/* Quick Suggestion Tags */}
        <View style={styles.quickTagsSection}>
          <Text style={[styles.quickTagsTitle, { color: colors.muted }]}>
            {es.evidence.quickTagsTitle}
          </Text>
          <View style={styles.quickTagsWrap}>
            {es.evidence.quickTags.map((tag, idx) => (
              <Pressable
                key={idx}
                onPress={() => handleQuickTag(tag)}
                accessibilityRole="button"
                accessibilityLabel={`Agregar ${tag}`}
                style={[
                  styles.tagPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.text }]}>
                  + {tag}
                </Text>
              </Pressable>
            ))}
          </View>
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
          title={es.evidence.next}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
        />
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: space.md,
    lineHeight: 20,
  },
  descHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: space.md,
    marginBottom: space.xs,
  },
  descLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  micBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  micBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  textarea: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: space.md,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  quickTagsSection: {
    marginTop: space.sm,
  },
  quickTagsTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  quickTagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
  },
  tagPill: {
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
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
