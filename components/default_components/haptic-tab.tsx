import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

// Componente para botones de pestaña con respuesta háptica en dispositivos móviles.
export function HapticTab(propiedades: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...propiedades}
      onPressIn={(evento) => {
        if (process.env.EXPO_OS === 'ios') {
          // Agrega una retroalimentación háptica suave al presionar la pestaña.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        propiedades.onPressIn?.(evento);
      }}
    />
  );
}
