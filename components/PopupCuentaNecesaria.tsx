import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { useWindowDimensions, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { estilosInicio } from "@/styles/estilosInicio";

import BotonCancelar from "@/components/BotonCancelar";
import BotonCrearCuenta from "@/components/BotonCrearCuenta";
import BotonIniciarSesion from "@/components/BotonIniciarSesion";

// Popup modal que invita al usuario a iniciar sesión o crear una cuenta cuando intenta realizar una acción protegida.
export default function PopupCuentaNecesaria(propiedades: any) {

  const setPopupCuentaNecesariaActivo = propiedades.setPopupCuentaNecesariaActivo;

  const { height: alto } = useWindowDimensions();
  const { width: ancho } = useWindowDimensions();

  return (
    <ThemedView style={{
      position: "absolute",
      transform: [
        { translateY: - (alto / 2) / 1.9 },
        { translateX: - (ancho / 2) / 1.25 },
      ],
      padding: 20,
      gap: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#FFF",

      height: alto / 1.9,
      width: ancho / 1.25,
      left: "50%",
      top: "50%",
    }}>

      <View style={{
        alignItems: "center",
        padding: 10,
        gap: 10,

      }}>

        <ThemedText type="title" style={{ textAlign: "center" }}>¿Quieres realizar reportes?</ThemedText>
        <ThemedText type="subtitle" style={{ textAlign: "center", }}>Crea una cuenta o inicia sesión</ThemedText>

      </View>
      <BotonCrearCuenta />
      <BotonIniciarSesion />
      <BotonCancelar funcionCerrar={setPopupCuentaNecesariaActivo} />

      <View style={estilosInicio.envoltorioImagenEncabezado} >

        <LinearGradient
          colors={['#ff00cc', '#3333ff']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={{
            width: "114%",
            height: "100%",
            position: "absolute",
            top: 9,
          }}
        />

        <Image
          source={require('@/assets/images/jalisco-outline.png')}
          style={estilosInicio.imagenEncabezadoPequena}
        />
      </View>

    </ThemedView>
  );
}