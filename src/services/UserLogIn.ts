import { apiRequest } from "./api";
export function UserLogIn(email: string, password: string) {
  return apiRequest<{ token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email: email.trim(), password }) });
}
