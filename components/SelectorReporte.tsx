import {ThemedView} from '@/components/themed-view';
import {Picker} from '@react-native-picker/picker';
import React from "react";
import {useColorScheme} from 'react-native';

// Componente selector de categoría de reporte.
// Recibe como props el valor seleccionado (problemaSeleccionado) y la función modificadora de estado (setProblemaSeleccionado).
export default function SelectorReporte(propiedades: any) {

    const problemaSeleccionado = propiedades.problemaSeleccionado;
    const setProblemaSeleccionado = propiedades.setProblemaSeleccionado;

    const esquemaColor = useColorScheme();

    return (
        <React.Fragment>

            {/* El componente Picker vincula su selectedValue a la variable de estado recibida por props. */}
            {/* Al cambiar la opción elegida (onValueChange), invoca a setProblemaSeleccionado para actualizar la categoría del reporte. */}
            {/* Picker.Item define cada una de las opciones con su etiqueta visible (label) y su valor correspondiente (value). */}
            <ThemedView style={{
                width: "100%",
                height: "auto",
                padding: 2,
                backgroundColor: esquemaColor == 'dark' ? 'white' : 'black',
            }}>
                <Picker
                    selectedValue={problemaSeleccionado}
                    onValueChange={(valorItem: any) => setProblemaSeleccionado(valorItem)}>
                    <Picker.Item label="Accidente" value="accidente" />
                    <Picker.Item label="Basura" value="basura" />
                    <Picker.Item label="Bloqueo en una calle/avenida" value="bloqueo" />
                    <Picker.Item label="Corte de electricidad/agua" value="corte-de-servicios" />
                    <Picker.Item label="Problema en transporte público" value="transporte-publico" />
                    <Picker.Item label="Robo/asalto" value="robo-asalto" />
                    <Picker.Item label="Otro" value="otros" />
                </Picker>
            </ThemedView>

        </React.Fragment>
    )
}