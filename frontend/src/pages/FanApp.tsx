import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, MapPin, Trophy, Navigation, Coffee, Activity } from 'lucide-react';
import { useOpsWebSocket } from '../hooks/useOpsWebSocket';

interface Message {
  id: string;
  sender: 'fan' | 'ai';
  text: string;
  timestamp: string;
  agents_used?: string[];
  suggestions?: string[];
}

export default function FanApp() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'msg-1',
    sender: 'ai',
    text: "👋 Welcome to OmniStadium! I'm your AI matchday assistant. Ask me to find the shortest food queues, navigate to your seat, or check the weather!",
    timestamp: new Date().toISOString(),
    suggestions: ["Where is the nearest hotdog stand?", "Find me a restroom", "Match details"]
  }]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: wsData } = useOpsWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'fan',
      text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat/fan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, fan_id: "fan-123", sector: "north_lower" })
      });
      const data = await res.json();
      
      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: data.message,
        timestamp: new Date().toISOString(),
        agents_used: data.agents_used,
        suggestions: data.suggestions
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now() + 2}`,
        sender: 'ai',
        text: "Sorry, I lost connection to the stadium network.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const pitchPattern = "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v40H0V0zm20 0h20v40H20V0z' fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E\")";

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', boxShadow: '0 0 50px rgba(0,0,0,0.5)', position: 'relative' }}>
      
      {/* Dynamic Stadium Background for Chat */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: pitchPattern, backgroundSize: '40px 40px', opacity: 0.8, pointerEvents: 'none' }} />

      {/* Header - Styled like a Match Ticket / Scoreboard */}
      <header className="glass-panel" style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)', borderRadius: 0, position: 'relative', zIndex: 10, background: 'linear-gradient(180deg, rgba(3, 7, 18, 0.95) 0%, rgba(17, 24, 39, 0.8) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <Link to="/" style={{ color: 'var(--text-main)', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </Link>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Fan Assistant <Sparkles size={16} color="var(--primary)" />
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
              <MapPin size={12} color="var(--success)" /> Seat: North Lower, Row B
            </div>
          </div>
        </div>

        {/* Live Score Strip inside Header */}
        {wsData?.stadium?.match && (
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%' }} className="animate-pulse-glow" />
              {wsData.stadium.match.current_minute}'
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'Outfit' }}>
              <span>{wsData.stadium.match.home_team}</span>
              <span style={{ background: 'white', color: 'black', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                {wsData.stadium.match.home_score} - {wsData.stadium.match.away_score}
              </span>
              <span>{wsData.stadium.match.away_team}</span>
            </div>
          </div>
        )}
      </header>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
        {messages.map((msg) => (
          <div key={msg.id} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'fan' ? 'flex-end' : 'flex-start' }}>
            
            {/* AI Avatar Label */}
            {msg.sender === 'ai' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', marginLeft: '4px' }}>
                <div style={{ background: 'var(--primary)', borderRadius: '50%', padding: '4px' }}>
                  <Trophy size={10} color="white" />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>OmniStadium AI</span>
              </div>
            )}

            {/* Bubble */}
            <div style={{
              background: msg.sender === 'fan' ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' : 'rgba(31, 41, 55, 0.85)',
              color: 'var(--text-main)',
              padding: '0.85rem 1.15rem',
              borderRadius: msg.sender === 'fan' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              maxWidth: '85%',
              border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none',
              boxShadow: msg.sender === 'fan' ? '0 4px 15px rgba(59, 130, 246, 0.3)' : '0 4px 15px rgba(0,0,0,0.2)',
              lineHeight: 1.5,
              fontSize: '0.95rem',
              backdropFilter: 'blur(10px)'
            }}>
              <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
            </div>

            {/* Agent Badges */}
            {msg.sender === 'ai' && msg.agents_used && (
              <div style={{ fontSize: '0.65rem', color: 'var(--success)', marginTop: '6px', marginLeft: '4px', display: 'flex', gap: '4px', alignItems: 'center', fontWeight: 600 }}>
                <Activity size={10} /> ROUTED VIA: {msg.agents_used.join(', ')}
              </div>
            )}

            {/* Suggestions (Quick Actions) */}
            {msg.suggestions && msg.suggestions.length > 0 && msg.id === messages[messages.length - 1].id && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {msg.suggestions.map((sug, i) => (
                  <button key={i} onClick={() => handleSend(sug)} style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', 
                    color: 'var(--text-main)', cursor: 'pointer', padding: '0.6rem 1rem', 
                    borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s',
                  }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                    {sug.toLowerCase().includes('food') || sug.toLowerCase().includes('hotdog') ? <Coffee size={12} /> : <Navigation size={12} />}
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(31, 41, 55, 0.85)', padding: '1rem 1.25rem', borderRadius: '18px 18px 18px 4px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse-dot 1.5s infinite' }} />
            <div style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse-dot 1.5s infinite 0.2s' }} />
            <div style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse-dot 1.5s infinite 0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'rgba(3, 7, 18, 0.95)', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask your stadium assistant..."
            style={{ 
              flex: 1, background: 'transparent', border: 'none', 
              padding: '0.5rem 1rem', color: 'white', outline: 'none', fontSize: '0.95rem'
            }}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            style={{ 
              width: '2.5rem', height: '2.5rem', borderRadius: '50%', 
              background: input.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: input.trim() ? 'white' : 'rgba(255,255,255,0.3)', border: 'none', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              boxShadow: input.trim() ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none'
            }}
          >
            <Send size={16} style={{ transform: 'translateX(2px)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
