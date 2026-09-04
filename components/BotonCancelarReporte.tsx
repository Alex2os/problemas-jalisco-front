import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated, Pressable, Text } from 'react-native';

import { estilosMapa } from "@/styles/estilosMapa";

// Botón de cancelación específico para el popup de reporte de problemas.
export default function BotonCancelarReporte(propiedades: any) {

    const setPopupReporteVisible = propiedades.setPopupReporteVisible;
    const setTextoEntradaReporte = propiedades.setTextoEntradaReporte;

    const desvanecerBotonCancelarReporte = useRef(new Animated.Value(1)).current;

    // Animación de presionar el botón de cancelar reporte.
    const botonCancelarReportePresionado = () => {
        Animated.timing(desvanecerBotonCancelarReporte, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    const botonCancelarReporteSoltado = () => {
        Animated.timing(desvanecerBotonCancelarReporte, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    // Función que maneja la cancelación: oculta el popup y resetea el campo de texto a una cadena vacía.
    function alPresionarCancelarReporte() {
        setPopupReporteVisible(false);
        setTextoEntradaReporte("");
    }

    return (
        <React.Fragment>
            <Animated.View style={{
                opacity: desvanecerBotonCancelarReporte,
                width: "100%",
                height: 50,
            }}>
                <LinearGradient
                    colors={['#ff33a3', '#ff0000']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={estilosMapa.gradienteBotonPopupReporte}>

                    <Pressable
                        onPressIn={botonCancelarReportePresionado}
                        onPressOut={botonCancelarReporteSoltado}
                        style={estilosMapa.botonPopupReporte}
                        onPress={() => alPresionarCancelarReporte()}>
                        <Text style={estilosMapa.textoPopupReporte}>
                            Cancelar
                        </Text>
                    </Pressable>

                </LinearGradient>

            </Animated.View>
        </React.Fragment>
    )
}