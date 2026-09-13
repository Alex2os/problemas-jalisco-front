import {ThemedText} from '@/components/default_components/themed-text';
import {ThemedView} from '@/components/default_components/themed-view';
import {Image} from 'expo-image';
import {useWindowDimensions, View} from 'react-native';

// Popup modal que invita al usuario a iniciar sesión o crear una cuenta cuando intenta realizar una acción protegida.
export default function PopupCuentaNecesaria(propiedades: any) {

  const setPopupCuentaNecesariaActivo = propiedades.setPopupCuentaNecesariaActivo;

  const {height: alto} = useWindowDimensions();
  const {width: ancho} = useWindowDimensions();

  return (
    <ThemedView style={{
      position: "absolute",
      transform: [
        {translateY: - (alto / 2) / 1.9},
        {translateX: - (ancho / 2) / 1.25},
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

        <ThemedText type="title" style={{textAlign: "center"}}>¿Quieres realizar reportes?</ThemedText>
        <ThemedText type="subtitle" style={{textAlign: "center", }}>Crea una cuenta o inicia sesión</ThemedText>

      </View>

      <Image
        source={require('@/assets/images/jalisco-outline.png')}
      />


    </ThemedView>
  );
}