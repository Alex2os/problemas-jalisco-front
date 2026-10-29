import { palette, type AppColors } from "@/src/constants/palette";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

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
  const [preference, setValue] = useState<ThemePreference>("system");
  const ready = true;
  async function setPreference(value: ThemePreference) {
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
