import React, { useState, useRef, useEffect } from 'react';
import { apiPost, apiGet } from './api';

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
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await apiPost('/api/ai/insights', {
        revenue: 14285000,
        total_orders: 38420,
        top_dish: 'Hyderabadi Dum Biryani',
        low_stock_items: [],
        userPrompt: userText
      });

      const reply = res.insights || 'I highly recommend our signature Hyderabadi Dum Biryani paired with a refreshing Virgin Mojito!';
      
      let recs = [];
      const lower = userText.toLowerCase();
      if (lower.includes('biryani') || lower.includes('spicy') || lower.includes('main')) {
        recs = [{ name: 'Hyderabadi Dum Biryani', price: 349, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' }];
      } else if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('cake')) {
        recs = [{ name: 'Molten Lava Cake', price: 279, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500' }];
      } else if (lower.includes('drink') || lower.includes('beverage') || lower.includes('coffee')) {
        recs = [{ name: 'Classic Virgin Mojito', price: 139, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500' }];
      } else {
        recs = [
          { name: 'Paneer Tikka Multani', price: 249, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500' },
          { name: 'Butter Chicken Deluxe', price: 349, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500' }
        ];
      }

      setMessages(prev => [...prev, { sender: 'jarvis', text: reply, recommendations: recs }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'jarvis', text: 'I am at your service! Try our Chef Special Paneer Tikka or Mango Lassi.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
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
          border: '2px solid rgba(255,255,255,0.4)',
          fontSize: '28px',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(212, 175, 55, 0.5), 0 0 20px rgba(0,0,0,0.8)',
          zIndex: 99999,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        title="Chat with Jarvis AI Waiter"
      >
        🤖
      </button>

      {/* Floating Chatbot Widget Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          right: '28px',
          bottom: '104px',
          width: 'min(420px, 92vw)',
          height: '560px',
          background: 'rgba(9, 11, 14, 0.95)',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(212, 175, 55, 0.25)',
          backdropFilter: 'blur(24px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 99999,
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          
          {/* Header */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.1)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'gold', display: 'grid', placeItems: 'center', fontSize: '20px', color: '#000', fontWeight: '700' }}>
                🤖
              </div>
              <div>
                <strong style={{ color: 'gold', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', display: 'block' }}>Jarvis AI Waiter</strong>
                <span style={{ color: '#10B981', fontSize: '11px', fontWeight: '600' }}>⚡ Powered by Groq AI Engine</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 0, color: '#94A3B8', fontSize: '20px', cursor: 'pointer' }}>
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  background: m.sender === 'user' ? 'gold' : 'rgba(255,255,255,0.06)',
                  color: m.sender === 'user' ? '#000' : '#F8FAFC',
                  border: m.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  padding: '12px 16px',
                  borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontWeight: m.sender === 'user' ? '600' : '400'
                }}>
                  {m.text}
                </div>

                {/* AI Item Recommendation Cards */}
                {m.recommendations && m.recommendations.length > 0 && (
                  <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                    {m.recommendations.map((rec, rIdx) => (
                      <div key={rIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', padding: '10px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={rec.image} alt={rec.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{rec.name}</div>
                            <div className="mono" style={{ color: 'gold', fontSize: '12px' }}>₹{rec.price}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddToCart && onAddToCart(rec)}
                          style={{ background: 'gold', color: '#000', border: 0, padding: '6px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
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
              <div style={{ alignSelf: 'flex-start', color: '#94A3B8', fontSize: '13px', fontStyle: 'italic' }}>
                Jarvis is analyzing menu pairings...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Jarvis for dish recommendations..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'gold',
                color: '#000',
                border: 0,
                padding: '12px 18px',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </form>

        </div>
      )}
    </>
  );
}
