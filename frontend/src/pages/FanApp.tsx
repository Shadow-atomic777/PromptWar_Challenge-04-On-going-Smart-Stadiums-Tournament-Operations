import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, MapPin } from 'lucide-react';

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
    text: "👋 Welcome to OmniStadium! I'm your AI assistant. I can help you find the shortest queues, navigate the stadium, or check the weather. What do you need?",
    timestamp: new Date().toISOString(),
    suggestions: ["Where should I eat?", "Find me a restroom", "What's the score?"]
  }]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        text: "Sorry, I'm having trouble connecting to the OmniStadium network.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Header */}
      <header className="glass-panel" style={{ padding: '1rem', borderBottom: '1px solid var(--border)', borderRadius: 0, display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link to="/" style={{ color: 'var(--text-main)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }} className="text-gradient">OmniStadium Fan App</h2>
          <div className="text-success" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={12} /> Section: North Lower
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'fan' ? 'flex-end' : 'flex-start' }}>
            {msg.sender === 'ai' && msg.agents_used && (
              <div className="text-primary" style={{ fontSize: '0.65rem', marginBottom: '0.25rem', display: 'flex', gap: '0.25rem', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <Sparkles size={10} /> {msg.agents_used.join(' + ')}
              </div>
            )}
            <div style={{
              background: msg.sender === 'fan' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--bg-panel)',
              color: msg.sender === 'fan' ? 'white' : 'var(--text-main)',
              padding: '0.75rem 1rem',
              borderRadius: msg.sender === 'fan' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
              maxWidth: '85%',
              border: msg.sender === 'ai' ? '1px solid var(--border)' : 'none',
              boxShadow: msg.sender === 'fan' ? '0 4px 15px var(--primary-glow)' : 'none',
              lineHeight: 1.4
            }} className="animate-fade-in">
              <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
            </div>

            {msg.suggestions && msg.suggestions.length > 0 && msg.id === messages[messages.length - 1].id && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }} className="animate-fade-in">
                {msg.suggestions.map((sug, i) => (
                  <button key={i} onClick={() => handleSend(sug)} className="badge" style={{ 
                    background: 'var(--bg-panel-hover)', border: '1px solid var(--border)', 
                    color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem 1rem', textTransform: 'none' 
                  }}>
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-panel)', padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0', width: 'fit-content' }}>
            <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', animation: 'pulse-glow 1s infinite' }} />
            <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.2s' }} />
            <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-panel" style={{ padding: '1rem', borderTop: '1px solid var(--border)', borderRadius: 0, display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Ask about queues, food, or navigation..."
          style={{ 
            flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-full)', padding: '0.75rem 1rem', color: 'white',
            outline: 'none'
          }}
        />
        <button 
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
          style={{ 
            width: '3rem', height: '3rem', borderRadius: '50%', 
            background: input.trim() ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--bg-panel)',
            color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
          }}
        >
          <Send size={18} style={{ transform: 'translateX(2px)' }} />
        </button>
      </div>
    </div>
  );
}
