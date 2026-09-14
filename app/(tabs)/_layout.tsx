import Feather from '@expo/vector-icons/Feather';
import {Tabs} from 'expo-router';

import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function TabLayout() {
  return (

    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "#999",
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