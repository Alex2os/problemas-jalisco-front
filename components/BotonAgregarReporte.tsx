import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated, Pressable, Text } from 'react-native';

import { estilosMapa } from "@/styles/estilosMapa";

// Botón animado para confirmar la creación de un nuevo reporte en el mapa.
export default function BotonAgregarReporte({ agregarMarcadorAlMapa }: { agregarMarcadorAlMapa: () => void }) {

    const desvanecerBotonAgregarReporte = useRef(new Animated.Value(1)).current;

    // Animación que reduce la opacidad al presionar el botón de agregar reporte.
    const botonAgregarReportePresionado = () => {
        Animated.timing(desvanecerBotonAgregarReporte, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    const botonAgregarReporteSoltado = () => {
        Animated.timing(desvanecerBotonAgregarReporte, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    return (
        <React.Fragment>
            <Animated.View style={{
                opacity: desvanecerBotonAgregarReporte,
                width: "100%",
                height: 50,
            }}>
                <LinearGradient
                    colors={['#3374ff', '#ae00ff']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={estilosMapa.gradienteBotonPopupReporte}>

                    <Pressable
                        onPressIn={botonAgregarReportePresionado}
                        onPressOut={botonAgregarReporteSoltado}
                        style={estilosMapa.botonPopupReporte}
                        onPress={() => agregarMarcadorAlMapa()}>
                        <Text style={estilosMapa.textoPopupReporte}>
                            Añadir
                        </Text>
                    </Pressable>

                </LinearGradient>

            </Animated.View>
        </React.Fragment >
    )
}