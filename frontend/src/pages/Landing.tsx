import { Map, Smartphone, ChevronRight, Globe, Type, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOpsWebSocket } from '../hooks/useOpsWebSocket';
import AnimatedFootball from '../components/AnimatedFootball';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const { data: wsData } = useOpsWebSocket();
  const match = wsData?.stadium?.match;
  const { language, setLanguage, t } = useLanguage();
  const { fontMode, setFontMode } = useAccessibility();
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header>
        <nav style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--border)' }} aria-label="Main Navigation">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} aria-hidden="true">
              <AnimatedFootball size={36} />
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', marginLeft: '0.25rem' }}>
                OMNI<span style={{ color: 'var(--primary)' }}>STADIUM</span>
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              
              {/* Accessibility Font Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(128,128,128,0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <Type size={14} color="var(--text-muted)" />
                <select 
                  aria-label="Select Accessibility Font"
                  value={fontMode}
                  onChange={(e) => setFontMode(e.target.value as 'standard' | 'dyslexic' | 'children' | 'elderly')}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-main)',
                    border: 'none', padding: '6px', outline: 'none',
                    fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  <option value="standard">Standard Font</option>
                  <option value="dyslexic">Dyslexia Friendly</option>
                  <option value="children">Child Friendly</option>
                  <option value="elderly">Elderly (Large Text)</option>
                </select>
              </div>

              {match && (
                <div className="animate-fade-in" aria-live="polite" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%' }} className="animate-pulse-glow" aria-hidden="true" />
                  <span className="sr-only">Live Match Phase:</span> {match.phase.replace('_', ' ')} • <span className="sr-only">Minute:</span> {match.current_minute}'
                </div>
              )}
              
              {/* Language Toggle Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(128,128,128,0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <Globe size={14} color="var(--text-muted)" />
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'fr' | 'ar' | 'pt' | 'de' | 'ja')}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-main)',
                    border: 'none', padding: '6px', outline: 'none',
                    fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase'
                  }}
                >
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                  <option value="fr">FR</option>
                  <option value="ar">AR</option>
                  <option value="pt">PT</option>
                  <option value="de">DE</option>
                  <option value="ja">JA</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(128,128,128,0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <Palette size={14} color="var(--text-muted)" />
                <select 
                  aria-label="Select Visual Theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'warm' | 'cool')}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-main)',
                    border: 'none', padding: '6px', outline: 'none',
                    fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                  <option value="warm">Warm Mode</option>
                  <option value="cool">Cool Mode</option>
                </select>
              </div>

              <Link to="/login" className="btn" aria-label="Sign In to OmniStadium" style={{ background: 'rgba(128,128,128,0.1)', color: 'var(--text-main)', padding: '0.5rem 1.25rem', borderRadius: '99px', fontSize: '0.875rem', border: '1px solid var(--border)' }}>
                {t('signin')}
              </Link>
            </div>

          </div>
        </nav>
      </header>
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem auto', position: 'relative' }} className="animate-fade-in">
          
          <h1 className="text-gradient" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', marginTop: '1rem' }}>
            {t('hero_title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            {t('hero_subtitle')}
          </p>
        </div>

        {/* Live Match Widget */}
        {match && (
          <div className="animate-fade-in delay-100" style={{ maxWidth: '600px', margin: '0 auto 4rem auto', width: '100%' }}>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>{match.home_team}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>{t('home_team')}</div>
              </div>
              
              <div style={{ padding: '0 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-main)', lineHeight: 1 }}>
                  {match.home_score} <span style={{ color: 'var(--border)' }}>-</span> {match.away_score}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.75rem', letterSpacing: '2px' }}>
                  {t('live_match')}
                </div>
              </div>

              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>{match.away_team}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>{t('away_team')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Portal Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          
          <Link to="/ops" className="premium-card animate-fade-in delay-200" style={{ padding: '2.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Map size={28} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>{t('ops_title')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, marginBottom: '2.5rem' }}>
              {t('ops_desc')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              {t('ops_link')} <ChevronRight size={16} />
            </div>
          </Link>

          <Link to="/fan" className="premium-card animate-fade-in delay-300" style={{ padding: '2.5rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <Smartphone size={28} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>{t('fan_title')}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, marginBottom: '2.5rem' }}>
              {t('fan_desc')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem' }}>
              {t('fan_link')} <ChevronRight size={16} />
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
