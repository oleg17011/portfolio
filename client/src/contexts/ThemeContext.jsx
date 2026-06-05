import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

function applyThemeClass(dark) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function getInitialDark() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark')  return true;
    if (saved === 'light') return false;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

const initialDark = getInitialDark();
applyThemeClass(initialDark);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(initialDark);

  
  useEffect(() => {
    applyThemeClass(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

