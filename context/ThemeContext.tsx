'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeContextType = {
  themeColor: string;
  setThemeColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState('#696969');

  // Load theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('themeColor');
    if (saved) setThemeColorState(saved);
  }, []);

  // Apply theme globally when changed
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);

    const isLight = themeColor === '#F1F3E0';
    const textColor = isLight ? '#000000' : '#ffffff';
    document.documentElement.style.setProperty('--theme-text', textColor);

    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { themeColor: '#696969', setThemeColor: () => {} };
  return ctx;
}
