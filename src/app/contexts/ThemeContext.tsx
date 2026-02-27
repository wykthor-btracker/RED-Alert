"use client";

import { ConfigProvider, Switch, theme } from "antd";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "soundboard-theme";

type ThemeContextValue = {
  isDark: boolean;
  setDark: (dark: boolean) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsDark(stored === "dark");
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [mounted, isDark]);

  const setDark = useCallback((dark: boolean) => setIsDark(dark), []);
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  const value: ThemeContextValue = { isDark, setDark, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <Switch
      checked={isDark}
      onChange={toggleTheme}
      checkedChildren="Escuro"
      unCheckedChildren="Claro"
      title={isDark ? "Modo escuro" : "Modo claro"}
    />
  );
}
