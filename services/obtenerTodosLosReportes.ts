// Servicio para obtener el listado completo de reportes registrados en la plataforma.
const API_URL = "http://10.0.2.2:5140";

export async function obtenerTodosLosReportes() {

    const respuesta = await fetch(`${API_URL}/api/reports/getallreports`, {
        method: "GET",
    });

    const datos = await respuesta.json();

    if(!respuesta.ok) {
        throw new Error(datos.message);
    }

    return datos.reports;
}