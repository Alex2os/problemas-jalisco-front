import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/ErrorBanner";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/ui/AppUi";
import { useBackendReports } from "@/hooks/useBackendReports";
import { useRecommendedReports } from "@/hooks/useRecommendedReports";
import type { RecommendationLocation } from "@/services/get-recommended-reports";
import { EmptyState } from "@/components/EmptyState";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { radius, size, space } from "@/constants/design";
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [clearPressed, setClearPressed] = useState(false);
  const [location, setLocation] = useState<RecommendationLocation>();
  const [locating, setLocating] = useState(false);
  const locationPending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const forYou = activeFilter === "para-ti";
  const recommended = useRecommendedReports(forYou, !!searchQuery.trim(), location);
  const listLoading = forYou ? recommended.loading : isLoading;
  const listError = forYou ? recommended.error : error;

  const filteredReports = (forYou ? recommended.reports : reports).filter((r) => {
    if (!matchesReportSearch(r, searchQuery)) return false;
    if (activeFilter === "todos" || forYou) return true;
    return normalizeReportStatus(r.status) === activeFilter;
  });

  const filterTabs = [
    { id: "todos", label: "Todos" },
    { id: "para-ti", label: "Para ti" },
    { id: "reportado", label: "Reportado" },
    { id: "resuelto", label: "Resuelto" },
  ];

  const handlePress = (report: Report) => {
    router.push(`/reporte/${report.id}`);
  };

  async function enableLocation() {
    if (locationPending.current) return;
    locationPending.current = true;
    setLocating(true);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        return;
      }
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("location-timeout")), 15000); }),
      ]);
      if (mounted.current) setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch {
      // Keep recommendations available without location; the action can be retried.
    } finally {
      clearTimeout(timeout);
      locationPending.current = false;
      if (mounted.current) setLocating(false);
    }
  }

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

        <View style={[styles.searchField, { backgroundColor: colors.surface, borderColor: searchFocused ? colors.accent : colors.border }]}>
          <TextInput
            accessibilityLabel="Buscar reportes por tipo o ubicación"
            placeholder="Buscar por tipo o ubicación"
            placeholderTextColor={colors.muted}
            selectionColor={colors.accent}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            clearButtonMode="never"
            returnKeyType="search"
          />
          {searchQuery ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              onPress={() => { setSearchQuery(""); setClearPressed(false); }}
              onPressIn={() => setClearPressed(true)}
              onPressOut={() => setClearPressed(false)}
              style={styles.searchClear}
            >
              <View style={[styles.searchClearCircle, { backgroundColor: clearPressed ? colors.primaryDark : colors.primary }]}>
                <Ionicons name="close" size={14} color={colors.onPrimary} style={styles.searchClearIcon} />
              </View>
            </Pressable>
          ) : <View style={styles.searchClear} />}
        </View>

        {/* Status Filter Tabs */}
        <View style={[styles.filterRow, { backgroundColor: colors.raised, borderColor: colors.border }]}>
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveFilter(tab.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${tab.label}`}
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? colors.primary : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isSelected ? colors.onPrimary : colors.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
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
            {forYou && <>
              <Text style={[styles.recommendationIntro, { color: colors.textSecondary }]}>
                {location
                  ? "Tu ubicación nos ayuda a recomendarte reportes cercanos y más relevantes para ti."
                  : "Activa tu ubicación para recibir mejores recomendaciones de reportes cerca de ti."}
              </Text>
              <View style={styles.locationActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={location ? "Actualizar mi ubicación" : "Activar ubicación para recibir recomendaciones cercanas"}
                  accessibilityState={{ disabled: locating, busy: locating }}
                  disabled={locating}
                  onPress={() => { void enableLocation(); }}
                  style={[styles.locationAction, { backgroundColor: colors.primary }]}
                >
                  {locating ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Ionicons name="location" size={20} color={colors.onPrimary} />}
                  <Text style={[styles.locationActionText, { color: colors.onPrimary }]}>
                    {locating ? "Buscando ubicación…" : location ? "Actualizar ubicación" : "Activar ubicación"}
                  </Text>
                </Pressable>
                {location && <IconButton icon="x" label="Dejar de usar mi ubicación" disabled={locating} onPress={() => setLocation(undefined)} />}
              </View>
            </>}
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
  searchField: { flexDirection: "row", alignItems: "center", minHeight: size.control, borderWidth: 1, borderRadius: radius.control, paddingLeft: space.md, paddingRight: space.sm, marginBottom: space.sm, gap: space.xs },
  searchInput: { flex: 1, minWidth: 0, fontSize: 16, paddingHorizontal: 0, paddingVertical: space.md, includeFontPadding: false, textAlignVertical: "center" },
  searchClear: { width: size.touch, height: size.touch, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: radius.sm },
  searchClearCircle: { width: 24, height: 24, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  searchClearIcon: { width: 14, height: 14, lineHeight: 14, includeFontPadding: false, textAlign: "center" },
  filterRow: {
    flexDirection: "row",
    gap: space.xs,
    padding: space.xs,
    borderWidth: 1,
    borderRadius: radius.control,
  },
  recommendationIntro: { fontSize: 13, lineHeight: 20, textAlign: "center" },
  locationActions: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: space.xs },
  locationAction: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.xs, minHeight: size.touch, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.control },
  locationActionText: { fontSize: 15, fontWeight: "700", flexShrink: 1 },
  filterTab: {
    flex: 1,
    minHeight: size.touch,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xs,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  list: {
    padding: space.lg,
    gap: space.md,
  },
});
