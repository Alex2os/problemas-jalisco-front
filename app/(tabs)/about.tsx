import {Text, View} from 'react-native';

import {globalStyles} from "@/styles/globalStyles";

export default function About() {

  return (
    <View className="w-full h-full flex flex-col justify-center items-center p-[20px] gap-5">

      <Text style={globalStyles.text_subtitle}>Acerca de</Text>

      <Text style={globalStyles.default_text}>
        ProblemasJalisco es una aplicación enfocada al reporte de problemas por parte de la ciudadanía, donde se puede especificar qué tipo de problema
        se quiere reportar y una descripción corta del problema.{"\n"}{"\n"}
        Nuestro objetivo es ayudar a difundir información por todo el estado de incidentes que puedan
        ocurrir el día a día, para que las personas tomen las precauciones necesarias y lleven su día de una mejor manera.
      </Text>
    </View>
  );
}