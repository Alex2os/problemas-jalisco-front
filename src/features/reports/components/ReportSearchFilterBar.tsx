import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { radius, size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";

const FILTER_TABS = [
  { id: "todos", label: "Todos" },
  { id: "para-ti", label: "Cerca de ti" },
  { id: "resuelto", label: "Resueltos" },
] as const;

export interface ReportSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

export function ReportSearchFilterBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: ReportSearchFilterBarProps) {
  const { colors } = useAppTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [clearPressed, setClearPressed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSummary =
    activeFilter === "para-ti"
      ? "Cerca de ti"
      : activeFilter === "resuelto"
        ? "Resueltos"
        : "Todos los reportes";

  return (
    <>
      <View style={styles.searchRow}>
      <View
        style={[
          styles.searchField,
          {
            backgroundColor: colors.surface,
            borderColor: searchFocused ? colors.primary : colors.border,
          },
        ]}
      >
        <TextInput
          accessibilityLabel="Buscar reportes por tipo, ubicación o descripción"
          placeholder="Tipo, ubicación o descripción"
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={onSearchChange}
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
            onPress={() => {
              onSearchChange("");
              setClearPressed(false);
            }}
            onPressIn={() => setClearPressed(true)}
            onPressOut={() => setClearPressed(false)}
            style={styles.searchClear}
          >
            <View
              style={[
                styles.searchClearCircle,
                {
                  backgroundColor: clearPressed
                    ? colors.primaryDark
                    : colors.primary,
                },
              ]}
            >
              <Ionicons
                name="close"
                size={14}
                color={colors.onPrimary}
                style={styles.searchClearIcon}
              />
            </View>
          </Pressable>
        ) : (
          <View style={styles.searchClear} />
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filtros"
        accessibilityState={{ expanded: menuOpen }}
        onPress={() => setMenuOpen((open) => !open)}
        style={[styles.filterButton, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="options-outline" size={22} color={colors.onPrimary} />
      </Pressable>
      </View>

      {menuOpen && (
      <View
        style={[
          styles.filterRow,
          { backgroundColor: colors.raised, borderColor: colors.border },
        ]}
      >
        {FILTER_TABS.map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFilterChange(tab.id);
                setMenuOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar por ${tab.label}`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isSelected ? colors.surface : "transparent",
                  borderColor: isSelected ? colors.textSecondary : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: isSelected ? colors.text : colors.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      )}

      <Text style={[styles.activeFilterText, { color: colors.textSecondary }]}>
        Mostrando: {activeSummary}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.sm,
  },
  filterButton: {
    width: size.control,
    height: size.control,
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
  },
  activeFilterText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: size.control,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingLeft: space.md,
    paddingRight: space.sm,
    gap: space.xs,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    fontSize: 15,
    lineHeight: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  searchClear: {
    width: size.touch,
    height: size.touch,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  searchClearCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  searchClearIcon: {
    width: 14,
    height: 14,
    lineHeight: 14,
    includeFontPadding: false,
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    gap: space.xs,
    padding: space.xs,
    borderWidth: 1,
    borderRadius: radius.control,
    marginBottom: space.sm,
  },
  filterTab: {
    flex: 1,
    minHeight: 40,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xs,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});

