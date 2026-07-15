import { Link, useNavigate } from 'react-router-dom';
import { Activity, Users, Clock, AlertTriangle, CloudRain, ArrowLeft, LogOut } from 'lucide-react';
import { useOpsWebSocket } from '../hooks/useOpsWebSocket';
import { useAuth } from '../context/AuthContext';

export default function OpsDashboard() {
  const { data, status } = useOpsWebSocket();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSimulateEmergency = async () => {
    try {
      const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:8000';
      await fetch(`${baseUrl}/api/ops/emergency/simulate?sector=north_lower`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <header className="flex-between" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={handleLogout} className="btn btn-secondary" aria-label="Log out of Command Center" style={{ padding: '0.5rem', background: 'rgba(128,128,128,0.1)', color: 'var(--text-main)' }}>
            <LogOut size={20} aria-hidden="true" />
          </button>
          <h1 className="text-gradient" style={{ fontSize: '2rem', margin: 0 }}>OmniStadium Command Center</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="badge" aria-live="polite" style={{ 
            background: status === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: status === 'connected' ? 'var(--success)' : 'var(--danger)',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <div style={{ 
              width: '8px', height: '8px', borderRadius: '50%', 
              background: status === 'connected' ? 'var(--success)' : 'var(--danger)' 
            }} className={status === 'connected' ? 'animate-pulse-glow' : ''} aria-hidden="true" />
            <span className="sr-only">Connection Status:</span> {status.toUpperCase()}
          </div>
          
          <button className="btn btn-primary" aria-label="Simulate an emergency incident" style={{ background: 'var(--danger)' }} onClick={handleSimulateEmergency}>
            <AlertTriangle size={18} aria-hidden="true" /> Simulate Emergency
          </button>
        </div>
      </header>
      
      <main>

      {!data ? (
        <div className="flex-center glass-panel" style={{ height: '60vh', flexDirection: 'column', gap: '1rem' }}>
          <Activity size={48} className="text-primary animate-pulse-glow" />
          <h2>Waiting for simulation data...</h2>
          <p className="text-muted">Ensure the Python backend is running on port 8000.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Top KPIs */}
            <div className="grid-cols-3 gap-lg">
              <div className="glass-panel p-lg animate-fade-in">
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <span className="text-muted" style={{ fontWeight: 600 }}>Total Attendance</span>
                  <Users className="text-primary" size={24} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                  {data.crowd.total_attendance.toLocaleString()}
                </div>
                <div className="text-success" style={{ fontSize: '0.875rem' }}>
                  {data.crowd.overall_density}% capacity
                </div>
              </div>

              <div className="glass-panel p-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <span className="text-muted" style={{ fontWeight: 600 }}>Avg Queue Wait</span>
                  <Clock className="text-warning" size={24} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                  {data.queues.average_wait_minutes} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>min</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Busiest: {data.queues.busiest_queue}
                </div>
              </div>

              <div className="glass-panel p-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <span className="text-muted" style={{ fontWeight: 600 }}>Active Incidents</span>
                  <AlertTriangle className={data.medical.total_active > 0 ? "text-danger" : "text-success"} size={24} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                  {data.medical.total_active}
                </div>
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                  {data.medical.total_resolved_today} resolved today
                </div>
              </div>
            </div>

            {/* Stadium Map / Crowd Heatmap Placeholder */}
            <div className="glass-panel p-xl animate-fade-in" style={{ animationDelay: '0.3s', minHeight: '400px' }}>
              <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <h2>Live Crowd Heatmap</h2>
                <div className="badge bg-success-subtle">{data.stadium.match.phase.replace('_', ' ').toUpperCase()}</div>
              </div>
              
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', 
                padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'
              }}>
                {data.crowd.sectors.map((sector: any) => (
                  <div key={sector.sector_id} style={{
                    background: sector.density_percentage > 90 ? 'rgba(239,68,68,0.2)' : 
                                sector.density_percentage > 75 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${sector.density_percentage > 90 ? 'var(--danger)' : 'var(--border)'}`,
                    padding: '1rem', borderRadius: 'var(--radius-sm)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{sector.sector_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>{sector.current_count} / {sector.capacity}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: sector.density_percentage > 90 ? 'var(--danger)' : 'white' }}>
                      {sector.density_percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Match Info */}
            <div className="glass-panel p-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} className="text-primary" /> Live Match
              </h3>
              <div className="flex-center" style={{ flexDirection: 'column', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>{data.stadium.match.competition}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '2px' }}>
                  {data.stadium.match.home_team} {data.stadium.match.home_score} - {data.stadium.match.away_score} {data.stadium.match.away_team}
                </div>
                <div className="text-primary" style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                  {data.stadium.match.current_minute}'
                </div>
              </div>
            </div>

            {/* Weather */}
            <div className="glass-panel p-lg animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CloudRain size={18} className="text-accent" /> Weather & Environment
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>Temp</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.weather.temperature_celsius}°C</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>Condition</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'capitalize' }}>{data.weather.condition}</div>
                </div>
              </div>
              {data.weather.alerts.map((alert: any, i: number) => (
                <div key={i} className="bg-warning-subtle" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '1rem', fontSize: '0.875rem' }}>
                  <strong>{alert.alert_type}</strong>: {alert.message}
                </div>
              ))}
            </div>

            {/* AI Agent Feed */}
            <div className="glass-panel p-lg animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} className="text-success" /> AI Agent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.medical.active_incidents.map((inc: any) => (
                  <div key={inc.incident_id} style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid var(--danger)', padding: '0.75rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, marginBottom: '0.25rem' }}>[Safety Agent] Active</div>
                    <div style={{ fontSize: '0.875rem' }}>{inc.description}</div>
                  </div>
                ))}
                {data.stadium.announcements.map((ann: string, i: number) => (
                  <div key={i} style={{ background: 'rgba(59,130,246,0.1)', borderLeft: '3px solid var(--primary)', padding: '0.75rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>[Comms Agent] Broadcast</div>
                    <div style={{ fontSize: '0.875rem' }}>{ann}</div>
                  </div>
                ))}
                {data.medical.total_active === 0 && data.stadium.announcements.length === 0 && (
                  <div className="text-muted text-center" style={{ padding: '2rem 0' }}>No active agent interventions.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
      </main>
    </div>
  );
}
