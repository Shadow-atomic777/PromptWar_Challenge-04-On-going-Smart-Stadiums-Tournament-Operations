import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontMode = 'standard' | 'dyslexic' | 'children' | 'elderly';

interface AccessibilityContextType {
  fontMode: FontMode;
  setFontMode: (mode: FontMode) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontMode, setFontMode] = useState<FontMode>('standard');

  useEffect(() => {
    const root = document.documentElement;
    
    // Reset defaults
    root.style.setProperty('--global-font', '"Inter", system-ui, sans-serif');
    root.style.setProperty('--global-header-font', '"Outfit", sans-serif');
    root.style.fontSize = '16px';
    root.style.letterSpacing = 'normal';
    root.style.lineHeight = '1.5';

    if (fontMode === 'dyslexic') {
      // Dyslexic friendly: heavy bottoms, unique character shapes, wider tracking
      root.style.setProperty('--global-font', '"Comic Sans MS", "OpenDyslexic", sans-serif');
      root.style.setProperty('--global-header-font', '"Comic Sans MS", "OpenDyslexic", sans-serif');
      root.style.letterSpacing = '0.075em';
      root.style.lineHeight = '1.6';
    } else if (fontMode === 'children') {
      // Children friendly: rounded, playful, slightly larger
      root.style.setProperty('--global-font', '"Comic Sans MS", "Chalkboard SE", sans-serif');
      root.style.setProperty('--global-header-font', '"Comic Sans MS", "Chalkboard SE", sans-serif');
      root.style.fontSize = '18px';
    } else if (fontMode === 'elderly') {
      // Elderly friendly: High legibility, large size, high contrast spacing
      root.style.setProperty('--global-font', 'Verdana, Arial, sans-serif');
      root.style.setProperty('--global-header-font', 'Verdana, Arial, sans-serif');
      root.style.fontSize = '20px';
      root.style.lineHeight = '1.8';
      root.style.letterSpacing = '0.02em';
    }
  }, [fontMode]);

  return (
    <AccessibilityContext.Provider value={{ fontMode, setFontMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
