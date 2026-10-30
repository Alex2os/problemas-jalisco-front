import * as SecureStore from "expo-secure-store";
import { sessionVersion, setAuthSession } from "./session";
const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
if (!API_URL) throw new Error("Configura EXPO_PUBLIC_API_URL en el archivo .env.");

export const apiUrl = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiConnectionError extends Error {
  constructor(public readonly reason: "network" | "timeout", uncertainWrite = false) {
    super((reason === "timeout"
      ? "El servidor está tardando demasiado en responder. Intenta de nuevo en unos momentos."
      : "No pudimos conectar con el servidor. Revisa tu conexión a internet o inténtalo más tarde.")
      + (uncertainWrite ? " No se pudo confirmar el cambio. Revisa tus reportes antes de repetir la acción." : ""));
    this.name = "ApiConnectionError";
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
    let response: Response;
    let body: string;
    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      body = await response.text();
    } catch {
      // Native fetch can reject with Error rather than TypeError. Only classify transport failures here.
      const uncertainWrite = path.startsWith("/reports") && ["POST", "PUT", "DELETE", "PATCH"].includes((options.method || "GET").toUpperCase());
      throw new ApiConnectionError(controller.signal.aborted ? "timeout" : "network", uncertainWrite);
    }
    let data;
    try {
      data = body ? JSON.parse(body) : undefined;
    } catch {
      if (response.ok) throw new Error("No pudimos leer la respuesta del servidor. Intenta de nuevo más tarde.");
    }
    if (response.status === 401 && authenticated && identity === sessionVersion()) {
      await SecureStore.deleteItemAsync("auth_token");
      if (identity === sessionVersion()) setAuthSession(false);
    }
    if (!response.ok)
      throw new ApiError(
        response.status,
        data?.message ||
          data?.detail ||
          data?.title ||
          (response.status >= 500
            ? "El servidor no está disponible en este momento. Intenta de nuevo más tarde."
            : `No se pudo completar la solicitud (${response.status}).`),
      );
    if (authenticated && identity !== sessionVersion())
      throw new ApiError(409, "La sesión cambió. Actualiza la información.");
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}
