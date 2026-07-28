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

      <div className="aboutContainer" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
        <div className="aboutWrapper">
          <div className="aboutImages">
            <div className="aboutImage firstAboutImage">
              <img src="/assets/about-1.jpg" alt="About 1" />
            </div>
            <div className="aboutImage">
              <img src="/assets/about-2.jpg" alt="About 2" />
            </div>
            <div className="aboutImage thirdAboutImage">
              <img src="/assets/about-3.jpg" alt="About 3" />
            </div>
            <div className="aboutImage lastAboutImage">
              <img src="/assets/about-4.jpg" alt="About 4" />
            </div>
          </div>
          
          <div className="aboutTextRight" style={{ color: '#fff' }}>
            <h1 id="welcomeHeader" style={{ color: 'gold' }}>
              Welcome to <span> <i className="fa-solid fa-a fa-xl" style={{ color: 'gold' }}></i>zzurro Caffè</span>
            </h1>
            <p>
              Welcome to Azzurro Caffè, where we redefine the art of dining. For over 15 years, our restaurant has been a sanctuary for food lovers, blending tradition with innovation to create unforgettable meals. Our chefs are inspired by the rich culinary heritage of cultures from around the world, carefully crafting dishes that tell a story with every bite. From the freshest ingredients to the most exquisite presentation, we ensure that every meal is a celebration of flavor, quality, and passion.
            </p>
            <p>
              Over the years, Azzurro Caffè has grown to become more than just a restaurant—it’s a destination where family, friends, and loved ones come together to share happiness and create lasting memories. From our warm, welcoming ambiance to our attentive staff who prioritize your comfort, every detail is designed to make you feel at home.
            </p>
            <div className="experienceAndChefsWrapper" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div className="experienceWrapper" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', flex: 1 }}>
                <h1>15</h1>
                <p>Years Opening</p>
              </div>
              <div className="chefsWrapper" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', flex: 1 }}>
                <h1>50</h1>
                <p>Popular Chefs</p>
              </div>
            </div>
            <button className="aboutBtn" style={{ marginTop: '20px', background: 'gold', border: 'none', padding: '10px 20px', cursor: 'pointer' }} onClick={() => nav.go('/')}>
              Back To Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
