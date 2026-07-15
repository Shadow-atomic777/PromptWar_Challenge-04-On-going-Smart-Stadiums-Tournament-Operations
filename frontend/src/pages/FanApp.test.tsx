import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FanApp from './FanApp';

// Mock contexts
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => key
  })
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'fan-test-123', role: 'fan', name: 'Test Fan', token: 'mock-jwt', sector: 'south_upper' }
  })
}));

vi.mock('../hooks/useOpsWebSocket', () => ({
  useOpsWebSocket: () => ({
    data: { stadium: { match: { current_minute: 45, home_team: 'USA', away_team: 'BRA', home_score: 1, away_score: 0 } } }
  })
}));

describe('FanApp', () => {
  it('renders the chat interface correctly', () => {
    render(
      <BrowserRouter>
        <FanApp />
      </BrowserRouter>
    );
    
    // Check if the input field renders
    expect(screen.getByPlaceholderText('placeholder')).toBeDefined();
    
    // Check if the welcome message renders
    expect(screen.getByText('welcome')).toBeDefined();
    
    // Check if the live score strip renders with mocked data
    expect(screen.getByText('USA')).toBeDefined();
    expect(screen.getByText('1 - 0')).toBeDefined();
  });

  it('updates input value on type', () => {
    render(
      <BrowserRouter>
        <FanApp />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText('placeholder') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Where is the food?' } });
    
    expect(input.value).toBe('Where is the food?');
  });
});
