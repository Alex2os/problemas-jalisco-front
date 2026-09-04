import { StyleSheet } from 'react-native';

// No realizar llamadas a hooks desde este archivo. Los hooks solo deben ejecutarse dentro de componentes React y no en archivos externos.

export const estilosMapa = StyleSheet.create({
    envoltorioMarcador: {
        padding: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vistaAnimadaPopupReporte: {
        position: "absolute",
        left: "50%",
        top: "50%",
    },
    flexReportarProblema: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 30,
        height: "100%",
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
    },
    selectorReporte: {
        backgroundColor: "white",
    },
    botonPopupReporte: {
        padding: 5,
        borderRadius: 10,
        backgroundColor: "transparent",
        alignSelf: "center",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    textoPopupReporte: {
        fontWeight: "bold",
        color: "white",
        fontSize: 17,
    },
    gradienteBotonPopupReporte: {
        padding: 2,
        justifyContent: "center",
        borderRadius: 10,
    },
    entradaTextoReporte: {
        backgroundColor: "white",
        width: "100%",
        height: 55,
        color: "black",
        padding: 10,
        fontSize: 15,
    }
});