import React, { useState, useEffect } from 'react';
import { apiPost } from '../../shared/api';
import { supabase } from '../../shared/supabase';
import { safeStorage } from '../../shared/storage';

export default function LoginPage({ nav }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [toast, setToast] = useState('');

  const mockGoogleAccounts = [
    { name: 'Anas Khan', email: 'anas.khan@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Anas+Khan&background=4285F4&color=fff' },
    { name: 'Alex Rivera', email: 'alex.rivera@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=0F9D58&color=fff' },
    { name: 'Sam Wilson', email: 'sam.wilson@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Sam+Wilson&background=F4B400&color=fff' }
  ];

  const handleSelectGoogleAccount = (name, email) => {
    safeStorage.setItem('azzurro_customer_name', name);
    safeStorage.setItem('azzurro_customer_email', email);
    setToast('Authenticated as Google Account');
    setTimeout(() => {
      setToast('');
      setShowGoogleModal(false);
      nav.go('/order.html?simulation=1');
    }, 1500);
  };

  // Check if we already have a logged in user via OAuth
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setGoogleUser(session.user);
          // Set demo customer info to trigger the simulator workflow
          safeStorage.setItem('azzurro_customer_name', session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0]);
          safeStorage.setItem('azzurro_customer_email', session.user.email);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setGoogleUser(session.user);
          safeStorage.setItem('azzurro_customer_name', session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0]);
          safeStorage.setItem('azzurro_customer_email', session.user.email);
        } else {
          setGoogleUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const roles = [
    { name: 'Admin / Manager', email: 'admin@azzurro.demo', icon: 'fa-user-tie' },
    { name: 'Kitchen KDS', email: 'kitchen@azzurro.demo', icon: 'fa-fire-burner' },
    { name: 'Waiter Panel', email: 'waiter@azzurro.demo', icon: 'fa-bell-concierge' },
    { name: 'Host Stand / Allotment', email: 'host@azzurro.demo', icon: 'fa-clipboard-user' },
    { name: 'Guest / Customer Menu', email: 'customer@azzurro.demo', icon: 'fa-utensils' }
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

  const handleGoogleOAuth = async () => {
    if (supabase) {
      setLoading(true);
      try {
        const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const prodOrigin = isLocalHost ? window.location.origin : 'https://vibeathon6-0.vercel.app';

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${prodOrigin}/order.html`,
            queryParams: {
              prompt: 'select_account'
            }
          }
        });
        if (error) throw error;
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    } else {
      setShowGoogleModal(true);
    }
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
          <p style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '14px' }}>Choose a staff portal to log in instantly, or log in as a Customer on the right:</p>
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

        {/* Right Side - Custom Authentication */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Google Auth for Judges / Customers */}
          <div className="ordr-card ordr-glass" style={{ padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'gold' }}>Judge & Guest Login</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Authenticate with your real Gmail account to run the Interactive Table Allotment and QR Dining flow.</p>
            <button 
              onClick={handleGoogleOAuth}
              disabled={loading}
              style={{
                background: '#fff',
                color: '#000',
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '14px 20px',
                width: '100%',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '15px'
              }}
            >
              <i className="fa-brands fa-google" style={{ color: '#4285F4' }}></i>
              Continue with Google Account
            </button>
          </div>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>— OR STAFF ACCESS —</div>

          {/* Form for Staff Creds */}
          <div className="ordr-card ordr-glass" style={{ padding: '30px', borderRadius: '20px' }}>
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
                  marginTop: '10px'
                }}
              >
                {loading ? 'Verifying...' : 'Access Portal'}
              </button>
            </form>
          </div>
        </section>

      </main>

      {/* Google Auth Modal */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', width: 'min(400px, 90%)', padding: '24px',
            color: '#202124', fontFamily: 'Roboto, Arial, sans-serif'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <i className="fa-brands fa-google" style={{ color: '#4285F4', fontSize: '32px', marginBottom: '12px' }}></i>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '400' }}>Sign in with Google</h2>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#5f6368' }}>Choose an account to continue to Azzurro</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              {mockGoogleAccounts.map((acc, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSelectGoogleAccount(acc.name, acc.email)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    borderRadius: '8px', borderBottom: '1px solid #f1f3f4', textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={acc.avatar} alt={acc.name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#3c4043' }}>{acc.name}</div>
                    <div style={{ fontSize: '12px', color: '#5f6368' }}>{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid #e8eaed', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#3c4043', fontWeight: '500' }}>Use another Google Account</p>
              <input 
                type="text" placeholder="Full Name" value={customGoogleName} onChange={e => setCustomGoogleName(e.target.value)}
                style={{ padding: '10px 12px', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '14px' }}
              />
              <input 
                type="email" placeholder="Email address" value={customGoogleEmail} onChange={e => setCustomGoogleEmail(e.target.value)}
                style={{ padding: '10px 12px', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '14px' }}
              />
              <button 
                onClick={() => {
                  if (customGoogleName && customGoogleEmail) handleSelectGoogleAccount(customGoogleName, customGoogleEmail);
                }}
                style={{
                  background: '#1a73e8', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px',
                  fontWeight: '500', cursor: 'pointer'
                }}
              >
                Next
              </button>
            </div>

            <button 
              onClick={() => setShowGoogleModal(false)}
              style={{
                marginTop: '16px', width: '100%', background: 'transparent', border: 'none', color: '#5f6368',
                cursor: 'pointer', fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#0f1115', borderLeft: '3px solid #10b981', color: '#fff',
          padding: '12px 24px', borderRadius: '8px', zIndex: 1100, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <i className="fa-solid fa-circle-check" style={{ color: '#10b981', marginRight: '8px' }}></i>
          {toast}
        </div>
      )}
    </div>
  );
}
