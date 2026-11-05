import React, { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, size, space } from "@/constants/design";
import { es } from "@/constants/es";
import { useAppTheme, type ThemePreference } from "@/hooks/useAppTheme";

const contacts = [
  { label: "Emergencias 911", phone: "911", description: "Policía y Protección Civil" },
  { label: "SIAPA (Fugas de agua)", phone: "3336682482", description: "Reportes de agua y alcantarillado" },
  { label: "Servicios Guadalajara 070", phone: "070", description: "Alumbrado, aseo y pavimentos" },
  { label: "Atención Zapopan", phone: "3338182200", description: "Ciudapp y obras públicas" },
];

const THEME_OPTIONS: {
  id: ThemePreference;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { id: "system", label: es.more.themeSystem, icon: "phone-portrait-outline" },
  { id: "light", label: es.more.themeLight, icon: "sunny-outline" },
  { id: "dark", label: es.more.themeDark, icon: "moon-outline" },
];

export default function MasScreen() {
  const insets = useSafeAreaInsets();
  const { colors, preference, setPreference } = useAppTheme();
  const appVersion = Constants.default?.expoConfig?.version || "1.0.0";
  const cardColors = { backgroundColor: colors.surface, borderColor: colors.border };

  function handleCall(phone: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void Linking.openURL(`tel:${phone}`);
  }

  function handleThemeChange(next: ThemePreference) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void setPreference(next);
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + space.lg,
          paddingBottom: insets.bottom + size.tabBarClearance + space.lg,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text accessibilityRole="header" style={[styles.pageTitle, { color: colors.text }]}>
        {es.more.title}
      </Text>

      {/* Apariencia y selección de tema */}
      <View style={[styles.card, cardColors]}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>
          {es.more.themeTitle}
        </Text>
        <View
          accessibilityRole="radiogroup"
          style={[styles.themeGroup, { backgroundColor: colors.raised, borderColor: colors.border }]}
        >
          {THEME_OPTIONS.map((option) => {
            const selected = preference === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: selected }}
                onPress={() => handleThemeChange(option.id)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: selected ? colors.primary : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={selected ? colors.onPrimary : colors.textSecondary}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Teléfonos de atención de Jalisco */}
      <View style={[styles.card, cardColors]}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>
          {es.more.emergencyTitle}
        </Text>
        <View>
          {contacts.map((contact, index) => (
            <React.Fragment key={contact.phone}>
              {index > 0 && <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />}
              <ContactRow
                icon="call-outline"
                title={contact.label}
                subtitle={contact.description}
                accessibilityLabel={`Llamar a ${contact.label}`}
                onPress={() => handleCall(contact.phone)}
              />
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Información acerca de la aplicación y versión */}
      <View style={[styles.card, cardColors]}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>
          {es.more.aboutTitle}
        </Text>
        <View style={styles.aboutRow}>
          <View style={[styles.settingIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="information-circle-outline" size={22} color={colors.accentText} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.interactiveLabel, { color: colors.text }]}>
              Problemas Jalisco
            </Text>
            <Text style={[styles.caption, { color: colors.textSecondary }]}>
              {es.more.aboutDescription}
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.versionRow}>
          <Text style={[styles.caption, { color: colors.muted }]}>
            {es.more.versionLabel}
          </Text>
          <Text style={[styles.versionValue, { color: colors.text }]}>
            {appVersion}
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}

function ContactRow({
  title,
  subtitle,
  icon,
  accessibilityLabel,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.settingContainer,
        {
          backgroundColor: pressed ? colors.raised : "transparent",
        },
      ]}
    >
      <View style={styles.settingRow}>
        <View style={[styles.settingIcon, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name={icon} size={21} color={colors.accentText} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.interactiveLabel, { color: colors.text }]}>{title}</Text>
          {!!subtitle && <Text style={[styles.caption, { color: colors.muted }]}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: space.lg,
    gap: space.lg,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
  },
  interactiveLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  caption: {
    fontSize: 13,
    lineHeight: 19,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  themeGroup: {
    flexDirection: "row",
    gap: space.xs,
    padding: space.xs,
    borderWidth: 1,
    borderRadius: radius.control,
  },
  themeOption: {
    flex: 1,
    minHeight: 44,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: space.sm,
    borderRadius: radius.sm,
  },
  settingContainer: {
    borderRadius: radius.md,
    overflow: "hidden",
  },
  settingRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: {
    flex: 1,
    minWidth: 0,
    gap: space.xs,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 40 + space.md * 2,
    marginRight: space.md,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  versionValue: {
    fontSize: 14,
    fontWeight: "700",
  },
});
