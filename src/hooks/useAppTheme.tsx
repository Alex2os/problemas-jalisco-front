import { palette, type AppColors } from "@/constants/palette";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type PropsWithChildren,
} from "react";

const THEME_STORAGE_KEY = "@problemas_jalisco_theme_preference";

export type ThemePreference = "system" | "light" | "dark";
const ThemeContext = createContext<{
  colors: AppColors;
  dark: boolean;
  preference: ThemePreference;
  ready: boolean;
  setPreference: (value: ThemePreference) => Promise<void>;
} | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setValue] = useState<ThemePreference>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (active && (saved === "system" || saved === "light" || saved === "dark"))
          setValue(saved);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function setPreference(value: ThemePreference) {
    setValue(value);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      // The choice still applies for this session.
    }
  }
  const dark =
    preference === "system" ? system === "dark" : preference === "dark";
  return (
    <ThemeContext.Provider
      value={{
        colors: palette[dark ? "dark" : "light"],
        dark,
        preference,
        ready,
        setPreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);
  if (!theme)
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  return theme;
}
