import React, { useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ProfileReportItem } from "@/features/reports/components/ProfileReportItem";
import { radius, size, space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMyReports } from "@/hooks/useMyReports";
import { useBackendReports } from "@/hooks/useBackendReports";
import { useAuthSession, useCacheValue } from "@/hooks/useReportState";
import { setAuthSession, sessionUserKey, type SessionUser } from "@/services/session";
import { useReportsStore } from "@/store/useReportsStore";

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  useBackendReports();
  const authenticated = useAuthSession();
  const user = useCacheValue<SessionUser>(sessionUserKey);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const logoutPending = useRef(false);
  const error = useReportsStore((state) => state.error);
  const reports = useReportsStore((state) => state.reports);
  const { myReports: userReports } = useMyReports();
  const recentReports = userReports.slice(0, 3);
  const isLoading = useReportsStore((state) => state.isLoading);
  const resolvedCount = userReports.filter((report) => report.status === "resuelto" || report.status === "resolved").length;
  const upvotedCount = reports.filter((report) => report.liked_by_me).length;

  async function logOut() {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setLoggingOut(true);
    setSessionError("");
    try {
      await SecureStore.deleteItemAsync("auth_token");
      setAuthSession(false);
    } catch { setSessionError("No se pudo cerrar la sesión. Intenta de nuevo."); }
    finally { logoutPending.current = false; setLoggingOut(false); }
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + space.lg,
          paddingBottom: insets.bottom + size.tabBarClearance + space.lg,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <Text accessibilityRole="header" style={[styles.pageTitle, { color: colors.text }]}>{es.profile.title}</Text>

      <View style={styles.userRow}>
        <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="person-outline" size={26} color={colors.accentText} />
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{authenticated ? user?.username || "Mi cuenta" : "Invitado"}</Text>
          <Text style={[styles.caption, { color: colors.muted }]}>
            {authenticated ? user?.email || "Sesión iniciada" : "Inicia sesión para publicar y comentar"}
          </Text>
        </View>
      </View>

      <View style={styles.activity}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{es.profile.statsTitle}</Text>
        {!!error && <ErrorBanner message={error} />}
        <View style={styles.statsRow}>
          {[{ value: userReports.length, label: es.profile.statsReported },
            { value: resolvedCount, label: es.profile.statsResolved },
            { value: upvotedCount, label: es.profile.statsSupported }].map((stat) => (
            <View key={stat.label} style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessible accessibilityLabel={`${stat.value} ${stat.label}`}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {authenticated && (
        <View style={styles.reportsSection}>
          <View style={styles.sectionHeader}>
            <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>
              Mis reportes
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Ver todos mis reportes"
              onPress={() => router.push("/perfil/reportes")} style={styles.seeAll}>
              <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
          {userReports.length ? (
            <View>
              {recentReports.map((report, index) => (
                <React.Fragment key={report.id}>
                  {index > 0 && <View style={[styles.reportSeparator, { backgroundColor: colors.border }]} />}
                  <ProfileReportItem
                    report={report}
                    onPress={(item) => router.push(`/reporte/${item.id}`)}
                  />
                </React.Fragment>
              ))}
            </View>
          ) : (
            <Text style={[styles.caption, { color: colors.muted }]}>
              {isLoading ? "Cargando reportes…" : "Aún no has publicado reportes."}
            </Text>
          )}
        </View>
      )}

      <View style={styles.accountActions}>
        {authenticated ? (
          <LogoutAction loading={loggingOut} onPress={() => { void logOut(); }} />
        ) : <>
          <AccountAction title="Iniciar sesión" icon="log-in-outline" tone="primary" onPress={() => router.push("/auth/login")} />
          <AccountAction title="Crear cuenta" icon="person-add-outline" tone="secondary" onPress={() => router.push("/auth/register")} />
        </>}
        {!!sessionError && <ErrorBanner message={sessionError} />}
      </View>
    </ScrollView>
  );
}

function LogoutAction({ loading, onPress }: { loading: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={loading ? "Cerrando sesión" : "Cerrar sesión"}
    accessibilityState={{ disabled: loading, busy: loading }} disabled={loading}
    onPress={() => { if (!loading) { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); } }}
    onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
    style={[styles.logoutButton, { backgroundColor: pressed ? colors.dangerSoft : colors.surface, borderColor: colors.dangerSoft, opacity: loading ? 0.7 : 1 }]}>
    <View pointerEvents="none" style={styles.logoutContent}>
      {loading ? <ActivityIndicator size="small" color={colors.danger} /> : <Ionicons name="log-out-outline" size={20} color={colors.danger} />}
      <Text style={[styles.logoutLabel, { color: colors.danger }]}>{loading ? "Cerrando sesión…" : "Cerrar sesión"}</Text>
    </View>
  </Pressable>;
}

function AccountAction({ title, icon, tone, loading = false, onPress }: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tone: "primary" | "secondary";
  loading?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const primary = tone === "primary";
  const background = primary ? pressed ? colors.primaryDark : colors.primary
    : pressed ? colors.raised : colors.surface;
  const foreground = primary ? colors.onPrimary : colors.textSecondary;
  return <Pressable accessibilityRole="button" accessibilityLabel={loading ? "Cerrando sesión" : title}
    accessibilityState={{ disabled: loading, busy: loading }} disabled={loading}
    onPress={() => { if (!loading) { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); } }}
    onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
    style={[styles.accountButton, {
      backgroundColor: background,
      borderColor: primary ? colors.primary : colors.border,
      opacity: loading ? 0.7 : 1,
      transform: [{ scale: pressed && !loading ? 0.99 : 1 }],
    }]}>
    <View pointerEvents="none" style={styles.accountButtonIcon}>
      {loading ? <ActivityIndicator color={foreground} /> : <Ionicons name={icon} size={21} color={foreground} />}
    </View>
    <Text style={[styles.interactiveLabel, styles.accountButtonLabel, { color: foreground }]}>{loading ? "Cerrando sesión…" : title}</Text>
    {primary && <View pointerEvents="none" style={styles.accountButtonArrow}>
      <Ionicons name="arrow-forward" size={18} color={foreground} />
    </View>}
  </Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: "100%", maxWidth: 640, alignSelf: "center", paddingHorizontal: space.lg, gap: space.xl },
  pageTitle: { fontSize: 26, lineHeight: 34, fontWeight: "800", letterSpacing: -0.6 },
  sectionTitle: { fontSize: 17, lineHeight: 24, fontWeight: "700" },
  interactiveLabel: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 19 },
  userRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  userInfo: { flex: 1, minWidth: 0, gap: space.xs },
  userName: { fontSize: 18, lineHeight: 25, fontWeight: "700" },
  activity: { gap: space.md },
  statsRow: { flexDirection: "row", gap: space.sm, alignItems: "stretch" },
  stat: { flex: 1, minWidth: 0, minHeight: 72, paddingHorizontal: space.xs, paddingVertical: space.sm, borderRadius: radius.md, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: space.xs },
  statValue: { fontSize: 22, lineHeight: 28, fontWeight: "700", alignSelf: "center", textAlign: "center" },
  statLabel: { fontSize: 12, lineHeight: 18, fontWeight: "500", textAlign: "center", alignSelf: "center" },
  accountActions: { gap: space.md },
  accountButton: { width: "100%", minHeight: size.buttonLg, alignSelf: "center", borderWidth: 1, borderRadius: radius.group, paddingHorizontal: 48, paddingVertical: space.lg, alignItems: "center", justifyContent: "center" },
  accountButtonLabel: { alignSelf: "center", textAlign: "center", includeFontPadding: false },
  accountButtonIcon: { position: "absolute", left: space.lg, top: 0, bottom: 0, width: 24, alignItems: "center", justifyContent: "center" },
  accountButtonArrow: { position: "absolute", right: space.lg, top: 0, bottom: 0, width: 24, alignItems: "center", justifyContent: "center" },
  reportSeparator: { height: StyleSheet.hairlineWidth },
  reportsSection: { gap: space.xs },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2, minHeight: size.touch, paddingLeft: space.sm },
  seeAllText: { fontSize: 13, fontWeight: "600" },
  logoutButton: { width: "100%", minHeight: size.touch, alignItems: "center", justifyContent: "center", paddingHorizontal: space.lg, borderWidth: 1, borderRadius: radius.control },
  logoutContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.sm },
  logoutLabel: { fontSize: 15, lineHeight: 20, fontWeight: "700", includeFontPadding: false },
});
