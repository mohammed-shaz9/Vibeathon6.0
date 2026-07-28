import React from 'react';

export default function LandingPage({ nav }) {
  return (
    <div className="app-shell">
      <button id="scrollToTopButton" className="scroll-to-top-btn"><i className="fas fa-arrow-up"></i></button>
      <div id="menuOverlay"></div>
      <header>
        <div className="container">
          <nav id="navbar">
            <div className="logo">
              <i className="fa-solid fa-a" style={{ color: '#fff' }}></i>
              <a href="/index.html">zzurro <i><b>C</b></i>affè</a>
            </div>
            <div id="rightSide">
              <ul id="navLinks">
                <li><a href="/index.html">Home</a></li>
                <li><a href="/order.html">Menu</a></li>
                <li><a href="#contactUs">Contact</a></li>
                <li><a href="/about.html">About us</a></li>
                <li><a href="/login.html" style={{ color: '#d4af37' }}>ORDR Portal</a></li>
              </ul>
              <i className="fa-solid fa-bars" id="menuToggle"></i>
            </div>
          </nav>
        </div>
      </header>
      <section>
        <div className="sectionOne">
          <video autoPlay muted loop className="bg-video">
            <source src="/assets/Restaur.mp4" type="video/mp4" />
          </video>
          <h1>Enjoy Our Delicious Meal,"Delight in Our Delectable Meals!</h1>
          <p>
            Savor the perfect blend of flavors crafted to satisfy your taste buds. Our dishes are prepared with the utmost care, bringing together quality ingredients and culinary excellence. Experience a feast that indulges your senses and leaves you craving for more!
          </p>
        </div>
      </section>
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
    </div>
  );
}
