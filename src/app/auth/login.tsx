import {
  AuthCredentialsFields,
  AuthFormScreen,
} from "@/components/AuthFormScreen";
import { setAuthSession } from "@/services/session";
import { UserLogIn } from "@/services/user-login";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { type TextInputInstance } from "react-native";

export default function Login() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submission = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const ManageUserLogIn = async () => {
    if (submission.current) return;
    if (!email.trim() || !password) {
      setError("Completa todos los campos.");
      return;
    }
    submission.current = true;
    setSubmitting(true);
    setError("");
    try {
      const data = await UserLogIn(email, password);

      await SecureStore.setItemAsync("auth_token", data.token);
      setAuthSession(true, data.user);

      if (active.current) {
        if (returnTo === "/reportar/categoria" || returnTo === "/reportar/revisar") router.replace(returnTo);
        else if (returnTo && /^\/reporte\/editar\/\d+$/.test(returnTo))
          router.replace({ pathname: "/reporte/editar/[id]", params: { id: returnTo.split("/").pop()! } });
        else if (returnTo && /^\/reporte\/\d+$/.test(returnTo))
          router.replace({ pathname: "/reporte/[id]", params: { id: returnTo.split("/").pop()! } });
        else router.replace("/(tabs)/perfil");
      }
    } catch (error) {
      if (active.current)
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo completar la solicitud.",
        );
    } finally {
      submission.current = false;
      if (active.current) setSubmitting(false);
    }
  };
  const passwordInput = useRef<TextInputInstance>(null);
  const emailInput = useRef<TextInputInstance>(null);
  const { registered, returnTo } = useLocalSearchParams<{ registered?: string; returnTo?: string }>();

  return (
    <AuthFormScreen
      title="Iniciar sesión"
      subtitle="Publica reportes y participa en los comentarios."
      successMessage={
        registered === "1" ? "Cuenta creada. Ya puedes iniciar sesión." : ""
      }
      errorMessage={error}
      submitting={submitting}
      submitLabel="Iniciar sesión"
      loadingLabel="Ingresando…"
      alternatePrompt="¿No tienes una cuenta?"
      alternateLabel="Crear una cuenta"
      onBack={() => {
        if (submission.current) return;
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)/perfil");
      }}
      onSubmit={ManageUserLogIn}
      onAlternate={() =>
        router.replace({ pathname: "/auth/register", params: { returnTo } })
      }
    >
      <AuthCredentialsFields
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        passwordAutoComplete="current-password"
        submitting={submitting}
        onSubmit={ManageUserLogIn}
        emailInputRef={emailInput}
        passwordInputRef={passwordInput}
      />
    </AuthFormScreen>
  );
}
