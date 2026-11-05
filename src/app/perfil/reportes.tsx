import React from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ProfileReportItem } from "@/features/reports/components/ProfileReportItem";
import { size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useBackendReports } from "@/hooks/useBackendReports";
import { useMyReports } from "@/hooks/useMyReports";
import { useReportsStore } from "@/store/useReportsStore";

export default function MisReportesHistorialScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  useBackendReports();
  const { authenticated, myReports } = useMyReports();
  const error = useReportsStore((s) => s.error);
  const isLoading = useReportsStore((s) => s.isLoading);
  const refreshReports = useReportsStore((s) => s.refreshReports);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/perfil");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + space.sm, borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a Perfil"
          onPress={goBack}
          hitSlop={8}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          Mis reportes
        </Text>
      </View>
      <FlatList
        data={myReports}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + space.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        )}
        ListHeaderComponent={
          error ? (
            <ErrorBanner
              message={error}
              retrying={isLoading}
              onRetry={() => void refreshReports()}
              style={styles.banner}
            />
          ) : undefined
        }
        ListEmptyComponent={
          error ? undefined : isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              {authenticated
                ? "Aún no has publicado reportes."
                : "Inicia sesión para ver tus reportes."}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <ProfileReportItem
            report={item}
            onPress={(report) => router.push(`/reporte/${report.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    width: size.touch,
    height: size.touch,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, lineHeight: 30, fontWeight: "800", letterSpacing: -0.4 },
  list: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  separator: { height: StyleSheet.hairlineWidth },
  banner: { marginBottom: space.sm },
  empty: { fontSize: 14, lineHeight: 20, textAlign: "center", paddingTop: space.lg },
});
