// En React Native es recomendable usar StyleSheet.create para definir los estilos de la aplicación.
// Funciona de manera similar a crear componentes en React, optimizando el rendimiento al enviar los estilos de forma nativa.

import {StyleSheet} from 'react-native';

export const indexStyles = StyleSheet.create({
  account_button: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    borderColor: "#d7d7d7",
    borderWidth: 2,

    width: "100%",
    height: 50,
  },
});