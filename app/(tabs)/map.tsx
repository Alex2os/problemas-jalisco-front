import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {useThemeColor} from '@/hooks/use-theme-color';

import Feather from '@expo/vector-icons/Feather';
import * as SecureStore from "expo-secure-store";

import {useEffect, useRef, useState} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View
} from 'react-native';

import MapView, {Marker} from 'react-native-maps';

import BotonAgregarReporte from "@/components/BotonAgregarReporte";
import BotonCancelarReporte from "@/components/BotonCancelarReporte";
import PopupCuentaNecesaria from "@/components/PopupCuentaNecesaria";
import SelectorReporte from "@/components/SelectorReporte";

import {crearReporte} from "@/services/crearReporte";
import {obtenerTodosLosReportes} from "@/services/obtenerTodosLosReportes";

import {estilosMapa} from "@/styles/estilosMapa";

// Pantalla principal del mapa interactivo donde se visualizan y agregan reportes en el estado de Jalisco.
export default function PantallaMapa() {

  const [marcadores, setMarcadores] = useState<any[]>([]);
  const [nuevoMarcador, setNuevoMarcador] = useState<any[]>([]);

  const [problemaSeleccionado, setProblemaSeleccionado] = useState("accidente");
  const [textoReporte, setTextoReporte] = useState("");

  const [popupReporteActivo, setPopupReporteActivo] = useState(false);
  const [popupCuentaNecesariaActivo, setPopupCuentaNecesariaActivo] = useState(false);

  const {height: alto} = useWindowDimensions();
  const {width: ancho} = useWindowDimensions();

  const esquemaColor = useColorScheme();
  const colorFondo = useThemeColor({}, 'background');

  const animacionDesvanecer = useRef(new Animated.Value(1)).current;

  // Coordenadas límite para restringir la creación de reportes al estado de Jalisco.
  const limitesJalisco = {
    north: 22.75,
    south: 18.92,
    east: -101.50,
    west: -105.68,
  };

  useEffect(() => {
    if(popupReporteActivo) {
      Animated.timing(animacionDesvanecer, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
    else {
      Animated.timing(animacionDesvanecer, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [popupReporteActivo]);

  useEffect(() => {
    obtenerReportes();
  }, []);

  const manejarPresionMapa = (evento: any) => {
    const {latitude: latitud, longitude: longitud} = evento.nativeEvent.coordinate;

    setNuevoMarcador([
      {
        latitude: latitud,
        longitude: longitud,
      }
    ]);

    setPopupReporteActivo(true);
  };

  // Función para asignar un color distinto al marcador del mapa según la categoría del reporte.
  function definirColorMarcador(tituloMarcador: string) {
    switch(tituloMarcador) {
      case "accidente":
        return "#ff6969";

      case "basura":
        return "#b9ff69";

      case "bloqueo":
        return "#69c8ff";

      case "corte-de-servicios":
        return "#f5ff69";

      case "transporte-publico":
        return "#ffa069";

      case "robo-asalto":
        return "#aa69ff";

      case "otros":
        return "#f369ff";

      default:
        return "#6d6d6d";
    }
  }

  // Función para determinar el ícono de Feather Icons asignado a cada tipo de problema.
  function definirIconoMarcador(tituloMarcador: string) {
    switch(tituloMarcador) {
      case "accidente":
        return "alert-triangle";

      case "basura":
        return "trash";

      case "bloqueo":
        return "lock";

      case "corte-de-servicios":
        return "frown";

      case "transporte-publico":
        return "truck";

      case "robo-asalto":
        return "eye-off";

      case "otros":
        return "code";

      default:
        return "moon";
    }
  }

  // Verifica si las coordenadas seleccionadas en el mapa pertenecen al rango de Jalisco.
  function verificarCoordenadasNuevoMarcador() {
    const marcadorActual = nuevoMarcador[0];

    if(
      marcadorActual.latitude < limitesJalisco.south ||
      marcadorActual.latitude > limitesJalisco.north
    ) return false;

    if(
      marcadorActual.longitude < limitesJalisco.west ||
      marcadorActual.longitude > limitesJalisco.east
    ) return false;

    else return true;
  }

  // Envía el reporte a la API backend y refresca los marcadores si el usuario está autenticado.
  async function agregarMarcadorAlMapa() {
    const tokenAutenticacion = await SecureStore.getItemAsync("auth_token");

    if(tokenAutenticacion) {}
    else {
      setPopupCuentaNecesariaActivo(true);
      setPopupReporteActivo(false);

      return;
    }

    if(!verificarCoordenadasNuevoMarcador()) {
      setPopupReporteActivo(false);

      return;
    }

    let tipoReporte = problemaSeleccionado;
    const descripcionReporte = textoReporte;

    try {
      const datos = await crearReporte(
        tipoReporte,
        descripcionReporte,
        nuevoMarcador[0].latitude,
        nuevoMarcador[0].longitude
      );

      console.log("Reporte creado.", datos);
    }
    catch(error) {
      console.log("Error al crear el reporte.", error);
    }

    obtenerReportes();

    setPopupReporteActivo(false);
    setTextoReporte("");

    console.log(
      "Marcador añadido al mapa.\nLongitud: "
      + nuevoMarcador[0].longitude
      + "\nLatitud: "
      + nuevoMarcador[0].latitude
    );
  }

  // Obtiene los reportes desde la API y actualiza el estado de marcadores.
  async function obtenerReportes() {
    try {
      const datos = await obtenerTodosLosReportes();

      setMarcadores(datos);

      console.log("Reportes obtenidos.");
    }
    catch(error) {
      console.log("Error al obtener los reportes.", error);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        position: "relative",
      }}
    >
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 20.6597,
          longitude: -103.3496,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={manejarPresionMapa}
      >
        {marcadores.map((marcador: any, indice: number) => (
          <Marker
            key={indice}
            coordinate={{
              latitude: marcador.markerLatitude,
              longitude: marcador.markerLongitude,
            }}
            title={marcador.reportType}
            description={marcador.description}
          >
            <View
              style={[
                estilosMapa.envoltorioMarcador,
                {
                  backgroundColor: definirColorMarcador(marcador.reportType)
                }
              ]}
            >
              <Feather
                name={definirIconoMarcador(marcador.reportType)}
                size={18}
                color="black"
              />
            </View>
          </Marker>
        ))}
      </MapView>

      <Pressable
        className="absolute top-[60px] h-[5%] w-[70%] items-center justify-center bg-white"
        onPress={obtenerReportes}>
        <Text className="text-xl font-bold">hello
        </Text>
      </Pressable>

      {popupCuentaNecesariaActivo &&
        <PopupCuentaNecesaria
          setPopupCuentaNecesariaActivo={setPopupCuentaNecesariaActivo}
        />
      }

      <Animated.View
        style={[
          estilosMapa.vistaAnimadaPopupReporte,
          {
            opacity: animacionDesvanecer,
            pointerEvents: popupReporteActivo ? "auto" : "none",
            transform: [
              {translateY: -(alto / 2) / 1.9},
              {translateX: -(ancho / 2) / 1.25},
            ],
            height: alto / 1.9,
            width: ancho / 1.25,
          }
        ]}
      >
        <ThemedView
          style={[
            estilosMapa.flexReportarProblema,
            {
              backgroundColor: colorFondo,
              borderColor: esquemaColor == 'dark' ? 'white' : 'black',
            }
          ]}
        >
          <ThemedText
            type="subtitle"
            style={{textAlign: "center"}}
          >
            ¿Qué problema quieres reportar?
          </ThemedText>

          <SelectorReporte
            problemaSeleccionado={problemaSeleccionado}
            setProblemaSeleccionado={setProblemaSeleccionado}
          />

          <ThemedView
            style={{
              width: "100%",
              height: "auto",
              padding: 2,
              backgroundColor: esquemaColor == 'dark' ? 'white' : 'black',
            }}
          >
            <TextInput
              style={estilosMapa.entradaTextoReporte}
              placeholder="Describe el problema..."
              autoCapitalize="none"
              onChangeText={setTextoReporte}
              value={textoReporte}
            >
            </TextInput>
          </ThemedView>

          <BotonAgregarReporte
            agregarMarcadorAlMapa={agregarMarcadorAlMapa}
          />

          <BotonCancelarReporte
            setPopupReporteVisible={setPopupReporteActivo}
            setTextoEntradaReporte={setTextoReporte}
          />
        </ThemedView>
      </Animated.View>
    </View>
  );
}