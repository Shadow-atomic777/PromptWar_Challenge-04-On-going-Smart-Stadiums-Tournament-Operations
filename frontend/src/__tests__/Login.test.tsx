import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

// Mock the AuthContext
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      login: vi.fn().mockResolvedValue(true),
      signup: vi.fn().mockResolvedValue(true),
      user: null
    })
  };
});

describe('Login Component', () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders the login form correctly', () => {
    renderLogin();
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. TKT-9912/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  it('switches to staff login when clicking Stadium Staff', () => {
    renderLogin();
    const staffBtn = screen.getByText(/Stadium Staff/i);
    fireEvent.click(staffBtn);
    expect(screen.getByPlaceholderText(/e.g. OP-8342/i)).toBeInTheDocument();
  });

  it('toggles to signup mode', () => {
    renderLogin();
    const signupBtn = screen.getByText(/Sign up/i);
    fireEvent.click(signupBtn);
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/John Doe/i)).toBeInTheDocument();
  });
});
