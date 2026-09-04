// Servicio encargado de autenticar al usuario mediante sus credenciales (correo y contraseña).
const API_URL = "http://10.0.2.2:5195";

export async function iniciarSesionUsuario(correo: string, contrasena: string) {
  const respuesta = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: correo,
      password: contrasena,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "Error al iniciar sesión.");
  }

  return datos;
}