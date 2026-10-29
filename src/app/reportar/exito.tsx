import React, { useEffect, useState } from "react";
import { Clipboard, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/Button";
import { radius, shadows, space } from "@/src/constants/design";
import { es } from "@/src/constants/es";
import { useAppTheme } from "@/src/hooks/use-app-theme";

export default function ExitoScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ id?: string; folio?: string }>();
  const folio = params.folio || "PJ-000123";
  const reportId = params.id || "101";

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleCopy = () => {
    Clipboard.setString(folio);
    setCopied(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewReport = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(`/reporte/${reportId}`);
  };

  const handleDone = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Checkmark */}
        <View
          style={[styles.checkCircle, { backgroundColor: colors.successSoft }]}
        >
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {es.success.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {es.success.subtitle}
        </Text>

        {/* Folio Card with Copy button */}
        <View
          style={[
            styles.folioCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
            shadows.sm as any,
          ]}
        >
          <Text style={[styles.folioLabel, { color: colors.muted }]}>
            {es.success.folioLabel}
          </Text>

          <View style={styles.folioRow}>
            <Text style={[styles.folioText, { color: colors.primary }]}>
              #{folio}
            </Text>

            <Pressable
              onPress={handleCopy}
              accessibilityRole="button"
              accessibilityLabel="Copiar folio"
              style={[
                styles.copyBtn,
                { backgroundColor: copied ? colors.successSoft : colors.raised },
              ]}
            >
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={16}
                color={copied ? colors.success : colors.text}
              />
              <Text
                style={[
                  styles.copyBtnText,
                  { color: copied ? colors.success : colors.text },
                ]}
              >
                {copied ? "Copiado" : "Copiar"}
              </Text>
            </Pressable>
          </View>
        </View>

      </View>

      {/* Buttons */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Button
          title={es.success.viewReport}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleViewReport}
          style={{ marginBottom: space.sm }}
        />

        <Button
          title={es.success.homeCta}
          variant="outline"
          size="md"
          fullWidth
          onPress={handleDone}
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: space.md,
  },
  folioCard: {
    width: "100%",
    borderRadius: radius.group,
    borderWidth: 1,
    padding: space.md,
    alignItems: "center",
    marginBottom: space.xs,
  },
  folioLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  folioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  folioText: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space.lg,
  },
});
