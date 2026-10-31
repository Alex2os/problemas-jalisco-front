import { useCallback, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { radius, size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCacheValue } from "@/hooks/useReportState";
import { createLocationSearch, type LocationSearchState } from "@/services/location-search";
import { SearchLocations, type LocationSearchResult } from "@/services/search-locations";
import { sessionVersion } from "@/services/session";

const EMPTY_SEARCH: LocationSearchState = { query: "", locations: [], status: "idle", error: "", validation: "" };

export function LocationSearch({ onSelect }: { onSelect: (location: LocationSearchResult) => void }) {
  const { colors } = useAppTheme();
  const identity = useCacheValue<number>("session:version") || 0;
  const controller = useRef<ReturnType<typeof createLocationSearch> | null>(null);
  const [state, setState] = useState(EMPTY_SEARCH);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    setState(EMPTY_SEARCH);
    const current = createLocationSearch({
      search: SearchLocations,
      onChange: (next) => { if (identity === sessionVersion()) setState(next); },
    });
    controller.current = current;
    return () => { current.dispose(); controller.current = null; };
  }, [identity]));

  const submit = () => { Keyboard.dismiss(); void controller.current?.submit(); };
  const loading = state.status === "loading";
  return (
    <View style={styles.section}>
      <View style={styles.searchRow}>
        <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: focused ? colors.primary : colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            accessibilityLabel="Buscar dirección o lugar"
            accessibilityHint="Escribe al menos 3 caracteres y pulsa Buscar."
            value={state.query}
            onChangeText={(query) => controller.current?.setQuery(query)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="Calle, colonia o lugar"
            placeholderTextColor={colors.muted}
            maxLength={200}
            returnKeyType="search"
            onSubmitEditing={submit}
            style={[styles.input, { color: colors.text }]}
          />
          {!!state.query && <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda"
            onPress={() => controller.current?.setQuery("")} style={styles.clear}>
            <Ionicons name="close" size={19} color={colors.textSecondary} />
          </Pressable>}
        </View>
        <Button title="Buscar" size="sm" onPress={submit} disabled={loading} loading={loading && !state.error} />
      </View>
      {!!state.validation && <Text accessibilityRole="alert" style={[styles.message, { color: colors.danger }]}>{state.validation}</Text>}
      {!!state.error && <ErrorBanner message={state.error} retrying={loading} onRetry={submit} />}
      {state.status === "ready" && !state.locations.length && (
        <Text accessibilityLiveRegion="polite" style={[styles.message, { color: colors.textSecondary }]}>
          No encontramos ubicaciones. Prueba con la calle y el municipio, o ajusta el mapa.
        </Text>
      )}
      {!!state.locations.length && (
        <View style={[styles.results, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {state.locations.map((location, index) => {
            const key = `${location.latitude}:${location.longitude}`;
            return <Pressable key={key} accessibilityRole="button"
              accessibilityLabel={`Seleccionar ${location.name}. ${location.formatted_address}`}
              onPressIn={() => setPressed(key)} onPressOut={() => setPressed(null)}
              onPress={() => {
                Keyboard.dismiss();
                controller.current?.setQuery("");
                onSelect(location);
              }}
              style={[styles.result, { backgroundColor: pressed === key ? colors.raised : colors.surface, borderTopWidth: index ? StyleSheet.hairlineWidth : 0, borderTopColor: colors.border }]}>
              <Ionicons name="location-outline" size={21} color={colors.accentText} />
              <View style={styles.resultText}>
                <Text style={[styles.resultName, { color: colors.text }]}>{location.name}</Text>
                {location.formatted_address !== location.name && <Text style={[styles.message, { color: colors.textSecondary }]}>{location.formatted_address}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>;
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  searchRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  inputWrap: { flex: 1, minWidth: 0, minHeight: size.control, flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: radius.control, paddingLeft: space.md },
  input: { flex: 1, minWidth: 0, minHeight: size.control, paddingHorizontal: space.sm, paddingVertical: space.sm, fontSize: 15, lineHeight: 22 },
  clear: { width: size.touch, minHeight: size.touch, alignItems: "center", justifyContent: "center", padding: space.sm },
  message: { fontSize: 13, lineHeight: 19 },
  results: { borderWidth: 1, borderRadius: radius.group, overflow: "hidden" },
  result: { minHeight: size.touch, flexDirection: "row", alignItems: "center", padding: space.md, gap: space.sm },
  resultText: { flex: 1, minWidth: 0, gap: space.xs },
  resultName: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
});
