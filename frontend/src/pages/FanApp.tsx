import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, MapPin, Trophy, Navigation, Coffee, Activity, Globe } from 'lucide-react';
import { useOpsWebSocket } from '../hooks/useOpsWebSocket';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'fan' | 'ai';
  text: string;
  timestamp: string;
  agents_used?: string[];
  suggestions?: string[];
}

export default function FanApp() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([{
    id: 'msg-1',
    sender: 'ai',
    text: t('welcome'),
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ message: text, fan_id: user?.id || "unknown", sector: user?.sector || "unknown" })
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
    <div className="fan-app-container">
      
      {/* Dynamic Stadium Background for Chat */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: pitchPattern, backgroundSize: '40px 40px', opacity: 0.8, pointerEvents: 'none' }} />

      {/* Header - Styled like a Match Ticket / Scoreboard */}
      <header className="glass-panel chat-header-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <Link to="/" aria-label="Return to landing page" style={{ color: 'var(--text-main)', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {t('assistant_title')} <Sparkles size={16} color="var(--primary)" />
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
              <MapPin size={12} color="var(--success)" /> {t('seat')}
            </div>
          </div>
          
          {/* Language Toggle Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Globe size={12} color="var(--text-muted)" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'fr' | 'ar' | 'pt' | 'de' | 'ja')}
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: 'none', padding: '4px', outline: 'none',
                fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase'
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
        </div>

        {/* Live Score Strip inside Header */}
        {wsData?.stadium?.match && (
          <div className="chat-live-score">
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
      <main className="chat-main-area" aria-live="polite">
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
            <div className={msg.sender === 'fan' ? 'chat-bubble-fan' : 'chat-bubble-ai'}>
              <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
            </div>

            {/* Agent Badges */}
            {msg.sender === 'ai' && msg.agents_used && (
              <div style={{ fontSize: '0.65rem', color: 'var(--success)', marginTop: '6px', marginLeft: '4px', display: 'flex', gap: '4px', alignItems: 'center', fontWeight: 600 }}>
                <Activity size={10} /> {t('routed_via')} {msg.agents_used.join(', ')}
              </div>
            )}

            {/* Suggestions (Quick Actions) */}
            {msg.suggestions && msg.suggestions.length > 0 && msg.id === messages[messages.length - 1].id && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {msg.suggestions.map((sug, i) => (
                  <button key={i} onClick={() => handleSend(sug)} className="chat-suggestion-btn">
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
      </main>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input 
            type="text" 
            aria-label={t('placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={t('placeholder')}
            className="chat-input-field"
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            aria-label="Send message"
            className={`chat-send-btn ${input.trim() ? 'active' : 'disabled'}`}
          >
            <Send size={16} aria-hidden="true" style={{ transform: 'translateX(2px)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
