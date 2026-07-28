import React, { useState } from 'react';
import { apiPost } from '../../shared/api';

const destinations = {
  customer: '/features/customer/order.html',
  kitchen: '/features/kitchen/kitchen.html',
  waiter: '/features/waiter/waiter.html',
  host: '/features/host/host.html',
  admin: '/features/admin/admin.html',
  inventory: '/features/admin/admin.html'
};

export default function LoginPage({ nav }) {
  const requestedRole = new URLSearchParams(window.location.search).get('role') || 'customer';
  const [email, setEmail] = useState(`${requestedRole}@azzurro.demo`);
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goToRole = (role) => {
    nav.go(destinations[role] || '/features/customer/order.html');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/login', { email, password });
      localStorage.setItem('azzurro_user', JSON.stringify(data.user));
      goToRole(data.user.role);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/google', {
        redirectTo: `${window.location.origin}/login.html?role=${requestedRole}`
      });
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
      if (data?.user) {
        localStorage.setItem('azzurro_user', JSON.stringify(data.user));
        goToRole(data.user.role || requestedRole);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="card login-card auth-shell">
        <div className="auth-brand">
          <p className="auth-kicker">ORDR Portal</p>
          <h1 className="auth-title">AZZURRO CAFFÈ</h1>
          <p className="muted">Sign in to your restaurant portal</p>
        </div>

        <button className="btn btn-outline btn-full google-btn" type="button" onClick={signInWithGoogle} disabled={loading}>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={submit} className="auth-form">
          <label className="field">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p role="alert" style={{ color: '#EF4444', margin: 0 }}>{error}</p>}
          <button className="btn btn-full" disabled={loading}>Sign in</button>
        </form>

        <details className="demo-box">
          <summary>Demo Credentials</summary>
          <ul>
            <li>admin@azzurro.demo / password123</li>
            <li>kitchen@azzurro.demo / password123</li>
            <li>waiter@azzurro.demo / password123</li>
            <li>host@azzurro.demo / password123</li>
          </ul>
        </details>
      </section>
    </main>
  );
}
