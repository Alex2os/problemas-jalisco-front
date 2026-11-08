import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReportSuccessAnimation } from "@/features/reports/components/ReportSuccessAnimation";
import { motion, radius, space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ExitoScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const reportId = Number(id);
  const hasReport = Number.isSafeInteger(reportId) && reportId > 0;
  const [pressed, setPressed] = useState<"report" | "explore" | "map" | null>(null);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleViewReport = () => {
    if (!hasReport) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace({ pathname: "/reporte/[id]", params: { id: String(reportId) } });
  };
  const handleExploreReports = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismissTo("/mis-reportes");
  };
  const handleDone = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismissTo("/mapa");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, {
        paddingTop: insets.top + space.xxl,
        paddingBottom: insets.bottom + space.xxl,
      }]} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <ReportSuccessAnimation />
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(180).duration(motion.enter)} style={styles.message}>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{es.success.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{es.success.subtitle}</Text>
          </Animated.View>
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(320).duration(motion.enter)} style={styles.actions}>
            {/* Acción primaria — Ver reporte */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={es.success.viewReport}
              accessibilityState={{ disabled: !hasReport }}
              disabled={!hasReport}
              onPress={handleViewReport}
              onPressIn={() => setPressed("report")}
              onPressOut={() => setPressed(null)}
              style={[styles.button, {
                backgroundColor: pressed === "report" ? colors.primaryDark : colors.primary,
                opacity: hasReport ? 1 : 0.5,
                transform: [{ scale: pressed === "report" ? 0.99 : 1 }],
              }]}
            >
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{es.success.viewReport}</Text>
              <View pointerEvents="none" style={styles.trailingIcon}>
                <Ionicons name="arrow-forward" size={22} color={colors.onPrimary} />
              </View>
            </Pressable>

            {/* Acción secundaria — Explorar reportes */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={es.success.exploreReports}
              onPress={handleExploreReports}
              onPressIn={() => setPressed("explore")}
              onPressOut={() => setPressed(null)}
              style={[styles.button, styles.secondaryButton, {
                backgroundColor: pressed === "explore" ? colors.surface : colors.raised,
                transform: [{ scale: pressed === "explore" ? 0.99 : 1 }],
              }]}
            >
              <View style={styles.buttonInnerRow}>
                <Ionicons name="document-text-outline" size={20} color={colors.text} />
                <Text style={[styles.buttonText, { color: colors.text }]}>{es.success.exploreReports}</Text>
              </View>
            </Pressable>

            {/* Acción terciaria — Volver al mapa */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={es.success.homeCta}
              onPress={handleDone}
              onPressIn={() => setPressed("map")}
              onPressOut={() => setPressed(null)}
              style={[styles.tertiaryButton, {
                backgroundColor: pressed === "map" ? colors.raised : "transparent",
              }]}
            >
              <View style={styles.buttonInnerRow}>
                <Ionicons name="map-outline" size={19} color={colors.textSecondary} />
                <Text style={[styles.tertiaryButtonText, { color: colors.textSecondary }]}>{es.success.homeCta}</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: space.xxl },
  panel: { width: "100%", maxWidth: 420, alignSelf: "center" },
  message: { gap: space.md, alignItems: "center" },
  title: { fontSize: 30, lineHeight: 38, fontWeight: "800", letterSpacing: -0.7, textAlign: "center", alignSelf: "center" },
  subtitle: { fontSize: 15, lineHeight: 23, maxWidth: 300, textAlign: "center", alignSelf: "center" },
  actions: { width: "100%", marginTop: space.xxxl, gap: space.md },
  button: { width: "100%", minHeight: 56, borderRadius: radius.group, paddingHorizontal: 48, paddingVertical: space.lg, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 16, lineHeight: 22, fontWeight: "700", textAlign: "center", alignSelf: "center", includeFontPadding: false },
  trailingIcon: { position: "absolute", right: space.lg, top: 0, bottom: 0, width: 24, alignItems: "center", justifyContent: "center" },
  secondaryButton: { borderWidth: 0, minHeight: 52, paddingHorizontal: space.lg },
  buttonInnerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.sm },
  tertiaryButton: { width: "100%", minHeight: 48, borderRadius: radius.group, paddingHorizontal: space.lg, paddingVertical: space.sm, alignItems: "center", justifyContent: "center" },
  tertiaryButtonText: { fontSize: 15, lineHeight: 20, fontWeight: "600", textAlign: "center", alignSelf: "center", includeFontPadding: false },
});
