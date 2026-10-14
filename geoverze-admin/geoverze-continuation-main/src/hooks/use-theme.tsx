import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "gvrze-admin-theme";
const LEGACY_STORAGE_KEY = "geoverze-admin-theme";

function readStoredTheme(): Theme | null {
  try {
    const next = window.localStorage.getItem(STORAGE_KEY);
    if (next === "light" || next === "dark") return next;
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === "light" || legacy === "dark") {
      window.localStorage.setItem(STORAGE_KEY, legacy);
      return legacy;
    }
  } catch {
    return null;
  }
  return null;
}

function writeStoredTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Theme still applies in-memory if storage is blocked.
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      writeStoredTheme(next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}
