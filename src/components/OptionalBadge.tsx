import { StyleSheet, Text, View } from "react-native";
import { radius, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";

export function OptionalBadge() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.raised, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.muted }]}>Opcional</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: space.sm, paddingVertical: 2, alignSelf: "center" },
  label: { fontSize: 11, lineHeight: 16, fontWeight: "600" },
});
