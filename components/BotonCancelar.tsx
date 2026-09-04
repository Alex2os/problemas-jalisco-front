// Botón de cancelación de propósito general. Recibe una función (funcionCerrar) que se ejecuta al presionar,
// la cual puede ser un modificador de estado para cerrar un modal, ocultar una pantalla, etc.
import { Pressable, Text } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated } from 'react-native';

import { estilosInicio } from "@/styles/estilosInicio";

export default function BotonCancelar(propiedades: any) {

    const funcionCerrar = propiedades.funcionCerrar;

    const desvanecerBotonCancelar = useRef(new Animated.Value(1)).current;

    const botonCancelarPresionado = () => {
        Animated.timing(desvanecerBotonCancelar, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    const botonCancelarSoltado = () => {
        Animated.timing(desvanecerBotonCancelar, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    return (
        <React.Fragment>
            <Animated.View style={{
                opacity: desvanecerBotonCancelar,
                width: "100%",
                height: 50,
            }}>
                <LinearGradient
                    colors={['#a02323', '#ff2c2c']}
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
                        onPressIn={() => botonCancelarPresionado()}
                        onPressOut={() => botonCancelarSoltado()}
                        onPress={() => funcionCerrar(false)}>
                        <Text style={estilosInicio.textoBotonConfig}>
                            Cancelar
                        </Text>
                    </Pressable>
                </LinearGradient>

            </Animated.View>
        </React.Fragment>
    )
}