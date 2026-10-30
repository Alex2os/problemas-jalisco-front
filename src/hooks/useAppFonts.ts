import * as Font from "expo-font";
import { useEffect, useState } from "react";
import { FontFamily } from "@/constants/theme";

/**
 * Mapeo de archivos reales de fuentes en assets/fonts/ a nombres de familia Expo/React Native.
 * - Nunito: Títulos, encabezados y botones.
 * - Inter: Textos principales, etiquetas, subtítulos y controles.
 */
export const customFonts: Record<string, Font.FontSource> = {
  // Nunito
  [FontFamily.nunito.semiBold]: require("../../assets/fonts/Nunito-SemiBold.ttf"),
  [FontFamily.nunito.bold]: require("../../assets/fonts/Nunito-Bold.ttf"),
  [FontFamily.nunito.extraBold]: require("../../assets/fonts/Nunito-ExtraBold.ttf"),

  // Inter
  [FontFamily.inter.regular]: require("../../assets/fonts/Inter_18pt-Regular.ttf"),
  [FontFamily.inter.medium]: require("../../assets/fonts/Inter_18pt-Medium.ttf"),
  [FontFamily.inter.semiBold]: require("../../assets/fonts/Inter_18pt-SemiBold.ttf"),
  [FontFamily.inter.bold]: require("../../assets/fonts/Inter_18pt-Bold.ttf"),

  // Alias universales compatibles con web y React Native ('Nunito' e 'Inter' directos)
  Nunito: require("../../assets/fonts/Nunito-Bold.ttf"),
  Inter: require("../../assets/fonts/Inter_18pt-Regular.ttf"),
};

export function useAppFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        await Font.loadAsync(customFonts);
        if (isMounted) {
          setFontsLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          // Degradar a true en caso de fallo para que la app no quede bloqueada
          setFontsLoaded(true);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { fontsLoaded, error };
}
