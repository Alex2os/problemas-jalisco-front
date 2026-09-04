// Servicio para registrar una nueva cuenta de usuario en el sistema.
const API_URL = "http://10.0.2.2:5195";

export async function registrarUsuario(nombreUsuario: string, correo: string, contrasena: string) {
  const respuesta = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: nombreUsuario,
      email: correo,
      password: contrasena,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "Error al registrar el usuario.");
  }

  return datos;
}