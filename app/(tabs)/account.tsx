import { View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import { Pressable, Text } from 'react-native';

import React, { useRef } from "react";
import { Animated } from 'react-native';

import { estilosInicio } from "@/styles/estilosInicio";

// Componentes
import BotonCrearCuenta from "@/components/BotonCrearCuenta";
import BotonIniciarSesion from "@/components/BotonIniciarSesion";

// Pantalla de gestión de cuenta del usuario.
export default function Account() {

  const colorFondo = useThemeColor({}, 'background');

  const enrutador = useRouter();

  // Estado para determinar si se muestran los botones de iniciar sesión/registro o el botón de cerrar sesión.
  const [usuarioEstaConectado, setUsuarioEstaConectado] = useState(false);

  async function manejarCerrarSesion() {

    await SecureStore.deleteItemAsync("auth_token");

    setUsuarioEstaConectado(false);

    enrutador.replace("/(tabs)/account");

  }

  // useFocusEffect se ejecuta cada vez que la pantalla obtiene el foco, verificando el estado del token de autenticación.
  useFocusEffect(
    useCallback(() => {
      async function verificarSesion() {
        const token = await SecureStore.getItemAsync("auth_token");
        setUsuarioEstaConectado(!!token);
      }

      verificarSesion();
    }, [])
  );

  const desvanecerBotonCerrarSesion = useRef(new Animated.Value(1)).current;

  const botonCerrarSesionPresionado = () => {
    Animated.timing(desvanecerBotonCerrarSesion, {
      toValue: 0.8,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  const botonCerrarSesionSoltado = () => {
    Animated.timing(desvanecerBotonCerrarSesion, {
      toValue: 1,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };


  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: '#D0D0D0',
        dark: '#353636'
      }}
      headerImage={

        <View style={estilosInicio.envoltorioImagenEncabezado} >

          <LinearGradient
            colors={['#88006d', '#1a1a88']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={{
              width: "100%",
              height: "200%",
              position: "absolute",
              top: 0,
            }}
          />

          <Feather name="settings" size={300} color="#bbbbbb"
            style={{
              position: "relative",
              color: colorFondo,
            }} />

        </View>
      }>

      <ThemedView style={estilosInicio.contenedorTitulo}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Cuenta
        </ThemedText>
      </ThemedView>

      {/* Si el usuario no ha iniciado sesión, se muestran las opciones de ingreso y registro. */}
      {!usuarioEstaConectado && <>
        <BotonIniciarSesion />
        <BotonCrearCuenta />
      </>
      }

      {/* Si el usuario ha iniciado sesión, se despliega la opción para cerrar sesión. */}
      {usuarioEstaConectado &&
        <>
          <Animated.View style={{
            opacity: desvanecerBotonCerrarSesion,
            width: "100%",
            height: 50,
          }}>
            <LinearGradient
              colors={['#c91010', '#ff3d3d']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={{
                padding: 3,
                width: "100%",
                height: "100%",
                justifyContent: "center",
              }}>

              <Pressable
                style={estilosInicio.botonCerrarSesion}
                onPressIn={() => botonCerrarSesionPresionado()}
                onPressOut={() => botonCerrarSesionSoltado()}
                onPress={() => manejarCerrarSesion()}>
                <Text style={estilosInicio.textoBotonConfig}>
                  Cerrar sesión
                </Text>
              </Pressable>
            </LinearGradient>

          </Animated.View>
        </>
      }

    </ParallaxScrollView>
  );
}