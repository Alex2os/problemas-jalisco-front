import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated, Pressable, useWindowDimensions } from 'react-native';

// Botón para refrescar y obtener la lista actualizada de reportes desde el servidor.
export default function UpdateReportsButton({ obtenerReportes }: { obtenerReportes: () => void }) {

    const desvanecerBotonActualizarReportes = useRef(new Animated.Value(1)).current;

    const { height: alto } = useWindowDimensions();
    const { width: ancho } = useWindowDimensions();

    // Animación al presionar el botón de actualizar reportes.
    const botonActualizarReportesPresionado = () => {
        Animated.timing(desvanecerBotonActualizarReportes, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    const botonActualizarReportesSoltado = () => {
        Animated.timing(desvanecerBotonActualizarReportes, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    return (
        <React.Fragment>
            <Animated.View style={{
                opacity: desvanecerBotonActualizarReportes,
                position: "absolute",
                height: 50,
                width: "50%",
                left: ancho / 4,
                top: alto / 14,
            }}>
                <LinearGradient
                    colors={['#3374ff', '#0026ff']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={{
                        height: "100%",
                        width: "100%",
                        borderRadius: 10,
                    }}>

                    <Pressable
                        style={{
                            height: "100%",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onPressIn={botonActualizarReportesPresionado}
                        onPressOut={botonActualizarReportesSoltado}
                        onPress={obtenerReportes}>
                        <ThemedText style={{
                            fontSize: 17,
                            fontWeight: "bold",
                        }}>
                            Actualizar
                        </ThemedText>
                    </Pressable>

                </LinearGradient>

            </Animated.View>
        </React.Fragment >
    )
}