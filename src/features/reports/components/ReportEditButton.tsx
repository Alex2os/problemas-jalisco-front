import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { radius, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthSession } from "@/hooks/useReportState";
import type { Report } from "@/services/types";

export function ReportEditButton({ report, compact = false }: { report: Report; compact?: boolean }) {
  const { colors } = useAppTheme();
  const authenticated = useAuthSession();
  const [pressed, setPressed] = useState(false);
  if (!authenticated || !report.can_manage) return null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Editar reporte: fotos y estado"
      onPress={() => router.push({ pathname: "/reporte/editar/[id]", params: { id: String(report.id) } })}
      onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
      style={[styles.button, compact && styles.compact, { backgroundColor: compact ? pressed ? colors.primaryDark : colors.primary : pressed ? colors.raised : colors.surface, borderColor: compact ? colors.primary : colors.border }]}>
      <View style={[styles.icon, compact && styles.compactIcon, { backgroundColor: compact ? "transparent" : colors.accentSoft }]}>
        <Ionicons name="create-outline" size={compact ? 18 : 22} color={compact ? colors.onPrimary : colors.accentText} />
      </View>
      <View style={compact ? styles.compactLabel : styles.label}>
        <Text style={[styles.title, compact && styles.compactTitle, { color: compact ? colors.onPrimary : colors.text }]}>Editar reporte</Text>
        {!compact && <Text style={[styles.subtitle, { color: colors.muted }]}>Fotos y estado</Text>}
      </View>
      {!compact && <Ionicons name="chevron-forward" size={20} color={colors.muted} />}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  compact: { minHeight: 48, borderWidth: 0, paddingVertical: space.sm, paddingHorizontal: space.md, gap: space.sm, borderRadius: radius.control, flexShrink: 1 },
  compactIcon: { width: 20, height: 20 },
  compactLabel: { flexShrink: 1 },
  compactTitle: { fontSize: 14, lineHeight: 20 },
  button: { minHeight: 68, borderWidth: 1, borderRadius: radius.group, padding: space.md, flexDirection: "row", alignItems: "center", gap: space.md },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  label: { flex: 1, gap: 3 },
  title: { fontSize: 15, lineHeight: 21, fontWeight: "700" },
  subtitle: { fontSize: 12, lineHeight: 18 },
});
