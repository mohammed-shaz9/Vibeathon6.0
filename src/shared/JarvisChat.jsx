import React, { useState, useRef, useEffect } from 'react';
import { apiPost } from './api';

export default function JarvisChat({ onAddToCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'jarvis',
      text: 'Greetings! I am Jarvis, your AI Culinary Concierge at Azzurro Caffè. How can I assist your dining experience today?',
      recommendations: [
        { name: 'Hyderabadi Dum Biryani', price: 349, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' },
        { name: 'Classic Tiramisu', price: 249, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 60);
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await apiPost('/api/ai/chat', { userPrompt: userText });
      const reply = res.reply || 'Hello! Welcome to Azzurro Caffè. I can assist you with our menu, table QR ordering, or recommendations!';
      
      let recs = [];
      const lower = userText.toLowerCase();
      if (lower.includes('biryani') || lower.includes('spicy') || lower.includes('main')) {
        recs = [{ name: 'Hyderabadi Dum Biryani', price: 349, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' }];
      } else if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('cake') || lower.includes('tiramisu')) {
        recs = [{ name: 'Molten Lava Cake', price: 279, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500' }];
      } else if (lower.includes('drink') || lower.includes('beverage') || lower.includes('coffee') || lower.includes('mojito')) {
        recs = [{ name: 'Classic Virgin Mojito', price: 139, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500' }];
      }

      setMessages(prev => [...prev, { sender: 'jarvis', text: reply, recommendations: recs }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'jarvis', text: 'Hello! I am Jarvis at your service. How may I help you choose your meal today?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          right: '28px',
          bottom: '28px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
          color: '#000',
          border: '2px solid rgba(255,255,255,0.7)',
          fontSize: '28px',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(212, 175, 55, 0.6), 0 0 25px rgba(0,0,0,0.9)',
          zIndex: 999999,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        title="Chat with Jarvis AI Waiter"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Floating Chatbot Widget Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          right: '28px',
          bottom: '104px',
          width: 'min(440px, 94vw)',
          height: '580px',
          background: '#080a0d',
          border: '2px solid rgba(212, 175, 55, 0.8)',
          borderRadius: '24px',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.98), 0 0 45px rgba(212, 175, 55, 0.35)',
          backdropFilter: 'blur(28px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999999,
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          
          {/* Header */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.15)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', display: 'grid', placeItems: 'center', fontSize: '22px', color: '#000', fontWeight: '700', boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}>
                🤖
              </div>
              <div>
                <strong style={{ color: 'gold', fontFamily: "'Space Grotesk', sans-serif", fontSize: '17px', display: 'block', letterSpacing: '0.02em' }}>Jarvis AI Concierge</strong>
                <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '700' }}>⚡ Groq LLM Active</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 0, color: '#94A3B8', fontSize: '22px', cursor: 'pointer', padding: '4px 8px' }}>
              ✕
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'rgba(0,0,0,0.5)'
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', display: 'flex', flexDirection: 'column' }}>
                
                {/* Sender Badge */}
                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: m.sender === 'user' ? 'gold' : '#94A3B8',
                  marginBottom: '4px',
                  textAlign: m.sender === 'user' ? 'right' : 'left',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {m.sender === 'user' ? '👤 You' : '🤖 Jarvis AI'}
                </div>

                {/* Message Bubble */}
                <div style={{
                  background: m.sender === 'user' ? 'linear-gradient(135deg, #D4AF37, #F59E0B)' : 'rgba(255, 255, 255, 0.08)',
                  color: m.sender === 'user' ? '#000000' : '#FFFFFF',
                  border: m.sender === 'user' ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                  padding: '14px 18px',
                  borderRadius: m.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontWeight: m.sender === 'user' ? '700' : '400',
                  boxShadow: m.sender === 'user' ? '0 4px 16px rgba(212, 175, 55, 0.4)' : '0 4px 16px rgba(0,0,0,0.4)',
                  wordBreak: 'break-word'
                }}>
                  {m.text}
                </div>

                {/* AI Item Recommendation Cards */}
                {m.recommendations && m.recommendations.length > 0 && (
                  <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
                    {m.recommendations.map((rec, rIdx) => (
                      <div key={rIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '12px 14px', borderRadius: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={rec.image} alt={rec.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>{rec.name}</div>
                            <div className="mono" style={{ color: 'gold', fontSize: '13px', fontWeight: '700' }}>₹{rec.price}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddToCart && onAddToCart(rec)}
                          style={{ background: 'gold', color: '#000', border: 0, padding: '8px 14px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'gold', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(212, 175, 55, 0.1)', padding: '10px 16px', borderRadius: '14px' }}>
                <span style={{ animation: 'pulse 1s infinite' }}>⏳</span> Jarvis is typing a reply...
              </div>
            )}
            <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
          </div>

          {/* Redesigned Sleek Input Form */}
          <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid rgba(212, 175, 55, 0.3)', background: '#0b0d11', display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Jarvis (e.g. 'Hi', 'Recommend Biryani')..."
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '14px',
                padding: '14px 18px',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                height: '48px',
                padding: '0 22px',
                background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
                color: '#000000',
                border: 0,
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.4)',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Send</span> ✈️
            </button>
          </form>

        </div>
      )}
    </>
  );
}
