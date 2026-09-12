import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {useThemeColor} from '@/hooks/use-theme-color';
import {useRouter} from 'expo-router';
import * as SecureStore from "expo-secure-store";
import {useRef, useState} from "react";
import {Animated, Pressable, Text, TextInput, View} from 'react-native';

import {Image} from 'expo-image';

import {LinearGradient} from 'expo-linear-gradient';

import {estilosInicio} from "@/styles/estilosInicio";

import ParallaxScrollView from '@/components/parallax-scroll-view';

import {iniciarSesionUsuario} from "@/services/iniciarSesionUsuario";

// Pantalla para iniciar sesión con correo electrónico y contraseña.
export default function Login() {

    const enrutador = useRouter();

    const [contrasena, setContrasena] = useState("");
    const [correo, setCorreo] = useState("");

    const colorFondo = useThemeColor({}, 'background');

    const desvanecerBotonLogin = useRef(new Animated.Value(1)).current;

    const botonLoginPresionado = () => {
        Animated.timing(desvanecerBotonLogin, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    const botonLoginSoltado = () => {
        Animated.timing(desvanecerBotonLogin, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

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

    // Función encargada de validar las credenciales con la API y guardar el token JWT devuelto en SecureStore.
    const manejarInicioSesion = async () => {
        try {
            const datos = await iniciarSesionUsuario(correo, contrasena);

            await SecureStore.setItemAsync("auth_token", datos.token);

            console.log("Inicio de sesión completado.", datos);
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
                    <ThemedText type="title">Ingresar</ThemedText>
                </ThemedView>

                <ThemedView style={estilosInicio.contenidoComponente}>

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
                        opacity: desvanecerBotonLogin,
                        width: "50%",
                        height: 50,
                    }}>
                        <LinearGradient
                            colors={['#105ac9', '#3d8bff']}
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
                                onPressIn={botonLoginPresionado}
                                onPressOut={botonLoginSoltado}
                                onPress={manejarInicioSesion}>
                                <Text style={{
                                    color: "white",
                                    fontSize: 17,
                                }}>
                                    Ingresar
                                </Text>
                            </Pressable>
                        </LinearGradient>
                    </Animated.View>

                    <ThemedText style={{
                        fontSize: 17,
                    }}>Ingresa con tu correo electrónico y contraseña.</ThemedText>

                    <ThemedText style={{
                        fontSize: 17,
                    }}>¿No tienes una cuenta?</ThemedText>

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
                            <Pressable
                                onPressIn={botonRegistroPresionado}
                                onPressOut={botonRegistroSoltado}
                                onPress={() => enrutador.push("/register")}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                <Text style={{
                                    color: "white",
                                    fontSize: 17,
                                }}>
                                    Crea una cuenta
                                </Text>
                            </Pressable>
                        </LinearGradient>
                    </Animated.View>
                </ThemedView>

            </ParallaxScrollView>


        </>
    );
}