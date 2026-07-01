import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type Theme = "dark" | "light";
export type Motion = "normal" | "reduced";
export type DetailLevel = "beginner" | "standard" | "advanced" | "internals";

interface AppSettings {
  theme: Theme;
  motion: Motion;
  detail: DetailLevel;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setMotion: (m: Motion) => void;
  setDetail: (d: DetailLevel) => void;
}

const SettingsContext = createContext<AppSettings | null>(null);

export const DETAIL_LEVELS: { value: DetailLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "standard", label: "Standard" },
  { value: "advanced", label: "Advanced" },
  { value: "internals", label: "Runtime Internals" },
];

function load<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T) ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — settings just won't persist */
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => load("jsrs.theme", "dark"));
  const [motion, setMotion] = useState<Motion>(() => load("jsrs.motion", "normal"));
  const [detail, setDetail] = useState<DetailLevel>(() =>
    load("jsrs.detail", "standard"),
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    save("jsrs.theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-motion",
      motion === "reduced" ? "reduced" : "",
    );
    save("jsrs.motion", motion);
  }, [motion]);

  useEffect(() => {
    save("jsrs.detail", detail);
  }, [detail]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  const value = useMemo<AppSettings>(
    () => ({ theme, motion, detail, setTheme, toggleTheme, setMotion, setDetail }),
    [theme, motion, detail, toggleTheme],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): AppSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
