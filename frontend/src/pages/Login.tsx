import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ShieldAlert, Hash, Map, Smartphone } from 'lucide-react';
import AnimatedFootball from '../components/AnimatedFootball';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'staff' | 'fan'>('fan');
  
  const [name, setName] = useState('');
  const [idValue, setIdValue] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (isLogin) {
      const success = await login(userType, idValue, password);
      if (success) {
        navigate(userType === 'staff' ? '/ops' : '/fan');
      } else {
        setError(`Invalid ${userType === 'staff' ? 'Staff ID' : 'Ticket ID'} or Password`);
        setLoading(false);
      }
    } else {
      if (!name || !idValue || !password) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }
      const success = await signup(userType, idValue, password, name);
      if (success) {
        navigate(userType === 'staff' ? '/ops' : '/fan');
      } else {
        setError('Registration failed. ID might already exist.');
        setLoading(false);
      }
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      <section className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <AnimatedFootball size={50} />
        </div>
        
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Access the OmniStadium ecosystem.
        </p>

        {/* User Type Toggle */}
        <div style={{ display: 'flex', width: '100%', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '4px', marginBottom: '2rem' }}>
          <button 
            type="button"
            onClick={() => { setUserType('fan'); setError(''); }}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.3s', cursor: 'pointer',
              background: userType === 'fan' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: userType === 'fan' ? 'white' : 'var(--text-muted)'
            }}
          >
            <Smartphone size={16} /> Fan Access
          </button>
          <button 
            type="button"
            onClick={() => { setUserType('staff'); setError(''); }}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.3s', cursor: 'pointer',
              background: userType === 'staff' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: userType === 'staff' ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            <Map size={16} /> Stadium Staff
          </button>
        </div>

        {error && (
          <div aria-live="assertive" style={{ width: '100%', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <ShieldAlert size={16} aria-hidden="true" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="fullName" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="fullName"
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'rgba(128,128,128,0.1)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border 0.2s' }}
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="idValue" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {userType === 'staff' ? 'Staff ID' : 'Ticket ID'}
            </label>
            <div style={{ position: 'relative' }}>
              <Hash size={18} aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="idValue"
                type="text" 
                value={idValue}
                onChange={e => setIdValue(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'rgba(128,128,128,0.1)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border 0.2s' }}
                placeholder={userType === 'staff' ? "e.g. OP-8342" : "e.g. TKT-9912"}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'rgba(128,128,128,0.1)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', transition: 'border 0.2s' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (isLogin ? (userType === 'staff' ? 'Enter Command Center' : 'Open Fan App') : 'Register')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

      </section>
    </main>
  );
}
