// En React Native es recomendable usar StyleSheet.create para definir los estilos de la aplicación.
// Funciona de manera similar a crear componentes en React, optimizando el rendimiento al enviar los estilos de forma nativa.

import {StyleSheet} from 'react-native';

export const indexStyles = StyleSheet.create({
  main_page_button: {
    display: "flex",
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 10,
    borderColor: "#d7d7d7",
    borderWidth: 2,

  },
  about_collapsible: {

  },
  account_textinput: {
    width: "100%",
    height: 50,

    backgroundColor: "white",

    borderRadius: 10,
    borderColor: "#d7d7d7",
    borderWidth: 2,
    padding: 10,
    fontSize: 17,
  },
  default_button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
    backgroundColor: "white",

    borderRadius: 10,
    borderColor: "#d7d7d7",
    borderWidth: 2,

  },
  default_button_blue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#407cff",

    borderRadius: 10,
    borderColor: "#315fc3",
    borderWidth: 2,
  },
  account_textinput_container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 1,
    width: "100%",

  },
  report_table_header: {
    textAlign: "center",
    width: "33%",
  },
  report_table_cell: {
    textAlign: "center",
    width: "33%",
  }
});