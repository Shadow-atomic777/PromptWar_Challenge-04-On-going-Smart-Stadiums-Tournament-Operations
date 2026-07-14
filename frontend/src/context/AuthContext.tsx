import React, { createContext, useContext, useState } from 'react';

type User = {
  id: string;
  role: 'ops' | 'admin' | 'fan';
  name: string;
} | null;

interface AuthContextType {
  user: User;
  login: (userType: 'staff' | 'fan', idValue: string, pass: string) => Promise<boolean>;
  signup: (userType: 'staff' | 'fan', idValue: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('omnistadium_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (userType: 'staff' | 'fan', idValue: string, pass: string) => {
    try {
      const url = `http://localhost:8000/api/auth/${userType}/login`;
      const body = userType === 'staff' ? { staff_id: idValue, password: pass } : { ticket_id: idValue, password: pass };
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) return false;
      const data = await res.json();
      
      const newUser = { id: data.staff_id || data.ticket_id, role: data.role, name: data.name };
      setUser(newUser);
      localStorage.setItem('omnistadium_auth', JSON.stringify(newUser));
      return true;
    } catch (e) {
      console.error("Login Error:", e);
      return false;
    }
  };

  const signup = async (userType: 'staff' | 'fan', idValue: string, pass: string, name: string) => {
    try {
      const url = `http://localhost:8000/api/auth/${userType}/signup`;
      const body = userType === 'staff' ? { staff_id: idValue, password: pass, name } : { ticket_id: idValue, password: pass, name };
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) return false;
      const data = await res.json();
      
      const newUser = { id: data.staff_id || data.ticket_id, role: data.role, name: data.name };
      setUser(newUser);
      localStorage.setItem('omnistadium_auth', JSON.stringify(newUser));
      return true;
    } catch (e) {
      console.error("Signup Error:", e);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('omnistadium_auth');
  };

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
