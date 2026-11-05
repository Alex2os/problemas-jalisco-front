import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
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
import { RecommendationLocationNotice } from "@/features/reports/components/RecommendationLocationNotice";
import {
  getCachedRecommendationLocation,
  resolveRecommendationLocation,
} from "@/services/recommendation-location";
import { ReportFeedItem } from "@/features/reports/components/ReportFeedItem";
import { ReportSearchFilterBar } from "@/features/reports/components/ReportSearchFilterBar";
import { size, space } from "@/constants/design";
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
  const [location, setLocation] = useState<RecommendationLocation | undefined>(
    getCachedRecommendationLocation,
  );
  const [locationNotice, setLocationNotice] = useState<{
    message: string;
    canAskAgain: boolean;
  } | null>(null);
  const locating = useRef(false);
  const [pulling, setPulling] = useState(false);
  const forYou = activeFilter === "para-ti";
  const recommended = useRecommendedReports(forYou, !!searchQuery.trim(), location);
  const listLoading = forYou ? recommended.loading : isLoading;
  const listError = forYou ? recommended.error : error;

  const filteredReports = (forYou ? recommended.reports : reports).filter((r) => {
    if (!matchesReportSearch(r, searchQuery)) return false;
    if (activeFilter === "todos" || forYou) return true;
    return normalizeReportStatus(r.status) === activeFilter;
  });

  const requestLocation = async () => {
    if (locating.current) return;
    locating.current = true;
    try {
      const result = await resolveRecommendationLocation();
      if (result.status === "ok") {
        setLocation(result.location);
        setLocationNotice(null);
      } else if (result.status === "denied") {
        setLocationNotice({
          message: "Sin acceso a tu ubicación, mostramos recomendaciones generales.",
          canAskAgain: result.canAskAgain,
        });
      } else {
        setLocationNotice({
          message: "No pudimos obtener tu ubicación, mostramos recomendaciones generales.",
          canAskAgain: true,
        });
      }
    } finally {
      locating.current = false;
    }
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    if (filterId !== "para-ti") return;
    const cached = getCachedRecommendationLocation();
    if (cached) {
      setLocation(cached);
      setLocationNotice(null);
    } else {
      void requestLocation();
    }
  };

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
      {/* List of Reports */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + size.tabBarClearance + space.lg },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={pulling && listLoading && !listError}
            onRefresh={() => {
              setPulling(true);
              void (forYou ? recommended.refresh() : refreshReports()).finally(() =>
                setPulling(false),
              );
            }}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => {
          const recommendation = forYou ? reasons.get(item.id) : undefined;
          const recommendationNote = recommendation
            ? `${reasonLabels[recommendation.reason] || "Cerca de ti"}${recommendation.distance_km !== null ? ` · ${recommendation.distance_km.toLocaleString("es-MX", { maximumFractionDigits: 1 })} km` : ""}`
            : undefined;
          return (
            <ReportFeedItem
              report={item}
              onPress={handlePress}
              recommendationNote={recommendationNote}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
      <View
        style={[
          styles.header,
          styles.headerBleed,
          {
            backgroundColor: dark ? colors.background : colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top + space.lg,
          },
        ]}
      >
        <View style={styles.headerInner}>
          <Text
            accessibilityRole="header"
            style={[styles.pageTitle, { color: colors.text }]}
          >
            {es.myReports.title}
          </Text>

          <View>
            <ReportSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          </View>
        </View>
      </View>
            {(forYou || listError) ? (
              <View style={{ gap: space.sm, paddingTop: space.md }}>
                {forYou && !location && !!locationNotice && (
                  <RecommendationLocationNotice
                    message={locationNotice.message}
                    actionLabel={locationNotice.canAskAgain ? "Reintentar" : "Abrir ajustes"}
                    onAction={() => {
                      if (locationNotice.canAskAgain) void requestLocation();
                      else void Linking.openSettings();
                    }}
                  />
                )}
                {!!listError && (
                  <ErrorBanner message={listError} retrying={listLoading || (forYou && recommended.loadingMore)}
                    onRetry={() => { if (forYou) recommended.refresh(); else void refreshReports(); }} />
                )}
              </View>
            ) : null}
          </View>
        }
        ListFooterComponentStyle={styles.listFooter}
        ListFooterComponent={forYou && !listError && recommended.nextOffset !== null ? (
          <Button title={searchQuery.trim() ? "Buscar en más reportes" : "Ver más reportes"}
            variant="outline" loading={recommended.loadingMore}
            disabled={recommended.loading} onPress={recommended.loadMore} />
        ) : undefined}
        ListEmptyComponent={
          listError ? <View /> : listLoading || (forYou && recommended.loadingMore) ? <ActivityIndicator color={colors.primary} /> : (
            <EmptyState
              icon="document-text-outline"
              title={searchQuery.trim() ? "Sin resultados" : forYou ? "Aún no hay reportes cerca de ti" : activeFilter === "resuelto" ? es.myReports.emptyResolvedTitle : es.myReports.emptyTitle}
              description={searchQuery.trim() ? "Prueba con otro tipo, ubicación o palabras de la descripción, o cambia el filtro de estado." : forYou ? "Cuando haya reportes cercanos disponibles, aparecerán aquí." : activeFilter === "resuelto" ? es.myReports.emptyResolvedSubtitle : es.myReports.emptySubtitle}
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
  headerBleed: {
    marginHorizontal: -space.lg,
  },
  headerInner: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    gap: space.md,
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  list: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingHorizontal: space.lg,
    paddingTop: 0,
  },
  listHeader: {
    marginBottom: space.md,
  },
  listFooter: {
    marginTop: space.md,
  },
  separator: {
    height: space.md,
  },
});
