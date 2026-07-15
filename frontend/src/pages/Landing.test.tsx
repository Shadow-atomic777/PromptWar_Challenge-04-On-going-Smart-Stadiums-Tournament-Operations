import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from './Landing';

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', setLanguage: vi.fn(), t: (key: string) => key })
}));

vi.mock('../context/AccessibilityContext', () => ({
  useAccessibility: () => ({ fontMode: 'standard', setFontMode: vi.fn() })
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() })
}));

vi.mock('../hooks/useOpsWebSocket', () => ({
  useOpsWebSocket: () => ({ data: null })
}));

describe('Landing Page', () => {
  it('renders the hero section', () => {
    render(<BrowserRouter><Landing /></BrowserRouter>);
    expect(screen.getByText('hero_title')).toBeDefined();
    expect(screen.getByText('hero_subtitle')).toBeDefined();
  });

  it('renders navigation links', () => {
    render(<BrowserRouter><Landing /></BrowserRouter>);
    expect(screen.getByText('signin')).toBeDefined();
  });
});
