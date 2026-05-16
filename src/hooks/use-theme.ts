import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "umunity.theme";

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const initial = readTheme();
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    applyTheme(next);
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  }

  function toggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return { theme, setTheme, toggle };
}
