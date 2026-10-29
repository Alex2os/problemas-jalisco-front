import * as SecureStore from "expo-secure-store";
import { sessionVersion } from "./session";
import { Platform } from "react-native";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:5140" : "http://localhost:5140")
).replace(/\/$/, "");

export const apiUrl = (path: string) =>
  `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  authenticated: boolean | "optional" = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  const multipart =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !multipart && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (multipart) headers.delete("Content-Type");
  const identity = sessionVersion();
  if (authenticated) {
    const token = await SecureStore.getItemAsync("auth_token");
    if (identity !== sessionVersion())
      throw new ApiError(401, "La sesión cambió. Intenta de nuevo.");
    if (!token && authenticated === true)
      throw new ApiError(401, "Inicia sesión para continuar.");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    multipart ? 90000 : 15000,
  );
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const body = await response.text();
    let data;
    try {
      data = body ? JSON.parse(body) : undefined;
    } catch {
      throw new Error(`Respuesta inválida del servidor (${response.status}).`);
    }
    if (!response.ok)
      throw new ApiError(
        response.status,
        data?.message ||
          data?.detail ||
          data?.title ||
          `Error del servidor (${response.status}).`,
      );
    if (authenticated && identity !== sessionVersion())
      throw new ApiError(409, "La sesión cambió. Actualiza la información.");
    return data as T;
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error("La solicitud tardó demasiado. Intenta de nuevo.");
    if (error instanceof TypeError)
      throw new Error(
        "No se pudo conectar con el servidor. Revisa tu conexión.",
      );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
