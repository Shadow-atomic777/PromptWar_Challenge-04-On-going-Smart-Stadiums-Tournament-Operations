import { Map, Smartphone, ChevronRight, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOpsWebSocket } from '../hooks/useOpsWebSocket';
import AnimatedFootball from '../components/AnimatedFootball';

export default function Landing() {
  const { data: wsData } = useOpsWebSocket();
  const match = wsData?.stadium?.match;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AnimatedFootball size={36} />
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', marginLeft: '0.25rem' }}>
              OMNI<span style={{ color: 'var(--primary)' }}>STADIUM</span>
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {match && (
              <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%' }} className="animate-pulse-glow" />
                {match.phase.replace('_', ' ')} • {match.current_minute}'
              </div>
            )}
            
            <Link to="/login" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '99px', fontSize: '0.875rem' }}>
              Sign In
            </Link>
          </div>

        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 2rem' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem auto', position: 'relative' }} className="animate-fade-in">
          
          <h1 className="text-gradient" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', marginTop: '1rem' }}>
            The Future of Stadium Intelligence.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            A unified AI platform for the FIFA World Cup 2026™. Seamlessly connecting operations teams with autonomous fan experiences.
          </p>
        </div>

        {/* Live Match Widget */}
        {match && (
          <div className="animate-fade-in delay-100" style={{ maxWidth: '600px', margin: '0 auto 4rem auto', width: '100%' }}>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>{match.home_team}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Home</div>
              </div>
              
              <div style={{ padding: '0 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-main)', lineHeight: 1 }}>
                  {match.home_score} <span style={{ color: 'var(--border)' }}>-</span> {match.away_score}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.75rem', letterSpacing: '2px' }}>
                  Live Match
                </div>
              </div>

              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>{match.away_team}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Away</div>
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
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Command Center</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, marginBottom: '2.5rem' }}>
              Real-time crowd heatmaps, autonomous emergency routing, and complete operational oversight.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              Launch Dashboard <ChevronRight size={16} />
            </div>
          </Link>

          <Link to="/fan" className="premium-card animate-fade-in delay-300" style={{ padding: '2.5rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px', width: 'fit-content', marginBottom: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <Smartphone size={28} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Fan Experience</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, marginBottom: '2.5rem' }}>
              Intelligent mobile companion for navigation, dynamic food queues, and instant stadium assistance.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem' }}>
              Open Fan App <ChevronRight size={16} />
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
