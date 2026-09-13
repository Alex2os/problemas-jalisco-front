import {Collapsible} from '@/components/ui/collapsible';
import {Fonts} from '@/constants/theme';
import {Text, View} from 'react-native';

// about page
export default function About() {

  return (
    <View>
      <View>
        <Text
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Acerca de
        </Text>
      </View>

      <Collapsible title="La App">
        <Text>
          Esta es una aplicación diseñada para ayudar a los habitantes de Jalisco. {"\n"}{"\n"}
          Desde cualquier lugar puedes acceder a esta App para reportar y ver acerca
          de los problemas que puedan haber en las inmediaciones de Jalisco.{"\n"}{"\n"}

          Desde accidentes, cortes de agua o de luz, baches, o incluso situaciones que se reporten.
        </Text>
      </Collapsible>

      <Collapsible title="Información de contacto">
      </Collapsible>
    </View>
  );
}