import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import FanApp from '../pages/FanApp';

// Mock the WebSocket hook so it doesn't try to connect during tests
vi.mock('../hooks/useOpsWebSocket', () => ({
  useOpsWebSocket: () => ({
    data: {
      stadium: {
        match: {
          current_minute: 45,
          home_team: 'USA',
          away_team: 'BRA',
          home_score: 1,
          away_score: 0
        }
      }
    }
  })
}));

// Mock the global fetch API to simulate the Gemini AI response
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ 
      message: 'Here is the fastest route to the restrooms.',
      agents_used: ['route_planner'],
      suggestions: ['Show me food options']
    })
  })
) as unknown as typeof fetch;

describe('FanApp Component', () => {
  const renderFanApp = () => {
    return render(
      <BrowserRouter>
        <FanApp />
      </BrowserRouter>
    );
  };

  it('renders the initial AI greeting', () => {
    renderFanApp();
    expect(screen.getByText(/Welcome to OmniStadium/i)).toBeInTheDocument();
  });

  it('renders the live match score from the websocket mock', () => {
    renderFanApp();
    expect(screen.getByText(/USA/i)).toBeInTheDocument();
    expect(screen.getByText(/1 - 0/i)).toBeInTheDocument();
  });

  it('allows the fan to send a message and displays the AI response', async () => {
    renderFanApp();
    
    // Find input and type
    const input = screen.getByPlaceholderText(/Ask your stadium assistant/i);
    fireEvent.change(input, { target: { value: 'Where is the restroom?' } });
    
    // Click send
    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    fireEvent.click(sendBtn);
    
    // Verify user message appears instantly
    expect(screen.getByText('Where is the restroom?')).toBeInTheDocument();
    
    // Wait for the mocked fetch to resolve and the AI message to appear
    await waitFor(() => {
      expect(screen.getByText(/Here is the fastest route to the restrooms/i)).toBeInTheDocument();
    });
  });
});
