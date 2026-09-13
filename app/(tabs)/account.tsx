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
    <View style={globalStyles.page_body}>

      <View className="flex flex-col gap-5 w-full h-[50%] p-[20px] items-center justify-center rounded-[20px] gap-5 border-solid border-[2px] border-[#d7d7d7]">

        <Text style={globalStyles.text_subtitle}> Cuenta </Text>

        {!userConnected &&
          <>
            <Pressable style = {indexStyles.account_button} onPress={() => router.push("/login")}>
              <Text style = {globalStyles.default_text}>Iniciar sesión</Text>
            </Pressable>

            <Pressable style = {indexStyles.account_button} onPress={() => router.push("/register")}>
              <Text style = {globalStyles.default_text}>Crear cuenta</Text>
            </Pressable>
          </>
        }

        {userConnected &&
          <>
            <Pressable style = {indexStyles.account_button} onPress={() => LogOut()}>
              <Text style = {globalStyles.default_text}>Cerrar sesión</Text>
            </Pressable>
          </>
        }
      </View>
    </View>
  );
}