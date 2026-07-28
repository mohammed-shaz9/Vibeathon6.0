import React, { useState } from 'react';

export default function LoginPage({ nav }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { name: 'Admin / Manager', email: 'admin@azzurro.demo', icon: 'fa-user-tie' },
    { name: 'Kitchen KDS', email: 'kitchen@azzurro.demo', icon: 'fa-fire-burner' },
    { name: 'Waiter Panel', email: 'waiter@azzurro.demo', icon: 'fa-bell-concierge' },
    { name: 'Host Stand / Door Allotment', email: 'host@azzurro.demo', icon: 'fa-clipboard-user' },
    { name: 'Guest Ordering Portal', email: 'customer@azzurro.demo', icon: 'fa-utensils' }
  ];

  const selectRole = (emailAddr) => {
    setEmail(emailAddr);
    setError('');
  };

  const destinations = {
    'admin@azzurro.demo': '/features/admin/admin.html',
    'kitchen@azzurro.demo': '/features/kitchen/kitchen.html',
    'waiter@azzurro.demo': '/features/waiter/waiter.html',
    'host@azzurro.demo': '/features/host/host.html',
    'customer@azzurro.demo': '/order.html'
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!email) {
      setError('Please select a staff role or enter your email');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate auth check matching backend
    setTimeout(() => {
      setLoading(false);
      if (password === 'password123') {
        const routeDest = destinations[email] || '/order.html';
        nav.go(routeDest);
      } else {
        setError('Invalid password');
      }
    }, 400);
  };

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: '#0b0d11', color: '#fff', paddingTop: '90px' }}>
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
                <li><a href="#" onClick={(e) => { e.preventDefault(); nav.go('/about.html'); }}>About us</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Left Side - Quick Demo Select */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ color: 'gold', margin: '0 0 10px 0', fontFamily: 'Raleway, sans-serif' }}>Select Staff Role</h2>
          <p style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '14px' }}>Choose a portal to log in instantly using built-in restaurant demo credentials:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {roles.map((r) => (
              <button 
                key={r.email}
                onClick={() => selectRole(r.email)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: email === r.email ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: email === r.email ? '2px solid gold' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: email === r.email ? 'gold' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className={`fa-solid ${r.icon}`} style={{ fontSize: '20px', width: '24px', textAlign: 'center' }}></i>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{r.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.email}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Right Side - Login Form */}
        <section style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="ordr-card ordr-glass" style={{ padding: '30px', borderRadius: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'gold', textAlign: 'center', fontSize: '22px' }}>ORDR Portal Authentication</h3>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Selected Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Select a role or type email..."
                  required
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: '#0b0d11',
                    color: '#fff'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Access Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: '#0b0d11',
                    color: '#fff'
                  }}
                />
              </div>

              {error && <p style={{ color: '#ef4444', margin: 0, fontSize: '13px' }}>{error}</p>}

              <button 
                disabled={loading} 
                style={{
                  background: 'gold',
                  color: '#000',
                  fontWeight: '700',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginTop: '10px',
                  transition: 'opacity 0.2s'
                }}
              >
                {loading ? 'Verifying...' : 'Access Portal'}
              </button>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
}
