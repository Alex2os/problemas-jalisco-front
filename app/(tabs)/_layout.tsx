import Feather from '@expo/vector-icons/Feather';
import {LinearGradient} from 'expo-linear-gradient';
import {Tabs} from 'expo-router';
import {View} from 'react-native';

import {HapticTab} from '@/components/haptic-tab';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {useThemeColor} from '@/hooks/use-theme-color';

import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

// Configuración de la barra de navegación por pestañas (Tabs Layout).
export default function TabLayout() {
  const esquemaColor = useColorScheme();

  const colorFondo = useThemeColor({}, 'background');

  // Cada Tabs.Screen define una ruta de navegación inferior. El nombre (name) coincide con la vista dentro del directorio (tabs).
  return (

    // Se utiliza LinearGradient dentro de tabBarBackground para simular un borde superior personalizado en las pestañas.
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: esquemaColor == 'dark' ? 'white' : 'black',
        tabBarInactiveTintColor: esquemaColor == 'dark' ? '#777' : '#999',
        headerShown: false,
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarBackground: () => (
          <LinearGradient
            colors={['#ff00cc', '#3333ff']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={{
              padding: 2,
              width: "100%",
              height: "auto",
              top: -4,
            }}
          >
            <View style={{
              backgroundColor: colorFondo,
              height: "150%",
              width: "150%",
              left: -10,
            }}></View>
          </LinearGradient>
        ),
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <FontAwesome6 name="house-chimney" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <Feather name="map" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Acerca de',
          tabBarIcon: ({ color }) => <AntDesign name="question-circle" size={24} color={color} />,
        }}
      />
    </Tabs>

  );
}