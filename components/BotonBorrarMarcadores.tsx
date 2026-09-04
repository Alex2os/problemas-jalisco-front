// Componente secundario/de prueba para eliminar los marcadores visibles en el mapa.

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from "react";
import { Pressable, useColorScheme } from 'react-native';

export default function EraseMarkersButton({ borrarTodosLosMarcadores }: { borrarTodosLosMarcadores: () => void }) {

    // Color de fondo adaptado al tema actual mediante useThemeColor.
    const colorFondo = useThemeColor({}, 'background');

    const esquemaColor = useColorScheme();

    return (
        <React.Fragment>

            <ThemedView style={{
                position: "absolute",
                top: 670,
                left: 10,
                backgroundColor: "transparent",
            }}>
                <Pressable
                    style={{
                        padding: 7,
                        borderRadius: 10,
                        borderWidth: 1,
                        backgroundColor: colorFondo,
                        borderColor: esquemaColor == 'dark' ? 'white' : 'black',
                    }}
                    onPress={() => borrarTodosLosMarcadores()}>
                    <ThemedText style={{
                        fontWeight: "bold",
                    }}>
                        Borrar marcadores actuales
                    </ThemedText>
                </Pressable>

            </ThemedView>
        </React.Fragment>
    )
}