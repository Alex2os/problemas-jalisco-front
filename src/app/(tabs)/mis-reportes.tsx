import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/ErrorBanner";
import { Button } from "@/components/Button";
import { useBackendReports } from "@/hooks/useBackendReports";
import { useRecommendedReports } from "@/hooks/useRecommendedReports";
import type { RecommendationLocation } from "@/services/get-recommended-reports";
import { EmptyState } from "@/components/EmptyState";
import { RecommendationLocationBanner } from "@/features/reports/components/RecommendationLocationBanner";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { ReportSearchFilterBar } from "@/features/reports/components/ReportSearchFilterBar";
import { space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useReportsStore } from "@/store/useReportsStore";
import { normalizeReportStatus } from "@/services/report-status";
import { matchesReportSearch } from "@/services/report-search";
import type { Report } from "@/services/types";

export default function MisReportesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useAppTheme();

  useBackendReports();
  const error = useReportsStore((s) => s.error);
  const reports = useReportsStore((s) => s.reports);
  const isLoading = useReportsStore((s) => s.isLoading);
  const refreshReports = useReportsStore((s) => s.refreshReports);

  const [activeFilter, setActiveFilter] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<RecommendationLocation>();
  const forYou = activeFilter === "para-ti";
  const recommended = useRecommendedReports(forYou, !!searchQuery.trim(), location);
  const listLoading = forYou ? recommended.loading : isLoading;
  const listError = forYou ? recommended.error : error;

  const filteredReports = (forYou ? recommended.reports : reports).filter((r) => {
    if (!matchesReportSearch(r, searchQuery)) return false;
    if (activeFilter === "todos" || forYou) return true;
    return normalizeReportStatus(r.status) === activeFilter;
  });

  const handlePress = (report: Report) => {
    router.push(`/reporte/${report.id}`);
  };

  const reasons = new Map(recommended.recommendations.map((item) => [item.report_id, item]));
  const reasonLabels = {
    nearby_and_related: "Cerca de ti y relacionado con tus reportes",
    nearby: "Cerca de ti",
    related_category: "Relacionado con tus reportes",
    recent: "Reporte reciente",
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: dark ? colors.background : colors.surface,
            borderBottomColor: colors.border,
            paddingTop: Math.max(insets.top, 16),
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {es.myReports.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {es.myReports.subtitle}
        </Text>

        <ReportSearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </View>

      {/* List of Reports */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={listLoading && !listError}
            onRefresh={() => { if (forYou) recommended.refresh(); else void refreshReports(); }}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item }) => {
          const recommendation = forYou ? reasons.get(item.id) : undefined;
          return <View style={{ gap: space.xs }}>
            {recommendation && <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {reasonLabels[recommendation.reason] || "Recomendado para ti"}
              {recommendation.distance_km !== null ? ` · ${recommendation.distance_km.toLocaleString("es-MX", { maximumFractionDigits: 1 })} km` : ""}
            </Text>}
            <ReportCard report={item} onPress={handlePress} />
          </View>;
        }}
        ListHeaderComponent={forYou || listError ? (
          <View style={{ gap: space.sm }}>
            {forYou && (
              <RecommendationLocationBanner
                location={location}
                onLocationChange={setLocation}
              />
            )}
            {!!listError && <>
              <ErrorBanner message={listError} retrying={listLoading || (forYou && recommended.loadingMore)}
                onRetry={() => { if (forYou) recommended.refresh(); else void refreshReports(); }} />
            </>}
          </View>
        ) : undefined}
        ListFooterComponent={forYou && !listError && recommended.nextOffset !== null ? (
          <Button title={searchQuery.trim() ? "Buscar en más reportes" : "Ver más reportes"}
            variant="outline" loading={recommended.loadingMore}
            disabled={recommended.loading} onPress={recommended.loadMore} />
        ) : undefined}
        ListEmptyComponent={
          listError ? <View /> : listLoading || (forYou && recommended.loadingMore) ? <ActivityIndicator color={colors.accent} /> : (
            <EmptyState
              icon="document-text-outline"
              title={searchQuery.trim() ? "Sin resultados" : forYou ? "Aún no hay recomendaciones" : activeFilter === "resuelto" ? es.myReports.emptyResolvedTitle : es.myReports.emptyTitle}
              description={searchQuery.trim() ? "Prueba con otro tipo, calle, colonia o municipio, o cambia el filtro de estado." : forYou ? "Cuando haya reportes disponibles, verás aquí los más relevantes para ti." : activeFilter === "resuelto" ? es.myReports.emptyResolvedSubtitle : es.myReports.emptySubtitle}
              actionTitle={searchQuery.trim() || forYou || activeFilter === "resuelto" ? undefined : es.myReports.emptyAction}
              onAction={() => router.push("/reportar/categoria")}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: space.sm,
  },
  list: {
    padding: space.lg,
    gap: space.md,
  },
});
