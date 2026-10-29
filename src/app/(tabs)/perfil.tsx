import React, { useState } from "react";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Button } from "@/src/components/Button";
import { ErrorBanner } from "@/src/components/ErrorBanner";
import { useBackendReports } from "@/src/hooks/use-backend-reports";
import { useAuthSession, useCacheValue } from "@/src/hooks/use-report-state";
import { setAuthSession, sessionUserKey, type SessionUser } from "@/src/services/session";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, shadows, space } from "@/src/constants/design";
import { es } from "@/src/constants/es";
import { useAppTheme } from "@/src/hooks/use-app-theme";
import { useReportsStore } from "@/src/store/useReportsStore";

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { colors, dark, setPreference } = useAppTheme();

  useBackendReports();
  const authenticated = useAuthSession();
  const user = useCacheValue<SessionUser>(sessionUserKey);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const error = useReportsStore((s) => s.error);
  const userReportIds = useReportsStore((s) => s.userReportIds);
  const reports = useReportsStore((s) => s.reports);

  const userReports = authenticated ? reports.filter((r) => userReportIds.includes(r.id)) : [];
  const resolvedCount = userReports.filter(
    (r) => r.status === "resuelto" || r.status === "resolved"
  ).length;
  const upvotedCount = reports.filter((r) => r.liked_by_me).length;

  const logOut = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setSessionError("");
    try {
      await SecureStore.deleteItemAsync("auth_token");
      setAuthSession(false);
    } catch { setSessionError("No se pudo cerrar la sesión. Intenta de nuevo."); }
    finally { setLoggingOut(false); }
  };

  const handleCall = (phone: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void Linking.openURL(`tel:${phone}`);
  };

  const toggleTheme = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void setPreference(dark ? "light" : "dark");
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {es.profile.title}
      </Text>

      {/* Citizen Card with Restored Stats (Uber/Airbnb style) */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadows.sm as any,
        ]}
      >
        <View style={styles.userRow}>
          <View
            style={[styles.avatar, { backgroundColor: colors.primarySoft }]}
          >
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {authenticated ? user?.username || "Mi cuenta" : "Invitado"}
            </Text>
            <Text style={[styles.userRegion, { color: colors.muted }]}>
              {authenticated ? user?.email || "Sesión iniciada" : "Inicia sesión para publicar y comentar"}
            </Text>
          </View>
        </View>

        {!!sessionError && <ErrorBanner message={sessionError} />}
        {authenticated ? <Button title="Cerrar sesión" variant="outline" loading={loggingOut} onPress={() => { void logOut(); }} /> : (
          <View style={{ gap: space.sm }}>
            <Button title="Iniciar sesión" onPress={() => router.push("/auth/login")} />
            <Button title="Crear cuenta" variant="outline" onPress={() => router.push("/auth/register")} />
          </View>
        )}
        {!!error && <ErrorBanner message={error} />}
        {/* 3 Useful Stats */}
        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.accent }]}>
              {userReports.length}
            </Text>
            <Text style={[styles.statLbl, { color: colors.muted }]}>
              {es.profile.statsReported}
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.agave }]}>
              {resolvedCount}
            </Text>
            <Text style={[styles.statLbl, { color: colors.muted }]}>
              {es.profile.statsResolved}
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.primary }]}>
              {upvotedCount}
            </Text>
            <Text style={[styles.statLbl, { color: colors.muted }]}>
              {es.profile.statsSupported}
            </Text>
          </View>
        </View>
      </View>

      {/* Emergency & Municipal Contact Phones */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadows.sm as any,
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {es.profile.emergencyTitle}
        </Text>

        {[
          { label: "Emergencias 911", phone: "911", desc: "Policía y Protección Civil" },
          { label: "SIAPA (Fugas de agua)", phone: "3336682482", desc: "Reportes de agua y alcantarillado" },
          { label: "Servicios Guadalajara 070", phone: "070", desc: "Alumbrado, aseo y pavimentos" },
          { label: "Atención Zapopan", phone: "3338182200", desc: "Ciudapp y obras públicas" },
        ].map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() => handleCall(item.phone)}
            accessibilityRole="button"
            accessibilityLabel={`Llamar a ${item.label}`}
            style={({ pressed }) => [
              styles.emergencyRow,
              {
                borderTopColor: colors.border,
                borderTopWidth: idx > 0 ? 1 : 0,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.emergencyLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              <Text style={[styles.emergencyDesc, { color: colors.muted }]}>
                {item.desc}
              </Text>
            </View>
            <Ionicons name="call" size={18} color={colors.accent} />
          </Pressable>
        ))}
      </View>

      {/* Theme Preference */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadows.sm as any,
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {es.profile.themeTitle}
        </Text>

        <Pressable
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel="Cambiar apariencia de la app"
          style={styles.themeToggleRow}
        >
          <View style={styles.themeLeft}>
            <Ionicons
              name={dark ? "moon" : "sunny"}
              size={20}
              color={colors.accent}
            />
            <Text style={[styles.themeLabel, { color: colors.text }]}>
              {dark ? es.profile.themeDark : es.profile.themeLight}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  card: {
    borderRadius: radius.group,
    borderWidth: 1,
    padding: space.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
  },
  userRegion: {
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: space.md,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 22,
    fontWeight: "900",
  },
  statLbl: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: space.sm,
  },
  emergencyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space.sm,
  },
  emergencyLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  emergencyDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  themeToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: space.xs,
  },
  themeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
