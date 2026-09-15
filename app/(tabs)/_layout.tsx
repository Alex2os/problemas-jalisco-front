import {Tabs} from 'expo-router';

import AntDesign from '@expo/vector-icons/AntDesign';

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
          title: 'Mapa',
          tabBarIcon: ({color}) => <AntDesign name="environment" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({color}) => <AntDesign name="notification" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({color}) => <AntDesign name="setting" size={24} color={color} />,
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