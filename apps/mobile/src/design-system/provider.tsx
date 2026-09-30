import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  palette,
  messages,
  parsePreferences,
  resolveTheme,
  type Locale,
  type ThemeMode,
} from "@aifoundry/design-system";
function usePreferences() {
  const system = useColorScheme() === "dark" ? "dark" : "light";
  const [mode, setMode] = useState<ThemeMode>("system");
  const [locale, setLocale] = useState<Locale>("fr");
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem("aifoundry.ui-gallery.v1")
      .then((value) => {
        if (active) {
          const p = parsePreferences(value);
          setMode(p.mode);
          setLocale(p.locale);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (active) setReducedMotion(v);
      })
      .catch(() => {
        /* Preference unavailable: keep the safe default. */
      });
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    return () => {
      active = false;
      listener.remove();
    };
  }, []);
  useEffect(() => {
    if (ready)
      void AsyncStorage.setItem(
        "aifoundry.ui-gallery.v1",
        JSON.stringify({ locale, mode }),
      ).catch(() => {});
  }, [locale, mode, ready]);
  const theme = resolveTheme(mode, system);
  return {
    locale,
    mode,
    setLocale,
    setMode,
    theme,
    colors: palette[theme],
    t: messages[locale],
    ready,
    reducedMotion,
  };
}
const Context = createContext<ReturnType<typeof usePreferences> | null>(null);
export function DesignProvider({ children }: { children: ReactNode }) {
  const value = usePreferences();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useDesign() {
  const value = useContext(Context);
  if (!value) throw new Error("DesignProvider required");
  return value;
}
