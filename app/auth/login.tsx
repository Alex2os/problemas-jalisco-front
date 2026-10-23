import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { setAuthSession } from "@/services/session";
import { UserLogIn } from "@/services/UserLogIn";
import {
  Screen,
  TopBar,
  Header,
  Field,
  Button,
  AppText,
  Notice,
  IconButton,
} from "@/components/app/ui";
import { space } from "@/constants/design";

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
      setAuthSession(true);

      if (active.current) router.replace("/(tabs)/account");
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
  const passwordInput = useRef<TextInput>(null);
  const emailInput = useRef<TextInput>(null);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const { registered } = useLocalSearchParams<{ registered?: string }>();

  return (
    <Screen
      bottom
      header={
        <TopBar
          title="Cuenta"
          back
          backDisabled={submitting}
          onBack={() => {
            if (!submission.current) router.replace("/(tabs)/account");
          }}
        />
      }
    >
      <View style={{ paddingTop: space.lg }}>
        <Header
          title="Iniciar sesión"
          subtitle="Publica reportes y participa en los comentarios."
        />
      </View>
      <Notice
        success
        message={
          registered === "1" ? "Cuenta creada. Ya puedes iniciar sesión." : ""
        }
      />
      <View style={{ gap: space.xl }}>
        <Field
          ref={emailInput}
          label="Correo electrónico"
          maxLength={100}
          placeholder="nombre@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          editable={!submitting}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordInput.current?.focus()}
        />
        <Field
          ref={passwordInput}
          label="Contraseña"
          maxLength={100}
          placeholder="Tu contraseña"
          secureTextEntry={!visiblePassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          value={password}
          onChangeText={setPassword}
          editable={!submitting}
          onSubmitEditing={ManageUserLogIn}
          returnKeyType="go"
          trailing={
            <IconButton
              icon={visiblePassword ? "eye-off" : "eye"}
              label={
                visiblePassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              disabled={submitting}
              onPress={() => setVisiblePassword((value) => !value)}
            />
          }
        />
        <Notice message={error} />
        <Button
          label="Iniciar sesión"
          loading={submitting}
          loadingLabel="Ingresando…"
          onPress={ManageUserLogIn}
        />
      </View>
      <View style={{ gap: space.xs }}>
        <AppText variant="caption" tone="muted" style={{ textAlign: "center" }}>
          ¿No tienes una cuenta?
        </AppText>
        <Button
          variant="text"
          label="Crear una cuenta"
          disabled={submitting}
          onPress={() => router.replace("/auth/register")}
        />
      </View>
    </Screen>
  );
}
