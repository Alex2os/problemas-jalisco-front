import {useRouter} from 'expo-router';
import * as SecureStore from "expo-secure-store";
import {useState} from "react";
import {Pressable, Text, TextInput, View} from 'react-native';

import {UserLogIn} from "@/services/UserLogIn";
import {globalStyles} from "@/styles/globalStyles";
import {indexStyles} from "@/styles/indexStyles";

export default function Login() {

    const router = useRouter();

    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const ManageUserLogIn = async () => {
        try {
            const data = await UserLogIn(email, password);

            await SecureStore.setItemAsync("auth_token", data.token);

            console.log("Inicio de sesión completado.", data);
            router.replace("/(tabs)/account");
        } catch(error) {
            console.log(error);
        }
    };

    return (
        <View className="w-full h-full flex flex-col justify-center items-center p-[20px] gap-5">

            <Text style = {globalStyles.text_subtitle}>Ingresar</Text>

            <View className = "flex gap-3 flex-col items-center justify-start w-full">

                <TextInput style = {indexStyles.account_textinput}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput style = {indexStyles.account_textinput}
                    placeholder="Contraseña"
                    placeholderTextColor="#777"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Pressable onPress={ManageUserLogIn} className = "flex items-center justify-center w-full h-[50px] border-solid bg-[#407cff] rounded-[10px] border-solid border-[2px] border-[#315fc3]">
                    <Text style = {globalStyles.default_text_white}>Ingresar</Text>
                </Pressable>
                
                 <Pressable onPress = {() => router.push("/(tabs)/account")} style = {indexStyles.default_button}>
                    <Text style = {globalStyles.default_text}>Cancelar</Text>
                </Pressable>

                <Text style = {globalStyles.default_text}>Ingresa con tu correo electrónico y contraseña.</Text>

                <Text style = {globalStyles.default_text}>¿No tienes una cuenta?</Text>

                <Pressable onPress={() => router.push("/register")} style = {indexStyles.default_button}>
                    <Text style = {globalStyles.default_text}>Crea una cuenta</Text>
                </Pressable>

            </View>
        </View>
    );
}