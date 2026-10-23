import { router } from "expo-router";
import { Screen, Header, AppText, Button, Divider } from "@/components/app/ui";

export default function ModalScreen() {
  return (
    <Screen bottom>
      <Header title="Publicar un reporte" />
      <AppText>
        Selecciona el lugar del incidente en el mapa. Después, elige el tipo de
        problema y describe lo que ocurre.
      </AppText>
      <Divider />
      <AppText tone="muted">
        Para publicar reportes y comentarios, inicia sesión desde Cuenta.
      </AppText>
      <Button label="Ir al mapa" onPress={() => router.dismissTo("/")} />
    </Screen>
  );
}
