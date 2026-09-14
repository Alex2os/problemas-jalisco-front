import {useFocusEffect, useRouter} from 'expo-router';
import * as SecureStore from "expo-secure-store";
import {useCallback, useState} from "react";
import {Pressable, Text, View} from 'react-native';

import {globalStyles} from "@/styles/globalStyles";
import {indexStyles} from "@/styles/indexStyles";

export default function Account() {

  const router = useRouter();

  // const variable to determine if user is connected or not. used to show login/register/logout buttons
  const [userConnected, setUserConnected] = useState(false);

  async function LogOut() {

    await SecureStore.deleteItemAsync("auth_token");

    setUserConnected(false);

    router.replace("/(tabs)/account");

  }

  // useFocusEffect se ejecuta cada vez que la pantalla obtiene el foco, verificando el estado del token de autenticación.
  useFocusEffect(
    useCallback(() => {
      async function verificarSesion() {
        const token = await SecureStore.getItemAsync("auth_token");
        setUserConnected(!!token);
      }

      verificarSesion();
    }, [])
  );


  return (
    <View className="w-full h-full flex flex-col justify-center items-center p-[20px] gap-5">

      <Text style={globalStyles.text_subtitle}>Cuenta</Text>

      {!userConnected &&
        <View className = "flex w-full gap-2">
          <Pressable style={indexStyles.default_button} onPress={() => router.push("/login")}>
            <Text style={globalStyles.default_text}>Iniciar sesión</Text>
          </Pressable>

          <Pressable style={indexStyles.default_button} onPress={() => router.push("/register")}>
            <Text style={globalStyles.default_text}>Crear cuenta</Text>
          </Pressable>
        </View>
      }

      {userConnected &&
        <View>
          <Pressable style={indexStyles.default_button} onPress={() => LogOut()}>
            <Text style={globalStyles.default_text}>Cerrar sesión</Text>
          </Pressable>
        </View>
      }
    </View>
  );
}