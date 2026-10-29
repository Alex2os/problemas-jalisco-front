import {
    AppText,
    Button,
    Divider,
    Notice,
    Screen,
    TopBar,
} from "@/components/app/ui";
import { size, space } from "@/src/constants/design";
import { useAppTheme, type ThemePreference } from "@/src/hooks/use-app-theme";
import { setAuthSession } from "@/src/services/session";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useRef, useState } from "react";
import { Pressable, View } from "react-native";
const appearances: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Usar tema del dispositivo" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

export default function Account() {
  const router = useRouter();
  const appearancePending = useRef(false);
  const logoutPending = useRef(false);
  const { colors, preference, setPreference, ready } = useAppTheme();
  const [userConnected, setUserConnected] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      SecureStore.getItemAsync("auth_token")
        .then((token) => {
          if (active) setUserConnected(!!token);
        })
        .catch(() => {
          if (active) setError("No se pudo verificar tu sesión.");
        });
      return () => {
        active = false;
      };
    }, []),
  );
  async function logOut() {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setError("");
    setLoggingOut(true);
    try {
      await SecureStore.deleteItemAsync("auth_token");
      setAuthSession(false);
      setUserConnected(false);
    } catch {
      setError("No se pudo cerrar la sesión. Intenta de nuevo.");
    } finally {
      logoutPending.current = false;
      setLoggingOut(false);
    }
  }
  async function changeAppearance(value: ThemePreference) {
    if (!ready || appearancePending.current || value === preference) return;
    appearancePending.current = true;
    setSaving(true);
    setError("");
    try {
      await setPreference(value);
    } catch {
      setError("No se pudo guardar la apariencia. Intenta de nuevo.");
    } finally {
      appearancePending.current = false;
      setSaving(false);
    }
  }
  return (
    <Screen header={<TopBar title="Cuenta" />}>
      <View style={{ gap: space.lg, paddingVertical: space.sm }}>
        <AppText variant="heading">Sesión</AppText>
        <AppText tone="muted">
          {userConnected
            ? "Tu sesión está activa. Puedes publicar reportes y comentar."
            : "Consulta los reportes sin una cuenta. Inicia sesión para publicar y comentar."}
        </AppText>
        {userConnected ? (
          <Button
            secondary
            label="Cerrar sesión"
            loading={loggingOut}
            loadingLabel="Cerrando sesión…"
            onPress={logOut}
          />
        ) : (
          <>
            <Button
              label="Iniciar sesión"
              onPress={() => router.push("/auth/login")}
            />
            <Button
              variant="text"
              label="Crear una cuenta"
              onPress={() => router.push("/auth/register")}
            />
          </>
        )}
      </View>
      <Divider />
      <View style={{ gap: space.sm }}>
        <AppText variant="heading">Apariencia</AppText>
        <AppText tone="muted" variant="caption">
          Se guarda en este dispositivo.
        </AppText>
        <View accessibilityRole="radiogroup">
          {appearances.map((option) => {
            const selected = preference === option.value;
            return (
              <View key={option.value}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{
                    checked: selected,
                    disabled: !ready || saving,
                  }}
                  disabled={!ready || saving}
                  onPress={() => changeAppearance(option.value)}
                  style={({ pressed }) => ({
                    minHeight: size.control + space.sm,
                    paddingVertical: space.md,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: space.md,
                    backgroundColor: pressed ? colors.raised : "transparent",
                  })}
                >
                  <AppText style={{ flex: 1 }}>{option.label}</AppText>
                  <View style={{ width: size.icon, alignItems: "center" }}>
                    {selected && (
                      <Feather
                        name="check"
                        size={size.icon}
                        color={colors.accent}
                      />
                    )}
                  </View>
                </Pressable>
                <Divider />
              </View>
            );
          })}
        </View>
      </View>
      <Notice message={error} />
    </Screen>
  );
}
