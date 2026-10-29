import { size, space } from "@/src/constants/design";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useCacheValue, useLiveReport } from "@/src/hooks/use-report-state";
import { ApiError } from "@/src/services/api";
import { likePendingKey, SetReportLike } from "@/src/services/ReportInteractions";
import type { Report } from "@/src/services/types";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { AppText } from "./ui";

export function ReportInteractions({
  report,
  onCommentsPress,
}: {
  report: Report;
  onCommentsPress?: () => void;
}) {
  const live = useLiveReport(report) || report;
  const { colors } = useAppTheme();
  const pending = useCacheValue<boolean>(likePendingKey(report.id)) === true;
  const active = useRef(true);
  const tapped = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  async function toggleLike() {
    if (pending || tapped.current) return;
    tapped.current = true;
    try {
      await SetReportLike(report.id, !live.liked_by_me);
    } catch (error) {
      if (!active.current) return;
      if (error instanceof ApiError && error.status === 401) {
        Alert.alert(
          "Inicia sesión",
          "Necesitas iniciar sesión para dar me gusta.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Iniciar sesión",
              onPress: () => router.push("/auth/login"),
            },
          ],
        );
      } else
        Alert.alert(
          "No se pudo confirmar el me gusta",
          error instanceof Error
            ? `${error.message} Actualiza el reporte para comprobar su estado.`
            : "Intenta de nuevo o actualiza el reporte.",
        );
    } finally {
      tapped.current = false;
    }
  }
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: space.xl,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${live.liked_by_me ? "Quitar me gusta" : "Dar me gusta"}. ${live.like_count} me gusta`}
        accessibilityState={{
          selected: live.liked_by_me,
          disabled: pending,
          busy: pending,
        }}
        disabled={pending}
        onPress={toggleLike}
        style={({ pressed }) => ({
          minHeight: size.touch,
          minWidth: size.touch,
          flexDirection: "row",
          alignItems: "center",
          gap: space.sm,
          opacity: pressed ? 0.65 : 1,
        })}
      >
        {pending ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <Ionicons
            name={live.liked_by_me ? "heart" : "heart-outline"}
            size={size.icon}
            color={live.liked_by_me ? colors.accent : colors.muted}
          />
        )}
        <AppText variant="caption" tone={live.liked_by_me ? "accent" : "muted"}>
          {live.like_count} me gusta
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${live.comment_count} comentarios`}
        onPress={
          onCommentsPress ||
          (() =>
            router.push({
              pathname: "/reports/[report_id]",
              params: { report_id: String(report.id), comments: "1" },
            }))
        }
        style={({ pressed }) => ({
          minHeight: size.touch,
          minWidth: size.touch,
          flexDirection: "row",
          alignItems: "center",
          gap: space.sm,
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <Feather name="message-circle" size={size.icon} color={colors.muted} />
        <AppText variant="caption" tone="muted">
          {live.comment_count} comentarios
        </AppText>
      </Pressable>
    </View>
  );
}
