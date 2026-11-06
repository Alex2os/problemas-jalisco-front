import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, size, space, type } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { Report } from "@/services/types";

export interface ReportDetailHeaderProps {
  report?: Pick<Report, "id">;
}

export function ReportDetailHeader({ report }: ReportDetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <View
      style={{ paddingTop: insets.top, backgroundColor: colors.background }}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          accessibilityRole="button"
          accessibilityLabel="Atrás"
          style={[
            styles.navBtn,
            { backgroundColor: pressed ? colors.raised : colors.background },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {report ? `Reporte #${report.id}` : "Detalle del reporte"}
        </Text>
        <View style={styles.navBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.sm,
    paddingBottom: space.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    width: size.touch,
    minHeight: size.touch,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...type.label,
    flex: 1,
    textAlign: "center",
    paddingHorizontal: space.sm,
  },
});
