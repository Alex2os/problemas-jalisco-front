const API_URL = "http://10.0.2.2:5195";

export async function UserLogIn(email: string, password: string) {
  const reponse = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await reponse.json();

  if (!reponse.ok) {
    throw new Error(data.message || "Error al iniciar sesión.");
  }

  return data;
}