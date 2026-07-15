import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OpsDashboard from './OpsDashboard';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'ops', name: 'Ops Agent' }, logout: vi.fn() })
}));

vi.mock('../hooks/useOpsWebSocket', () => ({
  useOpsWebSocket: () => ({ data: { stadium: { status: 'operational' }, incidents: [], metrics: { crowd_density: 45, fan_satisfaction: 92, active_staff: 120, unresolved_incidents: 0 } } })
}));

describe('OpsDashboard Page', () => {
  it('renders the command center metrics', () => {
    render(<BrowserRouter><OpsDashboard /></BrowserRouter>);
    expect(screen.getByText('Active Security Staff')).toBeDefined();
    expect(screen.getByText('120')).toBeDefined();
  });
});
