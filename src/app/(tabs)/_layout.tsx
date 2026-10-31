import React, { useEffect, useState, type ComponentProps } from "react";
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router, Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useReducedMotion } from "react-native-reanimated";
import { radius, size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthSession } from "@/hooks/useReportState";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

type TabConfig = {
  name: string;
  label: string;
  activeIcon: ComponentProps<typeof Ionicons>["name"];
  inactiveIcon: ComponentProps<typeof Ionicons>["name"];
};

const LEFT_TABS: TabConfig[] = [
  {
    name: "mapa",
    label: "Mapa",
    activeIcon: "map",
    inactiveIcon: "map-outline",
  },
  {
    name: "mis-reportes",
    label: "Reportes",
    activeIcon: "document-text",
    inactiveIcon: "document-text-outline",
  },
];

const RIGHT_TABS: TabConfig[] = [
  {
    name: "perfil",
    label: "Perfil",
    activeIcon: "person",
    inactiveIcon: "person-outline",
  },
  {
    name: "mas",
    label: "Más",
    activeIcon: "ellipsis-horizontal",
    inactiveIcon: "ellipsis-horizontal-outline",
  },
];

function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: TabBarProps) {
  const { colors } = useAppTheme();
  const authenticated = useAuthSession();
  const [plusPressed, setPlusPressed] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const focusedRoute = state.routes[state.index];
  const focusedOptions = focusedRoute ? descriptors[focusedRoute.key]?.options : undefined;
  const tabBarStyle = StyleSheet.flatten(focusedOptions?.tabBarStyle);
  if (tabBarStyle?.display === "none" || (focusedOptions?.tabBarHideOnKeyboard && keyboardVisible)) {
    return null;
  }

  const handleStartReport = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (authenticated) {
      router.push("/reportar/categoria");
    } else {
      router.push({
        pathname: "/auth/login",
        params: { returnTo: "/reportar/categoria" },
      });
    }
  };

  const renderTabItem = (tab: TabConfig) => {
    const route = state.routes.find((r) => r.name === tab.name);
    if (!route) return null;

    const isFocused = state.routes[state.index]?.key === route.key;
    const options = descriptors[route.key]?.options;
    const color = isFocused ? colors.secondary : colors.textSecondary;

    const onPress = () => {
      const event = emitter.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigateToTab(route.key);
      }
    };

    const onLongPress = () => {
      emitter.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    return (
      <Pressable
        key={tab.name}
        accessibilityRole="tab"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options?.tabBarAccessibilityLabel ?? tab.label}
        testID={options?.tabBarButtonTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabSlot}
      >
        <Ionicons
          name={isFocused ? tab.activeIcon : tab.inactiveIcon}
          size={22}
          color={color}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            {
              color,
              fontWeight: isFocused ? "700" : "500",
            },
          ]}
        >
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outerWrap,
        {
          bottom: Math.max(insets.bottom, space.sm) + space.md,
          paddingLeft: Math.max(insets.left, space.md),
          paddingRight: Math.max(insets.right, space.md),
        },
      ]}
    >
      <View
        style={[
          styles.capsule,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {LEFT_TABS.map(renderTabItem)}

        <View style={styles.centerSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reportar un problema"
            accessibilityHint={
              authenticated
                ? "Abre el formulario para crear un reporte"
                : "Inicia sesión para crear un reporte"
            }
            onPress={handleStartReport}
            onPressIn={() => setPlusPressed(true)}
            onPressOut={() => setPlusPressed(false)}
            style={[
              styles.plusButton,
              {
                backgroundColor: plusPressed ? colors.primaryDark : colors.primary,
                transform: [{ scale: plusPressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Ionicons
              name="add"
              size={28}
              color={colors.onPrimary}
              allowFontScaling={false}
              style={styles.plusIcon}
            />
          </Pressable>
        </View>

        {RIGHT_TABS.map(renderTabItem)}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const reducedMotion = useReducedMotion();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: reducedMotion ? "none" : "fade",
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="mapa" options={{ title: "Mapa" }} />
      <Tabs.Screen name="mis-reportes" options={{ title: "Reportes" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
      <Tabs.Screen name="mas" options={{ title: "Más" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 30,
  },
  capsule: {
    width: "100%",
    maxWidth: 480,
    minHeight: size.tabBarHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xs,
    paddingVertical: space.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tabSlot: {
    flex: 1,
    minWidth: size.minTouch,
    minHeight: size.minTouch,
    paddingHorizontal: space.xs,
    paddingVertical: space.xs,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: -0.1,
    textAlign: "center",
  },
  centerSlot: {
    flex: 1,
    minWidth: size.minTouch,
    minHeight: size.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    width: 28,
    height: 28,
    lineHeight: 28,
    textAlign: "center",
    includeFontPadding: false,
  },
});
