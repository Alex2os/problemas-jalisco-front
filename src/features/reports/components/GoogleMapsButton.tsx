import { useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "@/components/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { googleMapsUrl } from "@/services/report-format";
import type { Report } from "@/services/types";

export function GoogleMapsButton({ report }: { report: Pick<Report, "latitude" | "longitude"> }) {
  const { colors } = useAppTheme();
  const pending = useRef(false);
  const [opening, setOpening] = useState(false);

  async function openMap() {
    if (pending.current) return;
    pending.current = true;
    setOpening(true);
    try {
      await Linking.openURL(googleMapsUrl(report.latitude, report.longitude));
    } catch {
      Alert.alert("No se pudo abrir Google Maps", "Intenta de nuevo. Comprueba que puedas abrir enlaces en tu dispositivo.");
    } finally {
      pending.current = false;
      setOpening(false);
    }
  }

  return <Button
    title="Abrir en Google Maps"
    accessibilityLabel="Abrir ubicación del reporte en Google Maps"
    variant="outline"
    size="sm"
    fullWidth
    disabled={opening}
    icon={<Ionicons name="open-outline" size={18} color={opening ? colors.muted : colors.text} />}
    onPress={() => { void openMap(); }}
  />;
}
