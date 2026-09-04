// En React Native es recomendable usar StyleSheet.create para definir los estilos de la aplicación.
// Funciona de manera similar a crear componentes en React, optimizando el rendimiento al enviar los estilos de forma nativa.

import { StyleSheet } from 'react-native';

export const estilosInicio = StyleSheet.create({
  contenedorTitulo: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: "center",
    gap: 8,
    paddingTop: 20,
  },
  contenidoComponente: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 15,
  },
  contenedorPaso: {
    gap: 8,
    marginBottom: 8,
  },
  imagenEncabezado: {
    height: 200,
    width: 200,
    top: 40,
  },
  imagenEncabezadoPequena: {
    height: 100,
    width: 100,
    top: 9,
  },
  envoltorioImagenEncabezado: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  contenedorBoton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  botonInicio: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    padding: 10,
  },
  botonInicioPresionado: {
    backgroundColor: "#747474",
  },
  textoBotonInicio: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  botonConfig: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    padding: 5,
  },
  textoBotonConfig: {
    fontWeight: "bold",
    color: "white",
    fontSize: 17,
  },
  botonCerrarSesion: {
    display: "flex",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    fontWeight: "bold",
    color: "white",
    width: "100%",
    height: "100%",
    padding: 5,
  },
  flexPlegable: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  entradaTexto: {
    backgroundColor: "white",
    height: 50,
    width: "70%",
    color: "black",
  },
});