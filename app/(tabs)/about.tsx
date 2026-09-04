import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from "@/hooks/use-theme-color";
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { estilosInicio } from "@/styles/estilosInicio";

import AntDesign from '@expo/vector-icons/AntDesign';

// Pantalla "Acerca de" con información general del proyecto y datos del desarrollador.
export default function TabTwoScreen() {

  const colorFondo = useThemeColor({}, 'background');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={

        <View style={estilosInicio.envoltorioImagenEncabezado} >

          <LinearGradient
            colors={['#88006d', '#1a1a88']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={{
              width: "100%",
              height: "200%",
              position: "absolute",
              top: 0,
            }}
          />

          <AntDesign name="question-circle" size={300} color="#bbbbbb"
            style={{
              position: "relative",
              color: colorFondo,
            }} />

        </View>
      }>

      <ThemedView style={estilosInicio.contenedorTitulo}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Acerca de
        </ThemedText>
      </ThemedView>

      {/* Uso de secciones colapsables para presentar la información de manera ordenada. */}
      <Collapsible title="La App">
        <ThemedText>
          Esta es una aplicación diseñada para ayudar a los habitantes de Jalisco. {"\n"}{"\n"}
          Desde cualquier lugar puedes acceder a esta App para reportar y ver acerca
          de los problemas que puedan haber en las inmediaciones de Jalisco.{"\n"}{"\n"}

          Desde accidentes, cortes de agua o de luz, baches, o incluso situaciones que se reporten.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Información de contacto">
        <ThemedText>
          Puedes contactarte con el desarrollador de la siguiente forma:{"\n"}{"\n"}
          <ThemedText>Email: imalex1ne@gmail.com{"\n"}</ThemedText>

          <ThemedText>Github: {' '}</ThemedText>
          <ExternalLink href="https://github.com/zJaviOne">
            <ThemedText type="link">zJaviOne</ThemedText>
          </ExternalLink>
        </ThemedText>
      </Collapsible>


    </ParallaxScrollView>
  );
}

const estilos = StyleSheet.create({
  imagenEncabezado: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  contenedorTitulo: {
    flexDirection: 'row',
    gap: 8,
  },
});