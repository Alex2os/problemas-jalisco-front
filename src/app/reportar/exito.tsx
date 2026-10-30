import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReportSuccessAnimation } from "@/features/reports/components/ReportSuccessAnimation";
import { radius, space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ExitoScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const reportId = Number(id);
  const hasReport = Number.isSafeInteger(reportId) && reportId > 0;
  const [pressed, setPressed] = useState<"report" | "map" | null>(null);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleViewReport = () => {
    if (!hasReport) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace({ pathname: "/reporte/[id]", params: { id: String(reportId) } });
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
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(180).duration(360)} style={styles.message}>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{es.success.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{es.success.subtitle}</Text>
          </Animated.View>
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(320).duration(360)} style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={es.success.viewReport}
              accessibilityState={{ disabled: !hasReport }}
              disabled={!hasReport}
              onPress={handleViewReport}
              onPressIn={() => setPressed("report")}
              onPressOut={() => setPressed(null)}
              style={[styles.button, {
                backgroundColor: pressed === "report" ? colors.accentDark : colors.accent,
                opacity: hasReport ? 1 : 0.5,
                transform: [{ scale: pressed === "report" ? 0.99 : 1 }],
              }]}
            >
              <Text style={[styles.buttonText, { color: colors.onAccent }]}>{es.success.viewReport}</Text>
              <View pointerEvents="none" style={styles.trailingIcon}>
                <Ionicons name="arrow-forward" size={22} color={colors.onAccent} />
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={es.success.homeCta}
              onPress={handleDone}
              onPressIn={() => setPressed("map")}
              onPressOut={() => setPressed(null)}
              style={[styles.button, styles.mapButton, {
                backgroundColor: pressed === "map" ? colors.raised : colors.surface,
                borderColor: colors.border,
                transform: [{ scale: pressed === "map" ? 0.99 : 1 }],
              }]}
            >
              <View style={styles.mapLabel}>
                <Ionicons name="map-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.buttonText, { color: colors.textSecondary }]}>{es.success.homeCta}</Text>
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
  mapButton: { borderWidth: 1, minHeight: 52, paddingHorizontal: space.lg },
  mapLabel: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.sm },
});
