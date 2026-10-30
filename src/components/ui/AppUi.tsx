import { border, radius, size, space, type } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import {
    useState,
    type ComponentProps,
    type ComponentPropsWithRef,
    type PropsWithChildren,
    type ReactNode,
} from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextProps,
    type ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Icon = ComponentProps<typeof Feather>["name"];
export function AppText({
  tone = "text",
  variant = "body",
  style,
  ...props
}: TextProps & {
  tone?: "text" | "muted" | "accent" | "danger" | "success";
  variant?: keyof typeof type;
}) {
  const { colors } = useAppTheme();
  return (
    <Text {...props} style={[type[variant], { color: colors[tone] }, style]} />
  );
}

export function Screen({
  children,
  bottom = false,
  header,
  scroll = true,
}: PropsWithChildren<{
  bottom?: boolean;
  header?: ReactNode;
  scroll?: boolean;
}>) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView
      edges={
        bottom ? ["top", "bottom", "left", "right"] : ["top", "left", "right"]
      }
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {header}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={ui.content}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function TopBar({
  title,
  back = false,
  onBack,
  backDisabled = false,
  trailing,
}: {
  title: string;
  back?: boolean;
  onBack?: () => void;
  backDisabled?: boolean;
  trailing?: ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[ui.topbar, { borderBottomColor: colors.border }]}>
      {back && (
        <IconButton
          icon="arrow-left"
          label="Volver"
          disabled={backDisabled}
          onPress={
            onBack ||
            (() => (router.canGoBack() ? router.back() : router.replace("/")))
          }
        />
      )}
      <AppText variant="heading" accessibilityRole="header" style={{ flex: 1 }}>
        {title}
      </AppText>
      {trailing}
    </View>
  );
}

export function Header({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <View style={{ gap: space.sm }}>
      {eyebrow && (
        <AppText variant="eyebrow" tone="muted">
          {eyebrow}
        </AppText>
      )}
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      {subtitle && <AppText tone="muted">{subtitle}</AppText>}
    </View>
  );
}

// Use for a bounded group, rather than as the default wrapper for content.
export function Card({ style, ...props }: ViewProps) {
  const { colors } = useAppTheme();
  return (
    <View
      {...props}
      style={[
        ui.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    />
  );
}

export function Divider() {
  const { colors } = useAppTheme();
  return (
    <View style={{ height: border.hairline, backgroundColor: colors.border }} />
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  disabled = false,
  loading = false,
}: {
  icon: Icon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        width: size.touch,
        minWidth: size.touch,
        minHeight: size.touch,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.control,
        backgroundColor: pressed ? colors.raised : "transparent",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Feather name={icon} size={size.icon} color={colors.text} />
      )}
    </Pressable>
  );
}

export function Button({
  label,
  icon,
  onPress,
  secondary = false,
  variant,
  loading = false,
  loadingLabel,
  disabled = false,
}: {
  label: string;
  icon?: Icon;
  onPress: () => void;
  secondary?: boolean;
  variant?: "primary" | "secondary" | "text";
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const mode = variant || (secondary ? "secondary" : "primary");
  const inactive = disabled || loading;
  const foreground =
    disabled && !loading
      ? colors.muted
      : mode === "primary"
        ? colors.onAccent
        : mode === "text"
          ? colors.accent
          : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        {
          backgroundColor:
            disabled && !loading
              ? colors.raised
              : mode === "primary"
                ? colors.accent
                : mode === "secondary"
                  ? colors.surface
                  : "transparent",
          borderColor: mode === "secondary" ? colors.border : "transparent",
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {(loading || icon) && (
        <View style={ui.buttonIcon} pointerEvents="none">
          {loading ? (
            <ActivityIndicator size="small" color={foreground} />
          ) : (
            <Feather name={icon} size={size.smallIcon} color={foreground} />
          )}
        </View>
      )}
      <Text
        style={[
          type.label,
          {
            color: foreground,
            flexShrink: 1,
            textAlign: "center",
            includeFontPadding: false,
          },
        ]}
      >
        {loading ? loadingLabel || label : label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  style,
  onFocus,
  onBlur,
  trailing,
  ...props
}: ComponentPropsWithRef<typeof TextInput> & {
  label?: string;
  trailing?: ReactNode;
}) {
  const { colors, dark } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: space.sm }}>
      {label && <AppText variant="label">{label}</AppText>}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: border.normal,
          borderRadius: radius.control,
          borderColor: focused ? colors.accent : colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <TextInput
          {...props}
          accessibilityLabel={
            props.accessibilityLabel || label || props.placeholder
          }
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
          keyboardAppearance={dark ? "dark" : "light"}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            ui.input,
            {
              color: colors.text,
              opacity: props.editable === false ? 0.65 : 1,
            },
            style,
          ]}
        />
        {trailing}
      </View>
    </View>
  );
}

export function Notice({
  message,
  success = false,
}: {
  message: string;
  success?: boolean;
}) {
  const { colors } = useAppTheme();
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      style={{
        padding: space.md,
        borderLeftWidth: 3,
        borderLeftColor: success ? colors.success : colors.danger,
        backgroundColor: success ? colors.successSoft : colors.dangerSoft,
      }}
    >
      <AppText variant="caption" tone={success ? "success" : "danger"}>
        {message}
      </AppText>
    </View>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
}: {
  icon?: Icon;
  title: string;
  description: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        paddingVertical: space.section,
        alignItems: "center",
        gap: space.md,
      }}
    >
      <Feather name={icon} size={24} color={colors.muted} />
      <AppText variant="heading" style={{ textAlign: "center" }}>
        {title}
      </AppText>
      <AppText tone="muted" style={{ textAlign: "center", maxWidth: 320 }}>
        {description}
      </AppText>
    </View>
  );
}

export const ui = StyleSheet.create({
  content: {
    padding: space.xl,
    paddingBottom: space.xxl,
    gap: space.xl,
    flexGrow: 1,
    width: "100%",
    maxWidth: size.content,
    alignSelf: "center",
  },
  stack: { gap: space.xl, width: "100%" },
  topbar: {
    minHeight: 56,
    paddingVertical: space.xs,
    paddingHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderBottomWidth: border.hairline,
  },
  card: {
    borderWidth: border.hairline,
    borderRadius: radius.group,
    padding: space.lg,
    gap: space.md,
  },
  buttonIcon: {
    width: size.icon,
    height: size.icon,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  button: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    minHeight: size.control,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: size.control,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontSize: 16,
  },
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
});
