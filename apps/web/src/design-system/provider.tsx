"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  palette,
  spacing,
  radii,
  motion,
  typography,
  layout,
  messages,
  parsePreferences,
  resolveTheme,
  type Locale,
  type ThemeMode,
  type Theme,
} from "@aifoundry/design-system";

export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "fr";
  const navLangs = navigator.languages || [navigator.language];
  for (const lang of navLangs) {
    if (!lang) continue;
    const clean = lang.toLowerCase();
    if (clean.startsWith("en")) return "en";
    if (clean.startsWith("fr")) return "fr";
  }
  return "fr";
}

const Context = createContext({
  locale: "fr" as Locale,
  mode: "system" as ThemeMode,
  theme: "light" as Theme,
  t: messages.fr as Record<keyof typeof messages.fr, string>,
  setLocale: (_value: Locale) => {},
  setMode: (_value: ThemeMode) => {},
});
export function DesignProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("fr");
  const [mode, setMode] = useState<ThemeMode>("light");
  const [system, setSystem] = useState<Theme>("light");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aifoundry.ui-gallery");
      if (stored) {
        const p = parsePreferences(stored);
        setLocale(p.locale);
        if (p.mode === "dark") {
          setMode("dark");
        } else {
          setMode("light");
        }
      } else {
        // Détection automatique de la langue du navigateur à la 1ère visite
        const detected = detectBrowserLocale();
        setLocale(detected);
      }
    } catch {
      /* Storage may be disabled. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(
          "aifoundry.ui-gallery",
          JSON.stringify({ locale, mode }),
        );
      } catch {
        /* Preferences remain usable in memory. */
      }
      document.documentElement.lang = locale;
    }
  }, [locale, mode, ready]);
  const theme = resolveTheme(mode, system);
  const variables = Object.fromEntries([
    ...Object.entries(palette[theme]).map(([key, value]) => [
      "--" + key,
      value,
    ]),
    ...Object.entries(spacing).map(([key, value]) => [
      `--space-${key}`,
      `${value}px`,
    ]),
    ...Object.entries(radii).map(([key, value]) => [
      `--radius-${key}`,
      `${value}px`,
    ]),
    ...Object.entries(typography).flatMap(([key, value]) => [
      [`--font-${key}`, `${value[0] / 16}rem`],
      [`--line-${key}`, `${value[1] / value[0]}`],
    ]),
    ["--motion", `${motion.normal}ms`],
    ["--touch", `${layout.touch}px`],
  ]) as CSSProperties;
  return (
    <Context.Provider
      value={{ locale, mode, theme, t: messages[locale], setLocale, setMode }}
    >
      <div
        className="ds-root"
        lang={locale}
        data-theme={theme}
        style={{ ...variables, colorScheme: theme }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}
export const useDesign = () => useContext(Context);
