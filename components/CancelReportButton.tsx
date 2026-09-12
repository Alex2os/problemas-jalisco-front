import {Pressable, Text} from 'react-native';

// Botón de cancelación específico para el popup de reporte de problemas.
export default function CancelReportButton(propiedades: any) {

    const setPopupReporteVisible = propiedades.setPopupReporteVisible;
    const setTextoEntradaReporte = propiedades.setTextoEntradaReporte;

    // Función que maneja la cancelación: oculta el popup y resetea el campo de texto a una cadena vacía.
    function alPresionarCancelarReporte() {
        setPopupReporteVisible(false);
        setTextoEntradaReporte("");
    }

    return (
        <Pressable className = "flex items-center justify-center bg-[#3f3f3f] w-full h-[50px]"
            onPress={() => alPresionarCancelarReporte()}>
            <Text className = "text-[17px] text-white">Cancelar</Text>
        </Pressable>
    )
}