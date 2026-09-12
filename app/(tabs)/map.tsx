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
  View
} from 'react-native';

import MapView, {Marker} from 'react-native-maps';

import PopupCuentaNecesaria from "@/components/PopupCuentaNecesaria";
import SelectorReporte from "@/components/SelectorReporte";

import CancelReportButton from "@/components/CancelReportButton";
import {crearReporte} from "@/services/crearReporte";
import {obtenerTodosLosReportes} from "@/services/obtenerTodosLosReportes";

import {mapStyles} from "@/styles/mapStyles";

// Pantalla principal del mapa interactivo donde se visualizan y agregan reportes en el estado de Jalisco.
export default function PantallaMapa() {

  const [markers, setMarkers] = useState<any[]>([]);
  const [newMarker, setNewMarker] = useState<any[]>([]);

  const [problemaSeleccionado, setProblemaSeleccionado] = useState("accidente");
  const [textoReporte, setTextoReporte] = useState("");

  const [reportProblemModal, setReportProblemModal] = useState(false);

  const [popupCuentaNecesariaActivo, setPopupCuentaNecesariaActivo] = useState(false);

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
    obtenerReportes();
  }, []);

  const manejarPresionMapa = (evento: any) => {
    const {latitude: latitud, longitude: longitud} = evento.nativeEvent.coordinate;

    setNewMarker([
      {
        latitude: latitud,
        longitude: longitud,
      }
    ]);

    setReportProblemModal(true);
  };

  // dictionary/array to get colors of markers.
  const MarkerColors = {
    "accidente": "#ff6969",
    "basura": "#b9ff69",
    "bloqueo": "#69c8ff",
    "corte-de-sercicios": "#f5ff69",
    "transporte-publico": "#ffa069",
    "robo-asalto": "#aa69ff",
    "otros": "#f369ff",
  } as const;

  // we have to add const at the end so there's no problems with typescript. seems like typescript has a LOT of strict rules and it slows development-
  // but seems to "promise" fewer bugs

  // dictionary/array to get the icon of a marker
  const MarkerIcons = {
    "accidente": "alert-triangle",
    "basura": "trash",
    "bloqueo": "lock",
    "corte-de-sercicios": "frown",
    "transporte-publico": "truck",
    "robo-asalto": "eye-off",
    "otros": "code",
  } as const;

  // Verifica si las coordenadas seleccionadas en el mapa pertenecen al rango de Jalisco.
  function verificarCoordenadasNuevoMarcador() {
    const marcadorActual = newMarker[0];

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
      setReportProblemModal(false);

      return;
    }

    if(!verificarCoordenadasNuevoMarcador()) {
      setReportProblemModal(false);

      return;
    }

    let tipoReporte = problemaSeleccionado;
    const descripcionReporte = textoReporte;

    try {
      const datos = await crearReporte(
        tipoReporte,
        descripcionReporte,
        newMarker[0].latitude,
        newMarker[0].longitude
      );

      console.log("Reporte creado.", datos);
    }
    catch(error) {
      console.log("Error al crear el reporte.", error);
    }

    obtenerReportes();

    setReportProblemModal(false);
    setTextoReporte("");

    console.log(
      "Marcador añadido al mapa.\nLongitud: "
      + newMarker[0].longitude
      + "\nLatitud: "
      + newMarker[0].latitude
    );
  }

  // Obtiene los reportes desde la API y actualiza el estado de marcadores.
  async function obtenerReportes() {
    try {
      const datos = await obtenerTodosLosReportes();

      setMarkers(datos);

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

        {markers.map((marker: any, indice: number) => (
          <Marker
            key={indice}
            coordinate={{
              latitude: marker.markerLatitude,
              longitude: marker.markerLongitude,
            }}
            title={marker.reportType}
            description={marker.description}
          >
            {/* for typescript issues (ts is bullshit) we have to specify the type of the marker.reporType, as if not this gives errors.*/}
            {/* we can do this by simply doing as keyof typeof markercolors, typeof for the type/shape of markercolors and keyof for the name of properties inside there. */}
            <View style={{backgroundColor: MarkerColors[marker.reportType as keyof typeof MarkerColors]}}>
              <Feather name={MarkerIcons[marker.reportType as keyof typeof MarkerIcons]} size={18} color="black" />
            </View>
          </Marker>
        ))}
      </MapView>

      <Pressable style={mapStyles.update_reports_button} onPress={obtenerReportes}>
        <Text className="text-xl font-bold">Actualizar </Text>
      </Pressable>

      {popupCuentaNecesariaActivo &&
        <PopupCuentaNecesaria
          setPopupCuentaNecesariaActivo={setPopupCuentaNecesariaActivo}
        />
      }

      {/* REPORT PROBLEM MODAL */}
      {reportProblemModal && (
        <ThemedView
          style={[
            mapStyles.report_problem_flex,
            {
              backgroundColor: colorFondo,
              borderColor: esquemaColor == 'dark' ? 'white' : 'black',
            }
          ]}
        >
          <ThemedText
            style={{textAlign: "center"}}
            type="subtitle"
          >
            ¿Qué problema quieres reportar?
          </ThemedText>

          <SelectorReporte
            problemaSeleccionado={problemaSeleccionado}
            setProblemaSeleccionado={setProblemaSeleccionado}
          />

          {/* with multiline we can make it so this input works like a textarea.*/}
          <TextInput className="bg-white w-full h-[100px] text-black p-[10px] text-[15px]"
            placeholder="Describe el problema..."
            autoCapitalize="none"
            multiline={true}
            onChangeText={setTextoReporte}
            value={textoReporte}>
          </TextInput>

          <Pressable className="flex text-black items-center justify-center bg-[#407cff] w-full h-[50px]" onPress={() => agregarMarcadorAlMapa()}>
            <Text className="text-[17px] text-white">Añadir</Text>
          </Pressable>

          <CancelReportButton
            setPopupReporteVisible={setReportProblemModal}
            setTextoEntradaReporte={setTextoReporte}
          />
        </ThemedView>
      )}

    </View>
  );
}