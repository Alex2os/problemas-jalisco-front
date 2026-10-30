import { AppText, Button, Divider, Screen, TopBar } from "@/components/ui/AppUi";
import { space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Link, router } from "expo-router";
import { View } from "react-native";

export default function About() {
  const { colors } = useAppTheme();
  return (
    <Screen header={<TopBar title="Acerca de" />}>
      <View style={{ gap: space.md, paddingTop: space.lg }}>
        <View
          style={{ width: 28, height: 4, backgroundColor: colors.accent }}
        />
        <AppText variant="title">Problemas Jalisco</AppText>
        <AppText tone="muted">
          Información local, compartida por quienes están ahí.
        </AppText>
      </View>
      <AppText>
        Un mapa de los incidentes que afectan el día a día en Jalisco: problemas
        viales, basura, fallas de servicios y otros reportes ciudadanos.
      </AppText>
      <Divider />
      <AppText variant="heading">Cómo funciona</AppText>
      {[
        [
          "01",
          "Consulta el mapa",
          "Encuentra reportes por ubicación. Toca un marcador para abrir sus detalles.",
        ],
        [
          "02",
          "Publica un reporte",
          "Selecciona el lugar, elige el tipo de problema y describe lo que ocurre.",
        ],
        [
          "03",
          "Aporta información",
          "Los comentarios permiten compartir detalles adicionales sobre un incidente.",
        ],
      ].map(([number, title, description]) => (
        <View key={number} style={{ flexDirection: "row", gap: space.lg }}>
          <AppText variant="caption" tone="accent" style={{ paddingTop: 3 }}>
            {number}
          </AppText>
          <View style={{ flex: 1, gap: space.xs }}>
            <AppText variant="label">{title}</AppText>
            <AppText tone="muted">{description}</AppText>
          </View>
        </View>
      ))}
      <Link
        href="https://www.openstreetmap.org/copyright"
        accessibilityRole="link"
        style={{ paddingVertical: space.md, minHeight: 44 }}
      >
        <AppText variant="caption" tone="muted">
          Ubicaciones: © OpenStreetMap contributors
        </AppText>
      </Link>
      <Button
        secondary
        label="Explorar el mapa"
        onPress={() => router.navigate("/")}
      />
    </Screen>
  );
}
