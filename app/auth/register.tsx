import {useRouter} from 'expo-router';
import {useState} from "react";
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";

import {RegisterUser} from "@/services/RegisterUser";
import {globalStyles} from "@/styles/globalStyles";
import {indexStyles} from "@/styles/indexStyles";

export default function Register() {

    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const ManageRegisterUser = async () => {
        try {
            const response = await RegisterUser(username, email, password);

            console.log("Registro completado.", response);

            router.replace("/(tabs)/account");
        } catch(error) {
            console.log(error);
        }
    };

    return (
        <SafeAreaView className="flex-1" edges={["top"]}>
            <ScrollView className="w-full h-full">
                <View className="flex flex-col w-full h-full justify-center items-center p-[20px] gap-5">

                    <Text style={globalStyles.text_subtitle}>Registrarse</Text>

                    <View className="flex w-full gap-3 flex-col items-center justify-center">

                        <View style={indexStyles.account_textinput_container}>
                            <Text style={globalStyles.default_text}>Nombre de usuario</Text>
                            <TextInput style={indexStyles.account_textinput}
                                placeholder="Nombre de usuario"
                                autoCapitalize="none"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View style={indexStyles.account_textinput_container}>
                            <Text style={globalStyles.default_text}>Correo electrónico</Text>
                            <TextInput style={indexStyles.account_textinput}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={indexStyles.account_textinput_container}>
                            <Text style={globalStyles.default_text}>Contraseña</Text>
                            <TextInput style={indexStyles.account_textinput}
                                placeholder="Contraseña"
                                placeholderTextColor="#777"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <Pressable onPress={ManageRegisterUser} style={indexStyles.default_button_blue}>
                            <Text style={globalStyles.default_text_white}>Crear cuenta</Text>
                        </Pressable>

                        <Pressable onPress={() => router.push("/(tabs)/account")} style={indexStyles.default_button}>
                            <Text style={globalStyles.default_text}>Cancelar</Text>
                        </Pressable>

                        <Text className="text-center" style={globalStyles.default_text}>Los datos que introduzcas serán confidenciales y no serán compartidos a terceros.</Text>

                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}