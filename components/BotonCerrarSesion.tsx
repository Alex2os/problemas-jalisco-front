import { Pressable, Text } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated } from 'react-native';

import { estilosInicio } from "@/styles/estilosInicio";

// Componente de botón reutilizable para cerrar sesión con estilo y animación.
export default function BotonCerrarSesion() {

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
        <React.Fragment>
            <Animated.View style={{
                opacity: desvanecerBotonCerrarSesion,
                width: "100%",
                height: 50,
            }}>
                <LinearGradient
                    colors={['#ff33a3', '#ff0000']}
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
                        onPressOut={() => botonCerrarSesionSoltado()}>
                        <Text style={estilosInicio.textoBotonConfig}>
                            Cerrar sesión
                        </Text>
                    </Pressable>
                </LinearGradient>

            </Animated.View>
        </React.Fragment>
    )
}