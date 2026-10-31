import * as SecureStore from "expo-secure-store";
import { sessionVersion, setAuthSession } from "./session";
const isDev =
  typeof __DEV__ !== "undefined"
    ? Boolean(__DEV__)
    : process.env.NODE_ENV !== "production";
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
  constructor(
    public readonly reason: "network" | "timeout" | "parse",
    uncertainWrite = false,
    message?: string,
  ) {
    const defaultMessage =
      reason === "timeout"
        ? "El servidor está tardando demasiado en responder. Intenta de nuevo en unos momentos."
        : reason === "parse"
          ? "No pudimos leer la respuesta del servidor. Intenta de nuevo más tarde."
          : "No pudimos conectar con el servidor. Revisa tu conexión a internet o inténtalo más tarde.";
    super(
      (message || defaultMessage) +
        (uncertainWrite
          ? " No se pudo confirmar el cambio. Revisa tus reportes antes de repetir la acción."
          : ""),
    );
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
  const method = (options.method || "GET").toUpperCase();
  const isWrite = ["POST", "PUT", "DELETE", "PATCH"].includes(method);
  const uncertainWrite = path.startsWith("/reports") && isWrite;

  try {
    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (networkError) {
      const isTimeout = controller.signal.aborted;
      const errorReason = isTimeout ? "timeout" : "network";
      if (isDev) {
        console.warn(
          `[API Transport Error] ${method} ${path} -> ${errorReason}:`,
          networkError instanceof Error ? networkError.message : String(networkError),
        );
      }
      throw new ApiConnectionError(errorReason, uncertainWrite);
    }

    let body = "";
    try {
      body = await response.text();
    } catch (readError) {
      if (isDev) {
        console.warn(
          `[API Read Error] ${method} ${path} [HTTP ${response.status}] -> Failed to read response stream:`,
          readError instanceof Error ? readError.message : String(readError),
        );
      }
      // If we got a server response but reading body failed, we know it's a transport/connection drop while reading
      throw new ApiConnectionError("network", uncertainWrite);
    }

    let data: any;
    let parseError: unknown;
    try {
      data = body ? JSON.parse(body) : undefined;
    } catch (err) {
      parseError = err;
    }

    if (response.status === 401 && authenticated && identity === sessionVersion()) {
      await SecureStore.deleteItemAsync("auth_token");
      if (identity === sessionVersion()) setAuthSession(false);
    }

    if (!response.ok) {
      if (isDev) {
        console.warn(
          `[API HTTP Error] ${method} ${path} -> HTTP ${response.status}`,
          data ? data : body ? body.slice(0, 300) : "(empty response body)",
        );
      }

      // Check for structured validation errors from ASP.NET Core: { errors: { field: ["msg"] } }
      let validationMessage = data?.message || data?.detail;

      if (!validationMessage && data?.errors && typeof data.errors === "object") {
        const firstField = Object.keys(data.errors)[0];
        if (firstField && Array.isArray(data.errors[firstField]) && data.errors[firstField][0]) {
          validationMessage = String(data.errors[firstField][0]);
        }
      }

      if (!validationMessage && data?.title) {
        validationMessage = data.title;
      }

      const fallbackMessage =
        response.status === 413
          ? "El archivo o reporte excede el tamaño máximo permitido por el servidor."
          : response.status === 415
            ? "El formato de los archivos adjuntos no es aceptado por el servidor."
            : response.status >= 500
              ? "El servidor no está disponible en este momento. Intenta de nuevo más tarde."
              : `No se pudo completar la solicitud (${response.status}).`;

      throw new ApiError(response.status, validationMessage || fallbackMessage);
    }

    if (parseError && body) {
      if (isDev) {
        console.warn(
          `[API Parse Error] ${method} ${path} [HTTP ${response.status}] -> Expected JSON but got:`,
          body.slice(0, 150),
        );
      }
      throw new Error("No pudimos leer la respuesta del servidor. Intenta de nuevo más tarde.");
    }

    if (authenticated && identity !== sessionVersion())
      throw new ApiError(409, "La sesión cambió. Actualiza la información.");
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}
