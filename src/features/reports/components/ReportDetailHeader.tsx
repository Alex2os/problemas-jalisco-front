import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { Report } from "@/services/types";

export interface ReportDetailHeaderProps {
  report?: Pick<Report, "id">;
  onMenuPress?: () => void;
}

export function ReportDetailHeader({ onMenuPress }: ReportDetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [backPressed, setBackPressed] = useState(false);
  const [menuPressed, setMenuPressed] = useState(false);

  return (
    <View
      style={{ paddingTop: insets.top, backgroundColor: colors.background }}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          onPressIn={() => setBackPressed(true)}
          onPressOut={() => setBackPressed(false)}
          accessibilityRole="button"
          accessibilityLabel="Atrás"
          style={[
            styles.navBtn,
            { backgroundColor: backPressed ? colors.raised : "transparent" },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.spacer} />

        {onMenuPress ? (
          <Pressable
            onPress={onMenuPress}
            onPressIn={() => setMenuPressed(true)}
            onPressOut={() => setMenuPressed(false)}
            accessibilityRole="button"
            accessibilityLabel="Opciones del reporte"
            hitSlop={8}
            style={[
              styles.navBtn,
              { backgroundColor: menuPressed ? colors.raised : "transparent" },
            ]}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={colors.text}
            />
          </Pressable>
        ) : (
          <View style={styles.navBtn} />
        )}
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
    height: size.touch,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: {
    flex: 1,
  },
});
