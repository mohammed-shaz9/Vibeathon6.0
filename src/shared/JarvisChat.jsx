import React, { useState, useRef, useEffect } from 'react';
import { apiPost } from './api';

const MENU_CATALOG = [
  { name: 'Paneer Tikka', price: 249, category: 'veg', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500' },
  { name: 'Veg Dum Biryani', price: 279, category: 'veg', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' },
  { name: 'Dal Makhani', price: 249, category: 'veg', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500' },
  { name: 'Palak Paneer', price: 269, category: 'veg', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500' },
  { name: 'Paneer Lababdar', price: 289, category: 'veg', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500' },
  { name: 'Truffle Mushroom Risotto', price: 389, category: 'veg', image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500' },
  { name: 'Mushroom Bruschetta', price: 219, category: 'vegan', image: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=500' },
  { name: 'Crispy Corn Chili Pepper', price: 199, category: 'vegan', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500' },
  { name: 'Thai Green Curry Veg', price: 299, category: 'vegan', image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500' },
  { name: 'Hyderabadi Chicken Biryani', price: 349, category: 'nonveg', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500' },
  { name: 'Butter Chicken', price: 349, category: 'nonveg', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500' },
  { name: 'Mutton Rogan Josh', price: 429, category: 'nonveg', image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=500' },
  { name: 'Amritsari Fish Fry', price: 379, category: 'nonveg', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500' },
  { name: 'Classic Tiramisu', price: 249, category: 'dessert', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500' },
  { name: 'Molten Lava Cake', price: 279, category: 'dessert', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500' },
  { name: 'Classic Virgin Mojito', price: 139, category: 'beverage', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500' },
  { name: 'Mango Lassi', price: 119, category: 'beverage', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500' }
];

export default function JarvisChat({ onAddToCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'jarvis',
      text: "Greetings! I am Jarvis, your AI Culinary Concierge at Azzurro Caffè. Let's personalize your dining experience!",
      onboarding: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({ diet: null, guests: null, spice: null });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 60);
    }
  }, [messages, isOpen, loading]);

  const extractRecommendations = (text) => {
    const lower = text.toLowerCase();
    const matched = MENU_CATALOG.filter(item => lower.includes(item.name.toLowerCase()));
    return matched.length > 0 ? matched : null;
  };

  const processQuery = async (queryText, currentMessages) => {
    if (!queryText.trim() || loading) return;

    const userText = queryText.trim();
    setInput('');
    const updatedMessages = [...currentMessages, { sender: 'user', text: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      let reply = '';
      try {
        const res = await apiPost('/api/ai/chat', { 
          userPrompt: userText,
          history: updatedMessages
        });
        reply = res.reply || '';
      } catch (e) {}

      // Fallback context-aware generator if offline
      if (!reply) {
        const lower = userText.toLowerCase();
        if (lower.includes('4 veg') || (lower.includes('veg') && lower.includes('4'))) {
          reply = "Here are 4 of our finest Vegetarian signature dishes:\n\n• **Paneer Tikka** (₹249): Char-grilled cottage cheese with spiced yogurt glaze\n• **Veg Dum Biryani** (₹279): Fragrant basmati rice dum-cooked with fresh garden veggies\n• **Dal Makhani Royal** (₹249): Overnight slow-cooked black lentils in churned butter\n• **Truffle Mushroom Risotto** (₹389): Arborio rice simmered with wild mushrooms & black truffle butter";
        } else if (lower.includes('veg') && !lower.includes('non')) {
          reply = "Here are our top Vegetarian recommendations:\n\n• **Paneer Tikka** (₹249): Tender cottage cheese charred in tandoor glaze\n• **Palak Paneer** (₹269): Fresh cottage cheese in silky spinach puree\n• **Paneer Lababdar** (₹289): Rich cottage cheese in tomato cashew gravy";
        } else if (lower.includes('non') || lower.includes('chicken') || lower.includes('mutton') || lower.includes('meat')) {
          reply = "Here are our top Non-Vegetarian specialties:\n\n• **Hyderabadi Chicken Biryani** (₹349): Layered saffron rice with marinated chicken\n• **Butter Chicken** (₹349): Tender chicken in rich creamy tomato butter gravy\n• **Mutton Rogan Josh** (₹429): Traditional Kashmiri lamb curry braised with chilies";
        } else if (lower.includes('vegan')) {
          reply = "Here are our 100% Plant-Based Vegan delights:\n\n• **Mushroom Bruschetta** (₹219): Toasted sourdough with garlic mushrooms\n• **Crispy Corn Chili Pepper** (₹199): Sweet corn wok-tossed with green chili\n• **Thai Green Curry Veg** (₹299): Coconut milk curry with kaffir lime & tofu";
        } else {
          reply = "Welcome to Azzurro Caffè! Here are our chef recommendations:\n\n• **Hyderabadi Chicken Biryani** (₹349): Fragrant saffron rice with signature spices\n• **Paneer Tikka** (₹249): Char-grilled cottage cheese in savory glaze\n• **Classic Tiramisu** (₹249): Italian ladyfingers layered with mascarpone cream";
        }
      }

      const recs = extractRecommendations(reply) || extractRecommendations(userText);
      setMessages(prev => [...prev, { sender: 'jarvis', text: reply, recommendations: recs }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'jarvis', 
        text: "Here are our chef recommendations for you:\n\n• **Paneer Tikka** (₹249): Char-grilled cottage cheese\n• **Hyderabadi Dum Biryani** (₹349): Fragrant layered saffron rice\n• **Classic Tiramisu** (₹249): Italian mascarpone espresso dessert",
        recommendations: [
          MENU_CATALOG[0],
          MENU_CATALOG[9],
          MENU_CATALOG[13]
        ]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    processQuery(input, messages);
  };

  const handleOnboardingSelect = (type, value) => {
    const nextProfile = { ...userProfile, [type]: value };
    setUserProfile(nextProfile);

    let prompt = '';
    if (type === 'diet') {
      prompt = `I prefer ${value} food.`;
    } else if (type === 'guests') {
      prompt = `We are dining as a group of ${value}.`;
    } else if (type === 'spice') {
      prompt = `We prefer ${value} flavor profile. Recommend top 4 items for us.`;
    }

    processQuery(prompt, messages);
  };

  return (
    <>
      {/* Floating AI Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          right: '28px',
          top: '200px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
          color: '#000',
          border: '2px solid rgba(255,255,255,0.8)',
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
          top: '276px',
          width: 'min(440px, 94vw)',
          height: 'min(500px, 65vh)',
          background: '#090b0e',
          border: '2px solid rgba(212, 175, 55, 0.8)',
          borderRadius: '24px',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.98), 0 0 45px rgba(212, 175, 55, 0.35)',
          backdropFilter: 'blur(28px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 999999,
          overflow: 'hidden',
          boxSizing: 'border-box',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          
          {/* Header */}
          <div style={{
            height: '64px',
            flexShrink: 0,
            background: '#0f1115',
            borderBottom: '2px solid rgba(212, 175, 55, 0.4)',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', display: 'grid', placeItems: 'center', fontSize: '20px', color: '#000', fontWeight: '800' }}>
                🤖
              </div>
              <div>
                <strong style={{ color: 'gold', fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', display: 'block', margin: 0 }}>Jarvis AI Assistant</strong>
                <span style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', display: 'block' }}>⚡ Groq LLM Multi-Key Active</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 0, color: '#94A3B8', fontSize: '22px', cursor: 'pointer', padding: '4px 8px' }}>
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            minHeight: '0',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'rgba(0,0,0,0.6)',
            boxSizing: 'border-box'
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
                  padding: '12px 16px',
                  borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontWeight: m.sender === 'user' ? '700' : '400',
                  boxShadow: m.sender === 'user' ? '0 4px 16px rgba(212, 175, 55, 0.4)' : '0 4px 16px rgba(0,0,0,0.4)',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word'
                }}>
                  {m.text}
                </div>

                {/* Interactive Onboarding Questions (Only shown on initial greeting) */}
                {m.onboarding && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', padding: '14px', borderRadius: '14px' }}>
                    
                    {/* Q1: Dietary Preference */}
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'gold', display: 'block', marginBottom: '6px' }}>1. Select Your Diet:</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['🥦 Pure Veg', '🍗 Non-Veg', '🌱 Vegan'].map(d => (
                          <button
                            key={d}
                            onClick={() => handleOnboardingSelect('diet', d)}
                            style={{
                              background: userProfile.diet === d ? 'gold' : 'rgba(255,255,255,0.08)',
                              color: userProfile.diet === d ? '#000' : '#fff',
                              border: '1px solid rgba(212,175,55,0.4)',
                              borderRadius: '20px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Q2: Party Size */}
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'gold', display: 'block', marginBottom: '6px' }}>2. Dining Guests:</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['👤 1-2 Guests', '👥 3-4 Guests', '🎉 5+ Guests'].map(g => (
                          <button
                            key={g}
                            onClick={() => handleOnboardingSelect('guests', g)}
                            style={{
                              background: userProfile.guests === g ? 'gold' : 'rgba(255,255,255,0.08)',
                              color: userProfile.guests === g ? '#000' : '#fff',
                              border: '1px solid rgba(212,175,55,0.4)',
                              borderRadius: '20px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Q3: Flavor Preference */}
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'gold', display: 'block', marginBottom: '6px' }}>3. Flavor Preference:</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['🌶️ Spicy & Bold', '🧈 Rich & Creamy', '🍰 Sweets & Desserts'].map(s => (
                          <button
                            key={s}
                            onClick={() => handleOnboardingSelect('spice', s)}
                            style={{
                              background: userProfile.spice === s ? 'gold' : 'rgba(255,255,255,0.08)',
                              color: userProfile.spice === s ? '#000' : '#fff',
                              border: '1px solid rgba(212,175,55,0.4)',
                              borderRadius: '20px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* AI Item Recommendation Cards */}
                {m.recommendations && m.recommendations.length > 0 && (
                  <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                    {m.recommendations.map((rec, rIdx) => (
                      <div key={rIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '10px 12px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={rec.image} alt={rec.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{rec.name}</div>
                            <div className="mono" style={{ color: 'gold', fontSize: '12px', fontWeight: '700' }}>₹{rec.price}</div>
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
              <div style={{ alignSelf: 'flex-start', color: 'gold', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(212, 175, 55, 0.1)', padding: '8px 14px', borderRadius: '12px' }}>
                <span style={{ animation: 'pulse 1s infinite' }}>⏳</span> Jarvis is formulating your recommendations...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{
            height: '72px',
            flexShrink: 0,
            background: '#07080b',
            borderTop: '2px solid rgba(212, 175, 55, 0.4)',
            padding: '0 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Jarvis (e.g. 'suggest 4 veg dishes')..."
              style={{
                flex: 1,
                height: '46px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '12px',
                padding: '0 16px',
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
                height: '46px',
                padding: '0 20px',
                background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
                color: '#000000',
                border: 0,
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '14px',
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
