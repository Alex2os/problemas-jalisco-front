import {
  AuthCredentialsFields,
  AuthFormScreen,
} from "@/components/AuthFormScreen";
import { Field } from "@/components/ui/AppUi";
import { RegisterUser } from "@/services/register-user";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { type TextInputInstance } from "react-native";

export default function Register() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
  const ManageRegisterUser = async () => {
    if (submission.current) return;
    if (!username.trim() || !email.trim() || !password) {
      setError("Completa todos los campos.");
      return;
    }
    submission.current = true;
    setSubmitting(true);
    setError("");
    try {
      await RegisterUser(username, email, password);

      if (active.current)
        router.replace({
          pathname: "/auth/login",
          params: { registered: "1", returnTo },
        });
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

  return (
    <AuthFormScreen
      title="Crear una cuenta"
      subtitle="Solo necesitas un nombre, correo y contraseña."
      errorMessage={error}
      submitting={submitting}
      submitLabel="Crear cuenta"
      loadingLabel="Creando cuenta…"
      alternatePrompt="¿Ya tienes una cuenta?"
      alternateLabel="Iniciar sesión"
      onBack={() => {
        if (submission.current) return;
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)/perfil");
      }}
      onSubmit={ManageRegisterUser}
      onAlternate={() =>
        router.replace({ pathname: "/auth/login", params: { returnTo } })
      }
    >
      <Field
        label="Nombre de usuario"
        maxLength={20}
        placeholder="Tu nombre de usuario"
        autoCapitalize="none"
        autoComplete="username"
        value={username}
        onChangeText={setUsername}
        editable={!submitting}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailInput.current?.focus()}
      />
      <AuthCredentialsFields
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        passwordAutoComplete="new-password"
        submitting={submitting}
        onSubmit={ManageRegisterUser}
        emailInputRef={emailInput}
        passwordInputRef={passwordInput}
      />
    </AuthFormScreen>
  );
}
