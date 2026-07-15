import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn(), signup: vi.fn() })
}));

describe('Login Page', () => {
  it('renders login form correctly', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    expect(screen.getByPlaceholderText('Enter your Ticket ID')).toBeDefined();
    expect(screen.getByText('Sign In')).toBeDefined();
  });

  it('updates form state on input', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    const input = screen.getByPlaceholderText('Enter your Ticket ID') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'tick-123' } });
    expect(input.value).toBe('tick-123');
  });
});
