import { ReportRow } from "@/features/reports/components/ReportRow";
import {
    AppText,
    Button,
    Divider,
    EmptyState,
    Field,
    IconButton,
    Notice,
    Screen,
    TopBar,
    ui,
} from "@/components/ui/AppUi";
import { space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { GetAllReports } from "@/services/get-all-reports";
import { GetFilteredReports } from "@/services/get-filtered-reports";
import type { Report } from "@/services/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    RefreshControl,
    View,
} from "react-native";

export default function Reports() {
  const { colors } = useAppTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const loadReports = useCallback(async (query: string, refresh = false) => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const data = query
        ? await GetFilteredReports(query, refresh)
        : await GetAllReports(refresh);
      if (id === requestId.current) setReports(data);
    } catch (error) {
      if (id === requestId.current)
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los reportes.",
        );
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadReports(activeQuery);
      return () => {
        requestId.current++;
      };
    }, [activeQuery, loadReports]),
  );

  function search() {
    Keyboard.dismiss();
    const query = searchQuery.trim();
    if (query === activeQuery) void loadReports(query);
    else setActiveQuery(query);
  }
  return (
    <Screen
      scroll={false}
      header={
        <TopBar
          title="Reportes"
          trailing={
            <IconButton
              icon="refresh-cw"
              label="Actualizar reportes"
              loading={loading}
              onPress={() => loadReports(activeQuery, true)}
            />
          }
        />
      }
    >
      <FlatList
        data={reports}
        keyExtractor={(report) => String(report.id)}
        renderItem={({ item }) => <ReportRow report={item} />}
        ItemSeparatorComponent={Divider}
        contentContainerStyle={[ui.content, { gap: 0 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={loading && reports.length > 0}
            onRefresh={() => loadReports(activeQuery, true)}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: space.lg, paddingBottom: space.sm }}>
            <Field
              placeholder="Buscar por ubicación"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={search}
              returnKeyType="search"
              autoCorrect={false}
              trailing={
                <IconButton
                  icon="search"
                  label="Buscar reportes"
                  onPress={search}
                />
              }
            />
            <Notice message={error} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.sm,
              }}
            >
              <AppText variant="caption" tone="muted" style={{ flex: 1 }}>
                {activeQuery
                  ? `Resultados para “${activeQuery}”`
                  : "Reportes de la comunidad"}
                {!loading && ` · ${reports.length}`}
              </AppText>
              {!!activeQuery && (
                <IconButton
                  icon="x"
                  label="Quitar filtro de ubicación"
                  onPress={() => {
                    setSearchQuery("");
                    setActiveQuery("");
                  }}
                />
              )}
            </View>
            <Divider />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: space.section, gap: space.md }}>
              <ActivityIndicator color={colors.accent} />
              <AppText tone="muted" style={{ textAlign: "center" }}>
                Cargando reportes…
              </AppText>
            </View>
          ) : error ? (
            <Button
              secondary
              label="Reintentar"
              onPress={() => loadReports(activeQuery, true)}
            />
          ) : (
            <EmptyState
              title={activeQuery ? "Sin resultados" : "Aún no hay reportes"}
              description={
                activeQuery
                  ? "Prueba con otra calle, colonia o municipio."
                  : "Los reportes que comparta la comunidad aparecerán aquí. Puedes añadir uno desde el mapa."
              }
            />
          )
        }
      />
    </Screen>
  );
}
