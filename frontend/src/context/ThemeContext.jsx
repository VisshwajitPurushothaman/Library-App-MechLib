import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  // default "auto" = system preference
  const [mode, setMode] = useState(() => localStorage.getItem("mechlib_theme") || "auto");

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const isDark = mode === "dark" || (mode === "auto" && mql.matches);
      root.classList.toggle("dark", isDark);
    };
    apply();
    if (mode === "auto") {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [mode]);

  const update = (next) => {
    localStorage.setItem("mechlib_theme", next);
    setMode(next);
  };

  return (
    <ThemeCtx.Provider value={{ mode, setMode: update }}>{children}</ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
