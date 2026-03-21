import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'a3note-theme';
const DEFAULT_THEME: Theme = 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load theme from localStorage or use default
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as Theme) || DEFAULT_THEME;
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save theme to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}
