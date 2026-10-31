import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { radius, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthSession } from "@/hooks/useReportState";
import type { Report } from "@/services/types";

export function ReportEditButton({ report }: { report: Report }) {
  const { colors } = useAppTheme();
  const authenticated = useAuthSession();
  const [pressed, setPressed] = useState(false);
  if (!authenticated || !report.can_manage) return null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Editar reporte: fotos y estado"
      onPress={() => router.push({ pathname: "/reporte/editar/[id]", params: { id: String(report.id) } })}
      onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
      style={[styles.button, { backgroundColor: pressed ? colors.raised : colors.surface, borderColor: colors.border }]}>
      <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name="create-outline" size={22} color={colors.accentText} />
      </View>
      <View style={styles.label}>
        <Text style={[styles.title, { color: colors.text }]}>Editar reporte</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Fotos y estado</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { minHeight: 68, borderWidth: 1, borderRadius: radius.group, padding: space.md, flexDirection: "row", alignItems: "center", gap: space.md },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  label: { flex: 1, gap: 3 },
  title: { fontSize: 15, lineHeight: 21, fontWeight: "700" },
  subtitle: { fontSize: 12, lineHeight: 18 },
});
