/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

// Guards environments (older browsers, some test runners) without matchMedia.
const prefersDarkScheme = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;

export function ThemeProvider({ children }) {
  // State can be 'light', 'dark', or 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('appTheme') ?? 'system';
  });

  const getEffectiveTheme = (currentTheme) => {
    if (currentTheme === 'system') {
      return prefersDarkScheme() ? 'dark' : 'light';
    }
    return currentTheme;
  };

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(theme);
    document.documentElement.dataset.theme = effectiveTheme;
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes if we are in 'system' mode
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e) => {
      if (theme === 'system') {
        const effectiveTheme = e.matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = effectiveTheme;
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'light';
      // If current is 'system', we switch to light or dark based on system preference
      return getEffectiveTheme('system') === 'light' ? 'dark' : 'light';
    });
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    effectiveTheme: getEffectiveTheme(theme),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

const fallbackThemeContext = {
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  effectiveTheme: 'light',
};

export function useTheme() {
  // Falls back gracefully (like ToastContext) instead of throwing, so
  // components rendered in isolation (e.g. tests) don't crash.
  return useContext(ThemeContext) ?? fallbackThemeContext;
}
