/**
 * Theme Manager
 * Handles theme switching including system theme detection
 */

import { log } from './logger';

export type BaseTheme = 'dark' | 'light' | 'system';

/**
 * Detect system theme preference
 */
export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: 'dark' | 'light'): void {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
  
  log.info('[ThemeManager] Applied theme:', theme);
}

/**
 * Resolve base theme to actual theme
 */
export function resolveTheme(baseTheme: BaseTheme): 'dark' | 'light' {
  if (baseTheme === 'system') {
    return getSystemTheme();
  }
  return baseTheme;
}

/**
 * Initialize theme manager
 */
export function initializeThemeManager(baseTheme: BaseTheme): () => void {
  // Apply initial theme
  const actualTheme = resolveTheme(baseTheme);
  applyTheme(actualTheme);

  // Listen to system theme changes if using system theme
  if (baseTheme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      applyTheme(newTheme);
      log.info('[ThemeManager] System theme changed to:', newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Return cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }

  // Return empty cleanup if not using system theme
  return () => {};
}

/**
 * Update theme
 */
export function updateTheme(baseTheme: BaseTheme): void {
  const actualTheme = resolveTheme(baseTheme);
  applyTheme(actualTheme);
}
