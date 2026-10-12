import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { LightColors, DarkColors, ThemeColors } from '../theme/colors';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'milkledger_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') return saved;
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, newMode);
      }
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const isDark = mode === 'dark';
  const colors = useMemo(() => (isDark ? DarkColors : LightColors), [isDark]);

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      mode: 'light',
      isDark: false,
      colors: LightColors,
      toggleTheme: () => {},
      setMode: () => {},
    };
  }
  return context;
};
