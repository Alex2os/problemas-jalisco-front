import type { SessionUser } from "./session";
import { apiRequest } from "./api";
export function UserLogIn(email: string, password: string) {
  return apiRequest<{ token: string; user: SessionUser }>("/auth/login", { method: "POST", body: JSON.stringify({ email: email.trim(), password }) });
}
