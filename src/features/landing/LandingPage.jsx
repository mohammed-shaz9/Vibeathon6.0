import React, { useEffect, useState } from 'react';
import intro1Video from '/assets/intro1.mp4';
import intro2Video from '/assets/intro2.mp4';
import restaurVideo from '/assets/Restaur.mp4';
import JarvisChat from '../../shared/JarvisChat';

export default function LandingPage({ nav }) {
  // 1: intro1.mp4, 2: intro2.mp4, 3: completed landing page UI
  const [introStep, setIntroStep] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById('scrollToTopButton');
      if (btn) btn.style.display = window.scrollY > 300 ? 'block' : 'none';
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="app-shell">
      {/* Sequential Intro Videos Overlay */}
      {introStep < 3 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {introStep === 1 && (
            <>
              {/* 3D Rolling & Clip-Path Circle Reveal Opening Text Overlay on Video 1 */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                animation: 'circleClipReveal 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                background: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid rgba(212, 175, 55, 0.85)',
                padding: '20px 40px',
                borderRadius: '20px',
                textAlign: 'center',
                zIndex: 100000,
                boxShadow: '0 16px 50px rgba(0, 0, 0, 0.95), 0 0 35px rgba(212, 175, 55, 0.4)',
                maxWidth: '92%',
                backdropFilter: 'blur(20px)'
              }}>
                {/* 3D Rolling Crown Emblem */}
                <div style={{
                  display: 'inline-block',
                  fontSize: '32px',
                  color: 'gold',
                  marginBottom: '8px',
                  animation: 'logoRoll3D 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                }}>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.8)', display: 'block', marginBottom: '6px' }}>POWERED BY ORDR AI ENGINE v2.0</span>
                  👑
                </div>

                <div style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  fontStyle: 'italic',
                  fontSize: '26px',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textShadow: '0 2px 14px rgba(0,0,0,0.9), 0 0 12px rgba(212,175,55,0.7)',
                  lineHeight: '1.4'
                }}>
                  <span style={{ color: 'gold' }}>AZZURRO CAFFÈ</span> — WHERE CULINARY EXCELLENCE MEETS INTELLIGENT OPERATIONS
                </div>
              </div>

              <video
                src={intro1Video}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={() => setIntroStep(2)}
                onError={() => setIntroStep(2)}
                style={{ width: '100vw', height: '100vh', objectFit: 'cover' }}
              />
            </>
          )}

          {introStep === 2 && (
            <video
              src={intro2Video}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={() => setIntroStep(3)}
              onError={() => setIntroStep(3)}
              style={{ width: '100vw', height: '100vh', objectFit: 'cover' }}
            />
          )}

          {/* Skip Intro Button */}
          <button
            onClick={() => setIntroStep(3)}
            style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(212, 175, 55, 0.6)',
              color: 'gold',
              padding: '10px 22px',
              borderRadius: '20px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              backdropFilter: 'blur(10px)',
              letterSpacing: '0.05em',
              zIndex: 100001
            }}
          >
            Enter the Experience →
          </button>
        </div>
      )}
      <button id="scrollToTopButton" className="scroll-to-top-btn" onClick={scrollToTop}>
        <i className="fas fa-arrow-up"></i>
      </button>

      <header>
        <div className="container">
          <nav id="navbar">
            <div className="logo">
              <i className="fa-solid fa-a" style={{ color: '#fff' }}></i>
              <a href="#" onClick={(e) => { e.preventDefault(); nav.go('/'); }}>zzurro <i><b>C</b></i>affè</a>
            </div>
            <div id="rightSide">
              <ul id="navLinks">
                <li><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/'); }}>Home</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/order.html'); }}>Menu</a></li>
                <li><a href="#contactUs" onClick={(e) => { e.preventDefault(); document.getElementById('contactUs')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/about.html'); }}>About us</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/login.html'); }} style={{ color: '#d4af37' }}>ORDR Portal</a></li>
              </ul>
              <i className="fa-solid fa-bars" id="menuToggle"></i>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section>
        <div className="sectionOne">
          <video autoPlay muted loop playsInline preload="auto" className="bg-video">
            <source src={restaurVideo} type="video/mp4" />
          </video>
          <h1>Ignite Every Sense. Command Every Moment.</h1>
          <p>Indulge in masterfully crafted dishes that captivate your palate. Every plate is engineered with premium ingredients, executed with culinary precision — and delivered to your table faster than ever before.</p>
          <div style={{ zIndex: 3, display: 'flex', gap: '16px', margin: '0 50px' }}>
            <button
              onClick={() => nav.go('/login.html')}
              style={{ background: 'gold', color: '#000', border: 'none', padding: '16px 32px', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', letterSpacing: '0.02em' }}
            >
              Claim Your Table →
            </button>
            <button
              className="btn"
              onClick={() => nav.go('/order.html')}
              style={{ background: 'transparent', color: '#fff', border: '2px solid gold', padding: '16px 32px', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              Explore Menu
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ background: '#0b0d11', padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ color: 'gold', textAlign: 'center', fontSize: '36px', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '12px' }}>Engineered to Dominate Restaurant Operations</h2>
          <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '16px', marginBottom: '48px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>ORDR orchestrates every touchpoint — from the moment a guest scans to the instant their dish is served. Zero friction. Maximum impact.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              ['fa-qrcode', 'Instant QR Ordering', 'Scan. Browse. Fire your order — straight from your phone in seconds. No menus, no waiting, no friction.'],
              ['fa-fire-burner', 'Live Kitchen Command', 'Orders ignite on the KDS the instant they are placed. Chefs execute, bump, and dispatch with laser precision.'],
              ['fa-bell-concierge', 'Waiter Dispatch Engine', 'The moment a dish is ready, waiters are triggered instantly. Service delivered at peak velocity.'],
              ['fa-chart-line', 'AI Revenue Intelligence', 'Unlock 30-month financial telemetry, demand forecasting, and predictive inventory alerts — powered by Groq AI.'],
              ['fa-clipboard-user', 'Smart Host Command', 'Dynamically assign tables, manage the waitlist queue, and optimize your dining floor in real time.'],
              ['fa-star', 'Verified Guest Ratings', 'Guests rate every dish, every chef, every waiter. Accountability drives excellence.']
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <i className={`fa-solid ${icon}`} style={{ fontSize: '28px', color: 'gold', marginBottom: '16px', display: 'block' }}></i>
                <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>{title}</h3>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section>
        <div className="contactUs" id="contactUs">
          <div className="container">
            <h2>Contact Us</h2>
            <div className="contact-info">
              <div className="contact-item"><h3>Booking</h3><p><i className="fa fa-envelope-open"></i> Azzurro Caffè.com</p></div>
              <div className="contact-item"><h3>General</h3><p><i className="fa fa-envelope-open"></i> Azzurro@Caffè.com</p></div>
              <div className="contact-item"><h3>Technical</h3><p><i className="fa fa-envelope-open"></i> ANAS@Azzurro-Caffè.com</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            <div>
              <h3 style={{ color: 'gold', fontFamily: 'Space Grotesk, sans-serif' }}>Azzurro Caffè</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7' }}>Redefining premium dining at the heart of the city. Powered by ORDR — the AI engine that orchestrates every order, every table, every moment.</p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '16px' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/'); }} style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/order.html'); }} style={{ color: '#94a3b8', textDecoration: 'none' }}>Menu</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/about.html'); }} style={{ color: '#94a3b8', textDecoration: 'none' }}>About</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/login.html'); }} style={{ color: 'gold', textDecoration: 'none' }}>ORDR Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '16px' }}>Connect</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href="#" style={{ color: 'gold', fontSize: '20px' }}><i className="fa-brands fa-instagram"></i></a>
                <a href="#" style={{ color: 'gold', fontSize: '20px' }}><i className="fa-brands fa-twitter"></i></a>
                <a href="#" style={{ color: 'gold', fontSize: '20px' }}><i className="fa-brands fa-facebook"></i></a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '32px', paddingTop: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            © 2025 Azzurro Caffè. All rights reserved. Engineered with precision by ORDR AI Engine v2.0.
          </div>
        </div>
      </footer>

      {/* Floating Jarvis AI Waiter Concierge */}
      <JarvisChat onAddToCart={(rec) => nav.go('/order.html')} />
    </div>
  );
}
