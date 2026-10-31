import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { radius, size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";

const FILTER_TABS = [
  { id: "todos", label: "Todos" },
  { id: "para-ti", label: "Para ti" },
  { id: "reportado", label: "Reportado" },
  { id: "resuelto", label: "Resuelto" },
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

  return (
    <>
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
          accessibilityLabel="Buscar reportes por tipo o ubicación"
          placeholder="Buscar por tipo o ubicación"
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

      {/* Status Filter Tabs */}
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
                  {
                    color: isSelected ? colors.onPrimary : colors.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: size.control,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingLeft: space.md,
    paddingRight: space.sm,
    marginBottom: space.sm,
    gap: space.xs,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    paddingHorizontal: 0,
    paddingVertical: space.md,
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
  },
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
});

