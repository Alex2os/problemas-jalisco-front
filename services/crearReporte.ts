import * as SecureStore from "expo-secure-store";

// Servicio para registrar un nuevo reporte en la API backend utilizando el token de autenticación.
const API_URL = "http://10.0.2.2:5195";

export async function crearReporte(tipoReporte: string, descripcion: string, latitud: number, longitud: number) {

    const tokenAutenticacion = await SecureStore.getItemAsync("auth_token");

    const respuesta = await fetch(`${API_URL}/api/reports/createreport`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenAutenticacion}`,
        },
        body: JSON.stringify({
            reportType: tipoReporte,
            description: descripcion,
            latitude: latitud,
            longitude: longitud,
        }),
    });

    const datos = await respuesta.json();

    if(!respuesta.ok) {
        throw new Error(datos.message);
    }

    return datos;
}