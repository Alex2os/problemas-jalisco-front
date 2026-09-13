import Feather from '@expo/vector-icons/Feather';
import {Tabs} from 'expo-router';

import {useColorScheme} from '@/hooks/use-color-scheme';

import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

// Configuración de la barra de navegación por pestañas (Tabs Layout).
export default function TabLayout() {
  const esquemaColor = useColorScheme();

  // Cada Tabs.Screen define una ruta de navegación inferior. El nombre (name) coincide con la vista dentro del directorio (tabs).
  return (

    // Se utiliza LinearGradient dentro de tabBarBackground para simular un borde superior personalizado en las pestañas.
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "black",
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({color}) => <FontAwesome6 name="house-chimney" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({color}) => <Feather name="map" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({color}) => <Feather name="settings" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Acerca de',
          tabBarIcon: ({color}) => <AntDesign name="question-circle" size={24} color={color} />,
        }}
      />
    </Tabs>

  );
}