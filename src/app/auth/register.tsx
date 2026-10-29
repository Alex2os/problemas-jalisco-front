import {
    AppText,
    Button,
    Field,
    Header,
    IconButton,
    Notice,
    Screen,
    TopBar,
} from "@/components/app/ui";
import { space } from "@/src/constants/design";
import { RegisterUser } from "@/src/services/RegisterUser";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, type TextInputInstance } from "react-native";

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
  const [visiblePassword, setVisiblePassword] = useState(false);

  return (
    <Screen
      bottom
      header={
        <TopBar
          title="Cuenta"
          back
          backDisabled={submitting}
          onBack={() => {
            if (!submission.current) router.replace("/(tabs)/perfil");
          }}
        />
      }
    >
      <View style={{ paddingTop: space.lg }}>
        <Header
          title="Crear una cuenta"
          subtitle="Solo necesitas un nombre, correo y contraseña."
        />
      </View>
      <View style={{ gap: space.xl }}>
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
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
          editable={!submitting}
          onSubmitEditing={ManageRegisterUser}
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
          label="Crear cuenta"
          loading={submitting}
          loadingLabel="Creando cuenta…"
          onPress={ManageRegisterUser}
        />
      </View>
      <View style={{ gap: space.xs }}>
        <AppText variant="caption" tone="muted" style={{ textAlign: "center" }}>
          ¿Ya tienes una cuenta?
        </AppText>
        <Button
          variant="text"
          label="Iniciar sesión"
          disabled={submitting}
          onPress={() => router.replace({ pathname: "/auth/login", params: { returnTo } })}
        />
      </View>
    </Screen>
  );
}
