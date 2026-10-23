import { apiRequest } from "./api";
export function RegisterUser(username: string, email: string, password: string) {
  return apiRequest<unknown>("/auth/register", { method: "POST", body: JSON.stringify({ username: username.trim(), email: email.trim(), password }) });
}
