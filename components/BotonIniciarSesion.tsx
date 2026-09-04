import { useRouter } from "expo-router";
import { Pressable, Text } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated } from 'react-native';

import { estilosInicio } from "@/styles/estilosInicio";

// Botón animado que redirige a la pantalla de inicio de sesión (login).
export default function BotonIniciarSesion() {

    const enrutador = useRouter();

    const desvanecerBotonIniciarSesion = useRef(new Animated.Value(1)).current;

    const botonIniciarSesionPresionado = () => {
        Animated.timing(desvanecerBotonIniciarSesion, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    const botonIniciarSesionSoltado = () => {
        Animated.timing(desvanecerBotonIniciarSesion, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    return (
        <React.Fragment>
            <Animated.View style={{
                opacity: desvanecerBotonIniciarSesion,
                width: "100%",
                height: 50,
            }}>
                <LinearGradient
                    colors={['#105ac9', '#3d8bff']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={{
                        padding: 3,
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        borderRadius: 10,
                    }}>

                    <Pressable
                        style={estilosInicio.botonCerrarSesion}
                        onPressIn={() => botonIniciarSesionPresionado()}
                        onPressOut={() => botonIniciarSesionSoltado()}
                        onPress={() => enrutador.push("/login")}>
                        <Text style={estilosInicio.textoBotonConfig}>
                            Iniciar sesión
                        </Text>
                    </Pressable>
                </LinearGradient>

            </Animated.View>
        </React.Fragment>
    )
}