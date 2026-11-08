import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { radius } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";

export interface UserAvatarProps {
  /** Tamaño del avatar en píxeles (ancho y alto). Por defecto 28 */
  size?: number;
  /** Tamaño del icono de silueta. Si no se especifica, se calcula proporcionalmente (~0.5x) */
  iconSize?: number;
  /** Estilo adicional para el contenedor del avatar */
  style?: StyleProp<ViewStyle>;
  /** Variante de color: 'accent' (usado en Perfil) o 'soft' (usado en comentarios) */
  tone?: "accent" | "soft";
  /** URL de imagen opcional para personalización futura */
  imageUrl?: string | null;
}

export function UserAvatar({
  size = 28,
  iconSize,
  style,
  tone = "accent",
  imageUrl,
}: UserAvatarProps) {
  const { colors } = useAppTheme();

  const isAccent = tone === "accent";
  const backgroundColor = isAccent ? colors.accentSoft : colors.raised;
  const iconColor = isAccent ? colors.accentText : colors.textSecondary;
  const computedIconSize = iconSize ?? Math.round(size * 0.52);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Avatar de usuario"
    >
      <Ionicons
        name="person-outline"
        size={computedIconSize}
        color={iconColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

