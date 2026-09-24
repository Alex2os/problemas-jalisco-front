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
  report_table_collapsible: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    width: "100%",
    padding: 10,
  },
  report_collapsible_header: {
    textAlignVertical: "center",
    textAlign: "left",
    width: "45%",
    padding: 10,
    fontSize: 17,
  },
  report_table_collapsible_title: {
    width: "85%",
    textAlign: "left",
    textAlignVertical: "center",
    fontSize: 17,
  },
  report_table_collapsible_content: {
    textAlign: "left",
    textAlignVertical: "top",
    width: "50%",
    fontSize: 17,
  },
  report_table_collapsible_content_wrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  report_collapsible_icon: {
    position: "absolute",
    textAlign: "right",
    textAlignVertical: "center",
    height: "100%",
    right: 10,
  },
  report_table_header: {
    textAlign: "left",
    textAlignVertical: "center",
    width: "45%",
    height: 30,
  },
});