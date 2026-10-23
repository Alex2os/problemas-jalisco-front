import type {PropsWithChildren, ReactElement} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
} from 'react-native-reanimated';

import {ThemedView} from '@/components/default_components/themed-view';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {useThemeColor} from '@/hooks/use-theme-color';

const ALTO_ENCABEZADO = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

// Componente ParallaxScrollView para vistas con desplazamiento y encabezado con efecto parallax.
export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorFondo = useThemeColor({}, 'background');
  const esquemaColor = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const referenciaDesplazamiento = useAnimatedRef<Animated.ScrollView>();
  const desfasamientoDesplazamiento = useScrollOffset(referenciaDesplazamiento);
  const estiloAnimadoEncabezado = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            desfasamientoDesplazamiento.value,
            [-ALTO_ENCABEZADO, 0, ALTO_ENCABEZADO],
            [-ALTO_ENCABEZADO / 2, 0, ALTO_ENCABEZADO * 0.75]
          ),
        },
        {
          scale: interpolate(desfasamientoDesplazamiento.value, [-ALTO_ENCABEZADO, 0, ALTO_ENCABEZADO], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={referenciaDesplazamiento}
      style={{ backgroundColor: colorFondo, flex: 1 }}
      scrollEventThrottle={16}>
      <Animated.View
        style={[
          estilos.header,
          { backgroundColor: headerBackgroundColor[esquemaColor] },
          estiloAnimadoEncabezado,
        ]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={estilos.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: ALTO_ENCABEZADO,
    overflow: 'hidden',
  },

  // Se modificó el padding aquí (de 32 a 0) para permitir una mejor gestión y flexibilidad en la interfaz de usuario.
  content: {
    flex: 1,
    padding: 0,
    gap: 16,
    overflow: 'hidden',
  },
});
