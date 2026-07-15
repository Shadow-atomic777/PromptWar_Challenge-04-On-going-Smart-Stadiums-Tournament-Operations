import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'dark' | 'light' | 'warm' | 'cool';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-dark', '#030712');
      root.style.setProperty('--bg-panel', 'rgba(17, 24, 39, 0.6)');
      root.style.setProperty('--bg-panel-hover', 'rgba(31, 41, 55, 0.8)');
      root.style.setProperty('--text-main', '#f9fafb');
      root.style.setProperty('--text-muted', '#9ca3af');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--border-focus', 'rgba(255, 255, 255, 0.15)');
    } else if (theme === 'light') {
      root.style.setProperty('--bg-dark', '#f8fafc');
      root.style.setProperty('--bg-panel', 'rgba(255, 255, 255, 0.6)');
      root.style.setProperty('--bg-panel-hover', 'rgba(241, 245, 249, 0.8)');
      root.style.setProperty('--text-main', '#0f172a');
      root.style.setProperty('--text-muted', '#475569');
      root.style.setProperty('--border', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--border-focus', 'rgba(0, 0, 0, 0.15)');
    } else if (theme === 'warm') {
      root.style.setProperty('--bg-dark', '#fffbeb');
      root.style.setProperty('--bg-panel', 'rgba(254, 243, 199, 0.6)');
      root.style.setProperty('--bg-panel-hover', 'rgba(253, 230, 138, 0.8)');
      root.style.setProperty('--text-main', '#451a03');
      root.style.setProperty('--text-muted', '#78350f');
      root.style.setProperty('--border', 'rgba(113, 63, 18, 0.1)');
      root.style.setProperty('--border-focus', 'rgba(113, 63, 18, 0.2)');
    } else if (theme === 'cool') {
      root.style.setProperty('--bg-dark', '#f0f9ff');
      root.style.setProperty('--bg-panel', 'rgba(224, 242, 254, 0.6)');
      root.style.setProperty('--bg-panel-hover', 'rgba(186, 230, 253, 0.8)');
      root.style.setProperty('--text-main', '#082f49');
      root.style.setProperty('--text-muted', '#0369a1');
      root.style.setProperty('--border', 'rgba(12, 74, 110, 0.1)');
      root.style.setProperty('--border-focus', 'rgba(12, 74, 110, 0.2)');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
