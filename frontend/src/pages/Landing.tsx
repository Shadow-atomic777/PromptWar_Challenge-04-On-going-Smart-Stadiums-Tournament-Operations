import { Map, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem' }}>
      <div className="text-center animate-fade-in">
        <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          OmniStadium
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Multi-Agent AI Stadium Operations Center. Select your portal to enter the experience.
        </p>
      </div>

      <div className="grid-cols-2 gap-xl" style={{ marginTop: '2rem' }}>
        <Link to="/ops" className="glass-panel p-xl animate-fade-in" style={{ textDecoration: 'none', animationDelay: '0.1s' }}>
          <div className="flex-center" style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Map size={32} />
          </div>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Operations Dashboard</h2>
          <p className="text-muted">Live heatmap, agent timeline, and emergency simulation for stadium staff.</p>
        </Link>

        <Link to="/fan" className="glass-panel p-xl animate-fade-in" style={{ textDecoration: 'none', animationDelay: '0.2s' }}>
          <div className="flex-center" style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)', marginBottom: '1rem' }}>
            <MessageSquare size={32} />
          </div>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Fan App</h2>
          <p className="text-muted">Mobile-first AI assistant for personalized navigation, food, and restroom queues.</p>
        </Link>
      </div>
    </div>
  );
}
