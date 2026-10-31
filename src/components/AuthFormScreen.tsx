import { type PropsWithChildren, type Ref, useState } from "react";
import { View, type TextInputInstance } from "react-native";
import { Button } from "@/components/Button";
import {
  AppText,
  Field,
  Header,
  IconButton,
  Notice,
  Screen,
  TopBar,
} from "@/components/ui/AppUi";
import { space } from "@/constants/design";

export interface AuthFormScreenProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  successMessage?: string;
  errorMessage: string;
  submitting: boolean;
  submitLabel: string;
  loadingLabel: string;
  alternatePrompt: string;
  alternateLabel: string;
  onBack: () => void;
  onSubmit: () => void;
  onAlternate: () => void;
}

export function AuthFormScreen({
  title,
  subtitle,
  successMessage,
  errorMessage,
  submitting,
  submitLabel,
  loadingLabel,
  alternatePrompt,
  alternateLabel,
  onBack,
  onSubmit,
  onAlternate,
  children,
}: AuthFormScreenProps) {
  return (
    <Screen
      bottom
      header={
        <TopBar
          title="Cuenta"
          back
          backDisabled={submitting}
          onBack={onBack}
        />
      }
    >
      <View style={{ paddingTop: space.lg }}>
        <Header title={title} subtitle={subtitle} />
      </View>
      {successMessage !== undefined && (
        <Notice success message={successMessage} />
      )}
      <View style={{ gap: space.xl }}>
        {children}
        <Notice message={errorMessage} />
        <Button
          label={submitLabel}
          loading={submitting}
          loadingLabel={loadingLabel}
          onPress={onSubmit}
        />
      </View>
      <View style={{ gap: space.xs }}>
        <AppText variant="caption" tone="muted" style={{ textAlign: "center" }}>
          {alternatePrompt}
        </AppText>
        <Button
          variant="text"
          label={alternateLabel}
          disabled={submitting}
          onPress={onAlternate}
        />
      </View>
    </Screen>
  );
}

export interface AuthCredentialsFieldsProps {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  passwordAutoComplete: "current-password" | "new-password";
  submitting: boolean;
  onSubmit: () => void;
  emailInputRef?: Ref<TextInputInstance>;
  passwordInputRef?: Ref<TextInputInstance>;
}

export function AuthCredentialsFields({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  passwordAutoComplete,
  submitting,
  onSubmit,
  emailInputRef,
  passwordInputRef,
}: AuthCredentialsFieldsProps) {
  const [visiblePassword, setVisiblePassword] = useState(false);

  return (
    <>
      <Field
        ref={emailInputRef}
        label="Correo electrónico"
        maxLength={100}
        placeholder="nombre@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        value={email}
        onChangeText={onEmailChange}
        editable={!submitting}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => {
          if (passwordInputRef && "current" in passwordInputRef) {
            passwordInputRef.current?.focus();
          }
        }}
      />
      <Field
        ref={passwordInputRef}
        label="Contraseña"
        maxLength={100}
        placeholder="Tu contraseña"
        secureTextEntry={!visiblePassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={passwordAutoComplete}
        value={password}
        onChangeText={onPasswordChange}
        editable={!submitting}
        onSubmitEditing={onSubmit}
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
    </>
  );
}

