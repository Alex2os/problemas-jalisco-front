import { useAppTheme } from "@/src/hooks/use-app-theme";
import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { colors } = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 8,
          height:
            64 +
            Math.max(insets.bottom, 8) +
            Math.ceil(14 * (Math.max(1, fontScale) - 1)),
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        tabBarLabelPosition: "below-icon",
        tabBarHideOnKeyboard: true,
        animation: reducedMotion ? "none" : "fade",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mapa",
          tabBarIcon: ({ focused }) => (
            <Feather
              name="map"
              size={20}
              color={focused ? colors.accent : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reportes",
          tabBarIcon: ({ focused }) => (
            <Feather
              name="layers"
              size={20}
              color={focused ? colors.accent : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Cuenta",
          tabBarIcon: ({ focused }) => (
            <Feather
              name="user"
              size={20}
              color={focused ? colors.accent : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "Acerca de",
          tabBarIcon: ({ focused }) => (
            <Feather
              name="info"
              size={20}
              color={focused ? colors.accent : colors.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}
