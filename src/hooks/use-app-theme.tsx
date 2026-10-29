import { palette, type AppColors } from "@/src/constants/palette";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import * as SecureStore from "expo-secure-store";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type PropsWithChildren,
} from "react";
import { Platform } from "react-native";

export type ThemePreference = "system" | "light" | "dark";
const key = "appearance";
const ThemeContext = createContext<{
  colors: AppColors;
  dark: boolean;
  preference: ThemePreference;
  ready: boolean;
  setPreference: (value: ThemePreference) => Promise<void>;
} | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setValue] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const value =
          Platform.OS === "web"
            ? window.localStorage.getItem(key)
            : await SecureStore.getItemAsync(key);
        if (
          active &&
          (value === "system" || value === "light" || value === "dark")
        )
          setValue(value);
      } catch {
        /* System appearance remains available if storage is unavailable. */
      } finally {
        if (active) setReady(true);
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);
  async function setPreference(value: ThemePreference) {
    if (Platform.OS === "web") window.localStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
    setValue(value);
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
