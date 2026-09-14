const API_URL = "http://10.0.2.2:5195";

export async function RegisterUser(username: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al registrar el usuario.");
  }

  return data;
}