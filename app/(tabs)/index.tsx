import { Image } from 'expo-image';

import ParallaxScrollView from '@/components/parallax-scroll-view';

import { ThemedText } from '@/components/themed-text';

import { ThemedView } from '@/components/themed-view';

import { useThemeColor } from '@/hooks/use-theme-color';

import { LinearGradient } from 'expo-linear-gradient';

import { useRouter } from 'expo-router';

import React from "react";

import { Pressable, useWindowDimensions, View } from 'react-native';

import { estilosInicio } from "@/styles/estilosInicio";

// Pantalla principal de bienvenida (Inicio).
export default function HomeScreen() {

  const enrutador = useRouter();

  const { height: alto } = useWindowDimensions();

  const colorFondo = useThemeColor({}, 'background');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colorFondo, dark: colorFondo }}
      headerImage={
        <View style={estilosInicio.envoltorioImagenEncabezado}>
          <LinearGradient
            colors={['#ff00cc', '#3333ff']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={{
              width: "100%",
              height: "200%",
              position: "absolute",
              top: 0,
            }}
          />

          <Image
            source={require('@/assets/images/jalisco-outline.png')}
            style={estilosInicio.imagenEncabezado}
          />
        </View>
      }
    >

      <ThemedView style={estilosInicio.contenedorTitulo}>
        <ThemedText type="title">
          ProblemasJalisco
        </ThemedText>

        <ThemedText type="subtitle">
          Aplicación para reporte de problemas
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={[
          estilosInicio.contenedorBoton,
          {
            height: alto / 3
          }
        ]}
      >
        <LinearGradient
          colors={['#ff00cc', '#3333ff']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={{
            padding: 3,
            borderRadius: 10,
          }}
        >
          <Pressable
            onPress={() => enrutador.push('/map')}
            style={estilosInicio.botonInicio}
          >
            <ThemedText style={estilosInicio.textoBotonInicio}>
              Abrir mapa de Jalisco
            </ThemedText>
          </Pressable>
        </LinearGradient>
      </ThemedView>

    </ParallaxScrollView>
  );
}
