import { router } from "expo-router";
import { Button } from "@/components/Button";
import { Screen, Header, AppText, Divider } from "@/components/ui/AppUi";

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
