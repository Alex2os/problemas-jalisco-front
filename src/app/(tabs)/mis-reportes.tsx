import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/ErrorBanner";
import { useBackendReports } from "@/hooks/useBackendReports";
import { EmptyState } from "@/components/EmptyState";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { radius, space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useReportsStore } from "@/store/useReportsStore";
import { normalizeReportStatus } from "@/services/report-status";
import type { Report } from "@/services/types";

export default function MisReportesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  useBackendReports();
  const error = useReportsStore((s) => s.error);
  const reports = useReportsStore((s) => s.reports);
  const isLoading = useReportsStore((s) => s.isLoading);
  const refreshReports = useReportsStore((s) => s.refreshReports);

  const [activeFilter, setActiveFilter] = useState<string>("todos");

  const filteredReports = reports.filter((r) => {
    if (activeFilter === "todos") return true;
    return normalizeReportStatus(r.status) === activeFilter;
  });

  const filterTabs = [
    { id: "todos", label: "Todos" },
    { id: "reportado", label: "Reportado" },
    { id: "resuelto", label: "Resuelto" },
  ];

  const handlePress = (report: Report) => {
    router.push(`/reporte/${report.id}`);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
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

        {/* Status Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
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
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.raised,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isSelected ? colors.onPrimary : colors.text },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* List of Reports */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => { void refreshReports(); }}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item }) => (
          <ReportCard report={item} onPress={handlePress} />
        )}
        ListHeaderComponent={error ? <ErrorBanner message={error} /> : undefined}
        ListEmptyComponent={
          isLoading ? <ActivityIndicator color={colors.accent} /> : error ? <View /> : (
            <EmptyState
              icon="document-text-outline"
              title={activeFilter === "resuelto" ? es.myReports.emptyResolvedTitle : es.myReports.emptyTitle}
              description={activeFilter === "resuelto" ? es.myReports.emptyResolvedSubtitle : es.myReports.emptySubtitle}
              actionTitle={activeFilter === "resuelto" ? undefined : es.myReports.emptyAction}
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
  filterRow: {
    gap: space.xs,
  },
  filterTab: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    padding: space.lg,
    gap: space.md,
  },
});
