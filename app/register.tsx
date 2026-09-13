import {ThemedText} from '@/components/default_components/themed-text';
import {ThemedView} from '@/components/default_components/themed-view';
import {useRouter} from 'expo-router';
import * as SecureStore from "expo-secure-store";
import {Pressable, Text} from 'react-native';

import {Image} from 'expo-image';

import {TextInput, View} from "react-native";

import {useThemeColor} from '@/hooks/use-theme-color';
import {useRef, useState} from "react";
import {Animated} from 'react-native';

import {LinearGradient} from 'expo-linear-gradient';

import {estilosInicio} from "@/styles/indexStyles";

import ParallaxScrollView from '@/components/default_components/parallax-scroll-view';


import {iniciarSesionUsuario} from "@/services/iniciarSesionUsuario";
import {registrarUsuario} from "@/services/registrarUsuario";

// Pantalla para el registro de nuevos usuarios en la plataforma.
export default function Register() {

    const enrutador = useRouter();

    const colorFondo = useThemeColor({}, 'background');

    const [nombreUsuario, setNombreUsuario] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");

    const desvanecerBotonRegistro = useRef(new Animated.Value(1)).current;

    const botonRegistroPresionado = () => {
        Animated.timing(desvanecerBotonRegistro, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    const botonRegistroSoltado = () => {
        Animated.timing(desvanecerBotonRegistro, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    // Función que registra al usuario e inmediatamente inicia sesión para almacenar el token de autenticación.
    const manejarRegistro = async () => {
        try {
            const datosRegistro = await registrarUsuario(nombreUsuario, correo, contrasena);

            console.log("Registro completado.", datosRegistro);

            const datosLogin = await iniciarSesionUsuario(correo, contrasena);

            console.log("Inicio de sesión completado.", datosLogin);

            await SecureStore.setItemAsync("auth_token", datosLogin.token);

            enrutador.replace("/(tabs)/account");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <ParallaxScrollView
                headerBackgroundColor={{ light: colorFondo, dark: colorFondo }}
                headerImage={

                    <View style={estilosInicio.envoltorioImagenEncabezado} >

                        <LinearGradient
                            colors={['#88006d', '#1a1a88']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={{
                                width: "100%",
                                height: "200%",
                                position: "absolute",
                                top: 0,
                            }}
                        />

                        <Image
                            source={require('@/assets/images/login-image.webp')}
                            style={estilosInicio.imagenEncabezado}
                        />

                    </View>
                }>

                <ThemedView style={estilosInicio.contenedorTitulo}>
                    <ThemedText type="title">Registrarse</ThemedText>
                </ThemedView>

                <ThemedView style={estilosInicio.contenidoComponente}>

                    <TextInput style={estilosInicio.entradaTexto}
                        placeholder="Nombre de usuario"
                        autoCapitalize="none"
                        value={nombreUsuario}
                        onChangeText={setNombreUsuario}
                    />

                    <TextInput style={estilosInicio.entradaTexto}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={correo}
                        onChangeText={setCorreo}
                    />

                    <TextInput
                        style={estilosInicio.entradaTexto}
                        placeholder="Contraseña"
                        placeholderTextColor="#777"
                        secureTextEntry
                        value={contrasena}
                        onChangeText={setContrasena}
                    />

                    <Animated.View style={{
                        opacity: desvanecerBotonRegistro,
                        width: "50%",
                        height: 50,
                    }}>
                        <LinearGradient
                            colors={['#3ca023', '#2cff48']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={{
                                padding: 3,
                                height: 40,
                                width: "100%",
                            }}>
                            <Pressable style={{
                                width: "100%",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                                onPressIn={botonRegistroPresionado}
                                onPressOut={botonRegistroSoltado}
                                onPress={manejarRegistro}>
                                <Text style={{
                                    color: "white",
                                    fontSize: 17,
                                }}>
                                    Crear cuenta
                                </Text>
                            </Pressable>
                        </LinearGradient>
                    </Animated.View>

                    <ThemedText style={{
                        textAlign: "center",
                        fontSize: 15,
                    }}>Los datos que introduzcas serán confidenciales y no serán compartidos a terceros.</ThemedText>

                </ThemedView>

            </ParallaxScrollView>


        </>
    );
}