import { useRouter } from "expo-router";
import { Pressable, Text } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated } from 'react-native';

import { estilosInicio } from "@/styles/estilosInicio";

// Botón animado que redirige a la pantalla de registro de usuarios.
export default function BotonCrearCuenta() {

    const enrutador = useRouter();

    const desvanecerBotonCrearCuenta = useRef(new Animated.Value(1)).current;

    const botonCrearCuentaPresionado = () => {
        Animated.timing(desvanecerBotonCrearCuenta, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    const botonCrearCuentaSoltado = () => {
        Animated.timing(desvanecerBotonCrearCuenta, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    return (
        <React.Fragment>
            <Animated.View style={{
                opacity: desvanecerBotonCrearCuenta,
                width: "100%",
                height: 50,
            }}>
                <LinearGradient
                    colors={['#3ca023', '#2cff48']}
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
                        onPressIn={() => botonCrearCuentaPresionado()}
                        onPressOut={() => botonCrearCuentaSoltado()}
                        onPress={() => enrutador.push("/register")}>
                        <Text style={estilosInicio.textoBotonConfig}>
                            Crear cuenta
                        </Text>
                    </Pressable>
                </LinearGradient>

            </Animated.View>
        </React.Fragment>
    )
}