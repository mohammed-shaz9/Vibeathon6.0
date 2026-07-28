import React from 'react';

export default function AboutPage({ nav }) {
  return (
    <div className="app-shell">
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
                <li><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/#contactUs'); }}>Contact</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/about.html'); }}>About us</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/login.html'); }} style={{ color: '#d4af37' }}>ORDR Portal</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </header>

      <div style={{ paddingTop: '120px', paddingBottom: '60px', background: '#0b0d11', minHeight: '100vh' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            {/* Image Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <img src="/assets/about-1.jpg" alt="About 1" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', height: '200px' }} />
              <img src="/assets/about-2.jpg" alt="About 2" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', height: '200px', marginTop: '32px' }} />
              <img src="/assets/about-3.jpg" alt="About 3" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', height: '200px' }} />
              <img src="/assets/about-4.jpg" alt="About 4" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', height: '200px', marginTop: '32px' }} />
            </div>

            {/* Text Content */}
            <div style={{ color: '#fff' }}>
              <h1 style={{ color: 'gold', fontFamily: 'Space Grotesk, sans-serif', fontSize: '36px', marginBottom: '20px' }}>
                Welcome to <span style={{ color: 'gold', textDecoration: 'none', border: 'none' }}>Azzurro Caffè</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                Welcome to Azzurro Caffè, where we redefine the art of dining. For over 15 years, our restaurant has been a sanctuary for food lovers, blending tradition with innovation to create unforgettable meals. Our chefs are inspired by the rich culinary heritage of cultures from around the world, carefully crafting dishes that tell a story with every bite.
              </p>
              <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
                Over the years, Azzurro Caffè has grown to become more than just a restaurant—it's a destination where family, friends, and loved ones come together to share happiness and create lasting memories.
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', padding: '24px', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                  <h2 style={{ color: 'gold', margin: '0 0 4px 0', fontSize: '36px', fontFamily: 'Space Grotesk, sans-serif' }}>15</h2>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Years of Excellence</p>
                </div>
                <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', padding: '24px', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                  <h2 style={{ color: 'gold', margin: '0 0 4px 0', fontSize: '36px', fontFamily: 'Space Grotesk, sans-serif' }}>50</h2>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Expert Chefs</p>
                </div>
              </div>
              <button
                onClick={() => nav.go('/')}
                style={{ background: 'gold', color: '#000', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
